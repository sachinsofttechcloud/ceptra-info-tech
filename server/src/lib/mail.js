const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

function mailConfig() {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID || 'service_8yk7hqy',
    templateId: process.env.EMAILJS_OTP_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID || 'template_r0lw4vh',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || 'YqXjjAdQt3XzPV9hl',
  };
}

async function sendOtpEmail({ email, name, otp }) {
  const { serviceId, templateId, publicKey } = mailConfig();
  const studentName = name && name.trim() ? name.trim() : 'Student';
  const codeLine = `${studentName}. Your 4-digit password reset code is ${otp}`;
  const message = `${codeLine}. It expires in 5 minutes. If you did not request this, you can ignore this email.`;

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: email,
        email,
        to_name: codeLine,
        fullName: codeLine,
        otp,
        message,
        user_message: message,
      },
    }),
  });

  if (!response.ok) {
    const reason = await response.text();
    throw new Error(reason || `Email provider returned ${response.status}`);
  }
}

module.exports = { sendOtpEmail };
