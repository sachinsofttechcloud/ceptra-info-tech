export const ADMIN_EMAILS = [
  "chandan@ceptrainfotech.com",
  "chandan.sakure@gmail.com",
];

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function isAllowedEmail(email: string) {
  const value = email.trim().toLowerCase();
  if (!value) return false;
  if (isAdminEmail(value)) return true;
  return /^[^\s@]+@gmail\.com$/.test(value);
}

export function emailError(email: string) {
  if (!email.trim()) return "Enter your email address.";
  if (!isAllowedEmail(email)) {
    return "Use a Gmail address like name@gmail.com.";
  }
  return "";
}

export function mobileError(mobile: string) {
  const digits = mobile.replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return "Enter a 10-digit mobile number.";
  }
  return "";
}

export function passwordProblems(password: string) {
  const missing: string[] = [];
  if (password.length < 8) missing.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) missing.push("an uppercase letter");
  if (!/[a-z]/.test(password)) missing.push("a lowercase letter");
  if (!/\d/.test(password)) missing.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) missing.push("a symbol");
  return missing;
}

export function passwordError(password: string) {
  const missing = passwordProblems(password);
  if (missing.length === 0) return "";
  return `Use a strong password with ${missing.join(", ")}.`;
}

export const PASSWORD_HINT =
  "At least 8 characters, with an uppercase letter, a lowercase letter, a number, and a symbol.";
