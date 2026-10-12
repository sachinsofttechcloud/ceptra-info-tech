const ADMIN_EMAILS = [
  'chandan@ceptrainfotech.com',
  'chandan.sakure@gmail.com',
];

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase());
}

function isAllowedEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  if (!value) return false;
  if (isAdminEmail(value)) return true;
  return /^[^\s@]+@gmail\.com$/.test(value);
}

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(String(mobile || '').replace(/\D/g, ''));
}

function passwordProblems(password) {
  const value = String(password || '');
  const missing = [];
  if (value.length < 8) missing.push('at least 8 characters');
  if (!/[A-Z]/.test(value)) missing.push('an uppercase letter');
  if (!/[a-z]/.test(value)) missing.push('a lowercase letter');
  if (!/\d/.test(value)) missing.push('a number');
  if (!/[^A-Za-z0-9]/.test(value)) missing.push('a symbol');
  return missing;
}

function passwordError(password) {
  const missing = passwordProblems(password);
  if (missing.length === 0) return '';
  return `Use a strong password with ${missing.join(', ')}.`;
}

module.exports = {
  ADMIN_EMAILS,
  isAdminEmail,
  isAllowedEmail,
  isValidMobile,
  passwordError,
};
