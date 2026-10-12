const { sendNoticeEmail } = require('./mail');

function congratulationsText({ name, courseTitle, amount, currency, paymentId }) {
  const student = name || 'Student';
  const course = courseTitle || 'your course';
  const fee = currency === 'USD'
    ? `$${Number(amount || 0).toLocaleString('en-US')}`
    : `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;
  return `Congratulations ${student}! Your payment of ${fee} for ${course} is successful. Payment ID: ${paymentId}. Your course is unlocked at Ceptra Infotech.`;
}

async function sendSms(mobile, message) {
  const apiKey = String(process.env.FAST2SMS_API_KEY || '').trim();
  if (!apiKey) return false;

  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      route: 'q',
      message,
      language: 'english',
      numbers: mobile,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.return === false) {
    throw new Error(payload.message || 'SMS provider rejected the message.');
  }
  return true;
}

async function sendPaymentCongratulations(details) {
  const message = congratulationsText(details);
  let emailSent = false;
  let smsSent = false;

  if (details.email) {
    try {
      await sendNoticeEmail({
        email: details.email,
        name: details.name,
        message,
      });
      emailSent = true;
    } catch (error) {
      console.error('Payment congratulations email failed:', error.message);
    }
  }

  if (details.mobile) {
    try {
      smsSent = await sendSms(details.mobile, message);
    } catch (error) {
      console.error('Payment congratulations SMS failed:', error.message);
    }
  }

  return { message, emailSent, smsSent };
}

module.exports = { sendPaymentCongratulations };
