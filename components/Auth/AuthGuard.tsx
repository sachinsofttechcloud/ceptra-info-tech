"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ceptra_user");
    if (!raw) return null;

    const loginTimeStr = localStorage.getItem("ceptra_login_time");
    if (loginTimeStr) {
      const loginTime = parseInt(loginTimeStr, 10);
      if (!isNaN(loginTime) && Date.now() - loginTime >= THIRTY_DAYS_MS) {
        // Auto-logout after 30 days
        setStoredUser(null);
        return null;
      }
    }

    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user: { email: string; name?: string; isSpecial?: boolean } | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("ceptra_user", JSON.stringify(user));
    localStorage.setItem("ceptra_logged_in", "true");
    if (!localStorage.getItem("ceptra_login_time")) {
      localStorage.setItem("ceptra_login_time", Date.now().toString());
    }
    // Set cookie for 30 days for additional persistence
    document.cookie = `ceptra_logged_in=true; path=/; max-age=${30 * 24 * 3600}; SameSite=Lax`;
  } else {
    localStorage.removeItem("ceptra_user");
    localStorage.removeItem("ceptra_logged_in");
    localStorage.removeItem("ceptra_login_time");
    document.cookie = "ceptra_logged_in=; path=/; max-age=0";
  }
  window.dispatchEvent(new CustomEvent("ceptra_auth_change"));
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    function checkAuth() {
      const user = getStoredUser();
      if (user && user.email) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace(`/login-in?redirect=${encodeURIComponent(pathname)}`);
      }
    }

    checkAuth();

    // Check every 10 seconds for 12-hour expiration while user is on page
    const interval = setInterval(() => {
      checkAuth();
    }, 10000);

    const handleAuthChange = () => checkAuth();
    window.addEventListener("ceptra_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("ceptra_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [router, pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5B4FE0] border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Checking course access permission...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
