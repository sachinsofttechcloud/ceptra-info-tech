import { getStoredUser } from "@/components/Auth/AuthGuard";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const ADMIN_EMAILS = [
  "chandan@ceptrainfotech.com",
  "chandan.sakure@gmail.com",
];

export function isAdminEmail(email?: string | null) {
  return ADMIN_EMAILS.includes((email || "").trim().toLowerCase());
}

export function adminHeaders(email?: string | null) {
  const adminEmail = email || (typeof window !== "undefined" ? getStoredUser()?.email : "");
  return {
    "Content-Type": "application/json",
    "X-Admin-Email": (adminEmail || "").trim().toLowerCase(),
  };
}

export function notifyCoursesChanged() {
  window.dispatchEvent(new Event("ceptra_courses_change"));
}

