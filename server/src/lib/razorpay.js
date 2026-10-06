const crypto = require('crypto');
const Razorpay = require('razorpay');

function getCredentials() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || '').trim();
  if (!keyId || !keySecret) {
    const error = new Error('Razorpay is not configured.');
    error.statusCode = 503;
    throw error;
  }
  return { keyId, keySecret };
}

function getClient() {
  const { keyId, keySecret } = getCredentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function signaturesMatch(expected, received) {
  const left = Buffer.from(String(expected || ''), 'utf8');
  const right = Buffer.from(String(received || ''), 'utf8');
  if (left.length === 0 || left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  const { keySecret } = getCredentials();
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return signaturesMatch(expected.toLowerCase(), String(signature || '').toLowerCase());
}

async function createOrder({ amountSubunits, currency, receipt, courseSlug }) {
  const client = getClient();
  return client.orders.create({
    amount: amountSubunits,
    currency,
    receipt,
    notes: {
      course_slug: String(courseSlug || '').slice(0, 200),
    },
  });
}

async function fetchPayment(paymentId) {
  const client = getClient();
  return client.payments.fetch(paymentId);
}

async function capturePayment(paymentId, amountSubunits, currency) {
  const client = getClient();
  return client.payments.capture(paymentId, amountSubunits, currency);
}

module.exports = {
  getCredentials,
  verifyCheckoutSignature,
  createOrder,
  fetchPayment,
  capturePayment,
};
