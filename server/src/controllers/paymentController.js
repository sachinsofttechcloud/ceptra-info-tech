const crypto = require('crypto');
const db = require('../lib/db');
const razorpay = require('../lib/razorpay');
const { isAllowedEmail, isValidMobile } = require('../lib/validate');
const { sendPaymentCongratulations } = require('../lib/notify');

const buckets = new Map();

function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

function clientKey(req, action) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return `${action}:${ip}`;
}

function cleanText(value, max) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function payerReference(payment) {
  return (
    payment.vpa
    || payment.bank
    || payment.wallet
    || payment.card?.network
    || payment.email
    || payment.contact
    || null
  );
}

exports.createOrder = async (req, res) => {
  try {
    if (!rateLimit(clientKey(req, 'create-order'), 8, 60 * 1000)) {
      return sendError(res, 429, 'Too many payment attempts. Please wait a minute and try again.');
    }

    await db.ready;

    const courseSlug = cleanText(req.body?.courseSlug, 200);
    const fullName = cleanText(req.body?.fullName, 120);
    const email = cleanText(req.body?.email, 180).toLowerCase();
    const accountEmail = cleanText(req.body?.accountEmail, 180).toLowerCase();
    const mobile = cleanText(req.body?.mobile, 10).replace(/\D/g, '');
    const state = cleanText(req.body?.state, 80);

    if (!/^[a-z0-9-]+$/i.test(courseSlug)) {
      return sendError(res, 400, 'A valid course is required.');
    }
    if (fullName.length < 2) {
      return sendError(res, 400, 'Enter your full name.');
    }
    if (!isValidMobile(mobile)) {
      return sendError(res, 400, 'Enter a 10-digit mobile number.');
    }
    if (!isAllowedEmail(email)) {
      return sendError(res, 400, 'Use a Gmail address like name@gmail.com.');
    }
    if (!state) {
      return sendError(res, 400, 'Select your state.');
    }
    if (!isAllowedEmail(accountEmail)) {
      return sendError(res, 401, 'Sign in with a Gmail address or an admin email before paying.');
    }

    const account = await db.accountCanPay(accountEmail);
    if (!account) {
      return sendError(res, 401, 'Sign in with a registered account before paying.');
    }

    const course = await db.getCourseBySlug(courseSlug);
    const amountRupees = Number(course?.price);
    if (!course || !Number.isInteger(amountRupees) || amountRupees < 1 || amountRupees > 1000000) {
      return sendError(res, 400, 'This course is not available for online payment.');
    }

    const amountPaise = amountRupees * 100;
    const receipt = `rcp_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`.slice(0, 40);
    const order = await razorpay.createOrder({
      amountPaise,
      receipt,
      courseSlug: course.slug,
    });

    if (!order?.id || Number(order.amount) !== amountPaise || order.currency !== 'INR') {
      return sendError(res, 502, 'Razorpay did not return a valid order.');
    }

    await db.saveRazorpayOrder({
      orderId: order.id,
      receipt,
      courseSlug: course.slug,
      courseTitle: course.title,
      studentName: fullName,
      studentEmail: email || null,
      accountEmail,
      studentMobile: mobile,
      studentState: state,
      amountRupees,
      amountPaise,
    });

    return res.status(201).json({
      success: true,
      keyId: razorpay.getCredentials().keyId,
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      courseTitle: course.title,
    });
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    console.error('Create Razorpay order error:', error?.error?.description || error.message);
    return sendError(
      res,
      status >= 400 && status < 600 ? status : 500,
      status === 503
        ? 'Razorpay is not configured on the server.'
        : 'Unable to start Razorpay checkout. Please try again.'
    );
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    if (!rateLimit(clientKey(req, 'verify'), 20, 60 * 1000)) {
      return sendError(res, 429, 'Too many verification attempts. Please wait a minute and try again.');
    }

    await db.ready;

    const orderId = cleanText(req.body?.razorpay_order_id, 80);
    const paymentId = cleanText(req.body?.razorpay_payment_id, 80);
    const signature = cleanText(req.body?.razorpay_signature, 128);

    if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
      return sendError(res, 400, 'Payment confirmation is incomplete.');
    }
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
      return sendError(res, 400, 'Payment confirmation is incomplete.');
    }

    const order = await db.getRazorpayOrder(orderId);
    if (!order) {
      return sendError(res, 404, 'Payment order was not found.');
    }
    if (order.status === 'paid' && order.razorpay_payment_id === paymentId) {
      return res.status(200).json({
        success: true,
        alreadyPaid: true,
        paymentId,
        courseSlug: order.course_slug,
      });
    }
    if (order.status === 'paid') {
      return sendError(res, 409, 'This order was already paid.');
    }

    if (!razorpay.verifyCheckoutSignature({ orderId, paymentId, signature })) {
      return sendError(res, 400, 'Payment verification failed.');
    }

    let payment = await razorpay.fetchPayment(paymentId);
    if (payment.order_id !== orderId || payment.currency !== 'INR') {
      return sendError(res, 400, 'Payment does not match this order.');
    }
    if (Number(payment.amount) !== Number(order.amount_paise)) {
      return sendError(res, 400, 'Paid amount does not match the course price.');
    }
    if (payment.status === 'authorized') {
      payment = await razorpay.capturePayment(paymentId, Number(order.amount_paise));
    }
    if (payment.status !== 'captured') {
      return sendError(res, 400, 'Payment is not completed yet.');
    }

    const saved = await db.finalizeRazorpayPayment(order, {
      paymentId,
      signature,
      methodLabel: `Razorpay ${payment.method || 'checkout'}`,
      payerReference: payerReference(payment),
    });

    let notice = {
      message: `Congratulations! Your payment is successful.`,
      smsSent: false,
      emailSent: false,
    };
    try {
      notice = await sendPaymentCongratulations({
        name: order.student_name,
        email: order.student_email || order.account_email,
        mobile: order.student_mobile,
        courseTitle: order.course_title,
        amount: order.amount_rupees,
        paymentId: saved.transaction_id,
      });
    } catch (notifyError) {
      console.error('Payment notice failed:', notifyError.message);
    }

    return res.status(200).json({
      success: true,
      paymentId: saved.transaction_id,
      courseSlug: saved.course_slug,
      message: notice.message,
      smsSent: notice.smsSent,
      emailSent: notice.emailSent,
    });
  } catch (error) {
    if (error.message === 'This order was already completed with a different payment.') {
      return sendError(res, 409, error.message);
    }
    const status = error.statusCode || 500;
    console.error('Verify Razorpay payment error:', error?.error?.description || error.message);
    return sendError(
      res,
      status >= 400 && status < 600 ? status : 500,
      'Unable to verify this payment. If money was deducted, contact support with your Razorpay payment id.'
    );
  }
};

exports.access = async (req, res) => {
  try {
    if (!rateLimit(clientKey(req, 'access'), 30, 60 * 1000)) {
      return sendError(res, 429, 'Too many access checks. Please wait a minute and try again.');
    }

    await db.ready;
    const courseSlug = cleanText(req.query.courseSlug, 200);
    const email = cleanText(req.query.email, 180).toLowerCase();
    const mobile = cleanText(req.query.mobile, 10).replace(/\D/g, '');

    if (!courseSlug || (!email && mobile.length !== 10)) {
      return res.status(200).json({ success: true, purchased: false });
    }

    const payment = await db.findCoursePurchase({ courseSlug, email, mobile });
    return res.status(200).json({
      success: true,
      purchased: Boolean(payment),
      paymentId: payment?.transaction_id || null,
    });
  } catch (error) {
    console.error('Payment access check error:', error.message);
    return sendError(res, 500, 'Unable to check course access.');
  }
};
