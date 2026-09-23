const db = require('../lib/db');
const { sendOtpEmail } = require('../lib/mail');

const OTP_TTL_MS = 5 * 60 * 1000;

const SPECIAL_EMAILS = [
  'chandan@ceptrainfotech.com',
  'chandan.sakure@gmail.com',
];

function isSpecialEmail(email) {
  if (!email) return false;
  return SPECIAL_EMAILS.includes(email.trim().toLowerCase());
}

// Memory cache for OTPs (in addition to DB persistence)
const otpStore = new Map();

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login.',
      });
    }

    const user = await db.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
    });

    return res.status(201).json({
      success: true,
      message: 'Signup successfully completed! Redirecting to login...',
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during signup. Please try again.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Requirement: chandan@ceptrainfotech.com and chandan.sakure@gmail.com direct access to course page
    if (isSpecialEmail(normalizedEmail)) {
      const specialUser = {
        name: normalizedEmail.includes('chandan.sakure') ? 'Chandan Sakure' : 'Chandan Ceptra',
        email: normalizedEmail,
        isSpecial: true,
      };
      await db.recordLogin({
        name: specialUser.name,
        email: normalizedEmail,
        password: password || null,
      });
      return res.status(200).json({
        success: true,
        message: 'Direct access granted for authorized email.',
        user: specialUser,
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
    }

    const user = await db.findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email ID not found in database. Please sign up first.',
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again or click Forgot Password.',
      });
    }

    await db.updateUserLastLogin(normalizedEmail);
    await db.recordLogin({
      name: user.name,
      email: normalizedEmail,
      password,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email ID is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email is in special emails or DB
    const isSpecial = isSpecialEmail(normalizedEmail);
    const user = await db.findUserByEmail(normalizedEmail);

    if (!isSpecial && !user) {
      return res.status(404).json({
        success: false,
        message: 'This email ID is not present in our database.',
      });
    }

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + OTP_TTL_MS;

    otpStore.set(normalizedEmail, { otp: generatedOtp, expiresAt });
    await db.updateUserOtp(normalizedEmail, generatedOtp, OTP_TTL_MS);

    try {
      await sendOtpEmail({
        email: normalizedEmail,
        name: user?.name,
        otp: generatedOtp,
      });
    } catch (mailError) {
      const reason = mailError.message || '';
      console.error('OTP email failed:', reason);
      if (/non-browser/i.test(reason)) {
        return res.status(200).json({
          success: true,
          delivery: 'client',
          otp: generatedOtp,
          expiresInSeconds: OTP_TTL_MS / 1000,
          message: `A 4-digit OTP was sent to ${normalizedEmail}. Enter it in the next step.`,
        });
      }
      otpStore.delete(normalizedEmail);
      return res.status(502).json({
        success: false,
        message: 'Could not send the OTP email. Please try again in a moment.',
      });
    }

    return res.status(200).json({
      success: true,
      delivery: 'email',
      message: `A 4-digit OTP was sent to ${normalizedEmail}. Enter it in the next step.`,
      expiresInSeconds: OTP_TTL_MS / 1000,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error sending OTP.',
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const inputOtp = otp.toString().trim();

    // Check memory store
    const stored = otpStore.get(normalizedEmail);
    let valid = false;
    let expired = false;

    if (stored) {
      if (Date.now() > stored.expiresAt) {
        expired = true;
      } else if (stored.otp === inputOtp) {
        valid = true;
      }
    } else {
      // Check database
      const user = await db.findUserByEmail(normalizedEmail);
      if (user && user.otp === inputOtp) {
        if (user.otpExpiresAt && new Date(user.otpExpiresAt).getTime() < Date.now()) {
          expired = true;
        } else {
          valid = true;
        }
      }
    }

    if (expired) {
      return res.status(400).json({
        success: false,
        message: 'OTP code has expired. Please click Resend OTP for a new code.',
      });
    }

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please enter the correct code.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully!',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying OTP.',
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const updated = await db.updateUserPassword(normalizedEmail, newPassword);
    if (!updated) {
      const existing = await db.findUserByEmail(normalizedEmail);
      if (!existing) {
        await db.createUser({
          name: normalizedEmail.includes('chandan.sakure') ? 'Chandan Sakure' : 'Ceptra Student',
          email: normalizedEmail,
          password: newPassword,
        });
      }
    }
    otpStore.delete(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'Forgot password successfully completed',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error resetting password.',
    });
  }
};
