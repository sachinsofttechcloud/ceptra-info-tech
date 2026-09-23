"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import emailjs from "@emailjs/browser";

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";
const INK = "#12121A";
const INK_SOFT = "#5B5B68";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";

const OTP_LENGTH = 4;
const OTP_SECONDS = 60;
const EMAILJS_SERVICE_ID = "service_8yk7hqy";
const EMAILJS_TEMPLATE_ID = "template_r0lw4vh";
const EMAILJS_PUBLIC_KEY = "YqXjjAdQt3XzPV9hl";

async function deliverOtpEmail(address: string, code: string) {
  const codeLine = `Your 4-digit password reset code is ${code}`;
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: address,
      email: address,
      to_name: codeLine,
      fullName: codeLine,
      otp: code,
      message: `${codeLine}. It expires in 5 minutes.`,
    },
    { publicKey: EMAILJS_PUBLIC_KEY }
  );
}

type Step = "email" | "verify" | "reset";

const STEP_META: Record<Step, { eyebrow: string; title: string; subtitle: string }> = {
  email: {
    eyebrow: "Step 1 of 3",
    title: "Forgot your password?",
    subtitle: "Enter the email you used to sign up and we'll check our database to send your OTP.",
  },
  verify: {
    eyebrow: "Step 2 of 3",
    title: "Check your inbox",
    subtitle: "Enter the 4-digit OTP that arrived in your email.",
  },
  reset: {
    eyebrow: "Step 3 of 3",
    title: "Set a new password",
    subtitle: "Enter and confirm your new password below.",
  },
};

