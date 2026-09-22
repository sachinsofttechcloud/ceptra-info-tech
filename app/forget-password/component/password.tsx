
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";
const INK = "#12121A";
const INK_SOFT = "#5B5B68";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";

const OTP_LENGTH = 4;

type Step = "email" | "verify" | "reset";

const STEP_META: Record<Step, { eyebrow: string; title: string; subtitle: string }> = {
  email: {
    eyebrow: "Step 1 of 3",
    title: "Forgot your password?",
    subtitle: "Enter the email you used to sign up and we'll send you a reset code.",
  },
  verify: {
    eyebrow: "Step 2 of 3",
    title: "Check your inbox",
    subtitle: "Enter the 4-digit code we just sent to your email.",
  },
  reset: {
    eyebrow: "Step 3 of 3",
    title: "Set a new password",
    subtitle: "Choose a strong password you haven't used before.",
  },
};

export default function Password() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  }, [step]);

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

  const meta = STEP_META[step];

  return (
    <section ref={sectionRef} className="relative flex items-center justify-center overflow-hidden bg-white px-6 py-20 md:py-26">
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

          {/* Step 1: email */}
          {step === "email" && (
            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setStep("verify");
              }}
            >
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
                className="inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)]"
                style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
              >
                Send Reset Code
              </button>

              <Link href="/login-in" className="block text-center text-[13.5px] font-semibold" style={{ color: ACCENT }}>
                Back to sign in
              </Link>
            </form>
          )}

          {/* Step 2: verify */}
          {step === "verify" && (
            <form
              className="mt-7 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setStep("reset");
              }}
            >
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
                    className="h-14 w-14 rounded-xl border border-black/[.12] bg-black/[.015] text-center text-[20px] font-semibold outline-none transition-colors focus:border-transparent focus:ring-2"
                    style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
                  />
                ))}
              </div>

              <p className="text-center text-[13px]" style={{ color: INK_SOFT }}>
                Didn&apos;t get a code?{" "}
                <button type="button" className="font-semibold" style={{ color: ACCENT }}>
                  Resend
                </button>
              </p>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)]"
                style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
              >
                Verify
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

          {/* Step 3: reset */}
          {step === "reset" && (
            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                // handle password submit here
              }}
            >
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                  Enter new password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    required
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
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)]"
                style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}