export default function Password() {
  const router = useRouter();

  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [timer, setTimer] = useState(OTP_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Card entrance, once.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, { y: 26, opacity: 0, scale: 0.97, duration: 0.6, ease: "power3.out" });
      gsap.to(blobRef1.current, { rotate: 360, duration: 46, repeat: -1, ease: "none" });
      gsap.to(blobRef2.current, { rotate: -360, duration: 55, repeat: -1, ease: "none" });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Re-run a small entrance whenever the step changes.
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: 16 },
      { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }
    );

    if (step === "verify") {
      setTimer(OTP_SECONDS);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  }, [step]);

  // 30-second OTP countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      setErrorMsg("OTP timer expired. Please click Resend OTP to get a new code.");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer]);

  function handleOtpChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  // Step 1: Send OTP & check database
  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(normalizedEmail)) {
      setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.delivery === "client") {
          if (!data.otp) {
            setErrorMsg("Could not send the OTP email. Please try again.");
            return;
          }
          await deliverOtpEmail(normalizedEmail, String(data.otp));
        }
        setOtp(Array(OTP_LENGTH).fill(""));
        setSuccessMsg(data.message || `A 4-digit OTP was sent to ${normalizedEmail}`);
        setStep("verify");
        setTimer(Number(data.expiresInSeconds) || OTP_SECONDS);
        setIsTimerActive(true);
      } else {
        setErrorMsg(data.message || "This email ID is not present in our database.");
      }
    } catch (err) {
      console.warn("Send OTP error:", err);
      setErrorMsg("Failed to connect to backend server. Please check database connection.");
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP trigger
  async function handleResendOtp() {
    setOtp(Array(OTP_LENGTH).fill(""));
    await handleSendOtp();
  }

  // Step 2: Verify OTP code
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (timer === 0) {
      setErrorMsg("OTP code has expired. Please click Resend OTP for a new code.");
      return;
    }

    const enteredOtp = otp.join("");
    if (enteredOtp.length < OTP_LENGTH) {
      setErrorMsg(`Please enter all ${OTP_LENGTH} digits of your OTP.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: enteredOtp }),
      });
      const data = await res.json();

      if (data.success) {
        setIsTimerActive(false);
        setSuccessMsg("OTP verified! Please enter your new password.");
        setStep("reset");
      } else {
        setErrorMsg(data.message || "Invalid OTP code. Please enter the correct code.");
      }
    } catch (err) {
      console.warn("Verify OTP error:", err);
      setErrorMsg("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Reset password & trigger 2sec auto redirect modal
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please check and try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          newPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setShowSuccessModal(true);
        // Requirement: after 2sec automatic open login page
        setTimeout(() => {
          router.push("/login-in");
        }, 2000);
      } else {
        setErrorMsg(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.warn("Reset password error:", err);
      setErrorMsg("Error resetting password.");
    } finally {
      setLoading(false);
    }
  }

  const meta = STEP_META[step];

  return (
    <section ref={sectionRef} className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-white px-6 py-20 md:py-26">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(91,79,224,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 30%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 30%, black, transparent)",
        }}
      />
      <div
        ref={blobRef1}
        className="pointer-events-none absolute -right-32 -top-10 h-[400px] w-[400px] rounded-full opacity-[0.4] blur-3xl"
        style={{ background: `radial-gradient(circle, ${ACCENT_SOFT}, transparent 70%)` }}
      />
      <div
        ref={blobRef2}
        className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full opacity-[0.3] blur-3xl"
        style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
      />

      <div ref={cardRef} className="relative w-full max-w-md rounded-3xl border border-black/[.06] bg-white p-8 shadow-[0_40px_80px_-24px_rgba(20,20,40,0.28)]">
        {/* Step progress dots */}
        <div className="flex items-center gap-2">
          {(["email", "verify", "reset"] as Step[]).map((s, i) => (
            <span
              key={s}
              className="h-1.5 flex-1 rounded-full transition-colors duration-300"
              style={{
                background:
                  step === s || (["verify", "reset"].includes(step) && i === 0) || (step === "reset" && i === 1)
                    ? ACCENT
                    : "rgba(0,0,0,0.08)",
              }}
            />
          ))}
        </div>

        <div ref={contentRef} className="mt-6">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-black/[.08] bg-black/[.02] px-3.5 py-1 text-[12px] font-medium"
            style={{ fontFamily: FONT_MONO, color: INK_SOFT }}
          >
            {meta.eyebrow}
          </div>

          <h1 className="mt-4 text-[26px] font-extrabold leading-[1.15] tracking-tight" style={{ fontFamily: FONT_DISPLAY, color: INK }}>
            {meta.title}
          </h1>
          <p className="mt-1.5 text-[14.5px] leading-6" style={{ color: INK_SOFT }}>
            {meta.subtitle}
          </p>

          {errorMsg && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13.5px] font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && !showSuccessModal && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[13.5px] font-medium text-emerald-700">
              {successMsg}
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form className="mt-7 space-y-4" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-black/[.1] bg-black/[.015] px-4 text-[14.5px] outline-none transition-colors focus:border-transparent focus:ring-2"
                  style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)] transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
              >
                {loading ? "Checking Database..." : "Send Reset Code"}
              </button>

              <Link href="/login-in" className="block text-center text-[13.5px] font-semibold" style={{ color: ACCENT }}>
                Back to sign in
              </Link>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === "verify" && (
            <form className="mt-7 space-y-5" onSubmit={handleVerifyOtp}>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-[12.5px] font-medium text-slate-600">
                <span>OTP expires in:</span>
                <span className={`font-mono text-[14px] font-bold ${timer < 60 ? "text-red-600 animate-pulse" : "text-indigo-600"}`}>
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </span>
              </div>

              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={timer === 0}
                    className="h-14 w-14 rounded-xl border border-black/[.12] bg-black/[.015] text-center text-[20px] font-semibold outline-none transition-colors focus:border-transparent focus:ring-2 disabled:opacity-50"
                    style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-500">Didn&apos;t get a code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || loading}
                  className="font-semibold transition-colors disabled:cursor-not-allowed disabled:text-slate-400"
                  style={{ color: timer > 0 ? undefined : ACCENT }}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || timer === 0}
                className="inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)] transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="block w-full text-center text-[13.5px] font-semibold"
                style={{ color: INK_SOFT }}
              >
                Use a different email
              </button>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <form className="mt-7 space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                  Enter new password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8 symbols at least"
                    className="h-12 w-full rounded-xl border border-black/[.1] bg-black/[.015] px-4 pr-11 text-[14.5px] outline-none transition-colors focus:border-transparent focus:ring-2"
                    style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold"
                    style={{ color: INK_SOFT }}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="h-12 w-full rounded-xl border border-black/[.1] bg-black/[.015] px-4 pr-11 text-[14.5px] outline-none transition-colors focus:border-transparent focus:ring-2"
                    style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold"
                    style={{ color: INK_SOFT }}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)] transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
              >
                {loading ? "Updating..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Success Popup Modal (Requirement: show pop forget password successfully completed than after 2sec automatic open login page) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm animate-in fade-in zoom-in-95 rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-[20px] font-bold text-slate-900" style={{ fontFamily: FONT_DISPLAY }}>
              Forgot Password Successfully Completed
            </h3>
            <p className="mt-2 text-[13.5px] text-slate-500">
              Your password has been updated in the database. Redirecting to login page in 2 seconds...
            </p>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full animate-[pulse_1s_infinite] bg-emerald-500" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}