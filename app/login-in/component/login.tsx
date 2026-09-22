"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";
const INK = "#12121A";
const INK_SOFT = "#5B5B68";
const PAPER = "#FAFAF8";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const COURSE_PROGRESS = 0.82;

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" fill="#1877F2">
      <path d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.31V9h2.29V7.02c0-2.26 1.35-3.51 3.41-3.51.99 0 2.02.18 2.02.18v2.22h-1.14c-1.12 0-1.47.7-1.47 1.41V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-[18px] w-[18px]" fill={INK}>
      <path d="M13.1 9.6c0-2.05 1.68-3.03 1.75-3.08-0.96-1.4-2.45-1.59-2.98-1.61-1.27-.13-2.48.75-3.12.75-.65 0-1.63-.73-2.68-.71-1.38.02-2.65.8-3.36 2.04-1.44 2.5-.37 6.2 1.03 8.23.68.99 1.5 2.11 2.58 2.07 1.03-.04 1.42-.67 2.67-.67 1.24 0 1.6.67 2.68.65 1.11-.02 1.81-1.01 2.49-2.01.78-1.15 1.11-2.27 1.12-2.33-.02-.01-2.16-.83-2.18-3.33z" />
      <path d="M11.3 3.3c.57-.7.96-1.66.85-2.62-.82.03-1.82.55-2.41 1.23-.53.61-1 1.58-.87 2.52.91.07 1.85-.47 2.43-1.13z" />
    </svg>
  );
}

const LOGIN_SOCIALS = [
  { id: "google", label: "Google", Icon: GoogleMark },
  { id: "facebook", label: "Facebook", Icon: FacebookMark },
  { id: "apple", label: "Apple", Icon: AppleMark },
];

export default function LoginPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const badgeCard1Ref = useRef<HTMLDivElement>(null);
  const badgeCard2Ref = useRef<HTMLDivElement>(null);
  const badgeCard3Ref = useRef<HTMLDivElement>(null);
  const progressRingRef = useRef<SVGCircleElement>(null);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(badgeRef.current, { y: 14, opacity: 0, duration: 0.5 })
        .from(headingRef.current, { y: 18, opacity: 0, duration: 0.55 }, "-=0.25")
        .from(formRef.current ? Array.from(formRef.current.children) : [], { y: 14, opacity: 0, duration: 0.45, stagger: 0.07 }, "-=0.25")
        .from(visualRef.current, { scale: 0.92, opacity: 0, duration: 0.7, ease: "back.out(1.4)" }, "-=0.5")
        .from(progressRingRef.current, { strokeDashoffset: RING_CIRCUMFERENCE, duration: 1.1, ease: "power2.out" }, "-=0.5")
        .from(
          [badgeCard1Ref.current, badgeCard2Ref.current, badgeCard3Ref.current],
          { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(2)" },
          "-=0.9"
        );

      // Ambient loops
      gsap.to(blobRef1.current, { rotate: 360, duration: 46, repeat: -1, ease: "none" });
      gsap.to(blobRef2.current, { rotate: -360, duration: 55, repeat: -1, ease: "none" });
      gsap.to(badgeCard1Ref.current, { y: -10, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(badgeCard2Ref.current, { y: 10, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.2 });
      gsap.to(badgeCard3Ref.current, { y: -8, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.1 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(160deg, #F3F1FC 0%, ${PAPER} 45%, #FDF6F0 100%)` }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left: form */}
        <div className="mx-auto w-full max-w-sm">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-black/[.08] bg-black/[.02] px-4 py-1.5 text-[13px] font-medium"
            style={{ fontFamily: FONT_MONO, color: INK_SOFT }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
            Ceptra Student Portal
          </div>

          <h1 ref={headingRef} className="mt-5 text-[34px] font-extrabold leading-[1.15] tracking-tight sm:text-[38px]" style={{ fontFamily: FONT_DISPLAY, color: INK }}>
            Welcome back
          </h1>
          <p className="mt-2 text-[15px] leading-6" style={{ color: INK_SOFT }}>
            Sign in to pick up your batch, projects, and mentor notes right where you left off.
          </p>

          <form ref={formRef} className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-black/[.1] bg-black/[.015] px-4 text-[14.5px] outline-none transition-colors focus:border-transparent focus:ring-2"
                style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-[13px] font-medium" style={{ color: INK }}>
                  Password
                </label>
                <Link href="/forget-password" className="text-[12.5px] font-semibold" style={{ color: ACCENT }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8 symbols at least"
                  className="h-12 w-full rounded-xl border border-black/[.1] bg-black/[.015] px-4 pr-11 text-[14.5px] outline-none transition-colors focus:border-transparent focus:ring-2"
                  style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold"
                  style={{ color: INK_SOFT }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 text-[13px]" style={{ color: INK_SOFT }}>
              <input type="checkbox" className="h-4 w-4 rounded border-black/[.2]" style={{ accentColor: ACCENT }} defaultChecked />
              Keep me signed in
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)]"
              style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
            >
              Sign In
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-black/[.08]" />
              <span className="text-[12px]" style={{ color: INK_SOFT }}>
                or continue with
              </span>
              <span className="h-px flex-1 bg-black/[.08]" />
            </div>

            <div className="flex items-center justify-center gap-3">
              {LOGIN_SOCIALS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/[.08] transition-colors hover:bg-black/[.03]"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </form>

          <p className="mt-7 text-center text-[13.5px]" style={{ color: INK_SOFT }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: ACCENT }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Right: brand visual */}
        <div className="relative hidden items-center justify-center py-10 lg:flex">
          <div
            ref={blobRef1}
            className="pointer-events-none absolute h-[420px] w-[420px] rounded-[45%] opacity-[0.18] blur-2xl"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
          />
          <div
            ref={blobRef2}
            className="pointer-events-none absolute h-[280px] w-[280px] translate-x-16 translate-y-20 rounded-[40%] opacity-[0.15] blur-2xl"
            style={{ background: `linear-gradient(135deg, ${ACCENT_DEEP}, ${ACCENT_SOFT})` }}
          />

          <div ref={visualRef} className="relative w-full max-w-sm rounded-3xl border border-black/[.06] bg-white p-6 shadow-[0_40px_80px_-24px_rgba(20,20,40,0.32)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "#22c55e" }} />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#22c55e" }} />
                </span>
                <span className="text-[11.5px] font-medium" style={{ color: INK_SOFT }}>Live batch in session</span>
              </div>
              <span className="rounded-full bg-black/[.04] px-2.5 py-1 text-[10.5px] font-semibold" style={{ color: INK_SOFT }}>
                Module 4 of 8
              </span>
            </div>

            {/* Course progress ring + current track */}
            <div className="mt-6 flex items-center gap-5">
              <div className="relative h-[92px] w-[92px] shrink-0">
                <svg viewBox="0 0 100 100" className="h-[92px] w-[92px] -rotate-90">
                  <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
                  <circle
                    ref={progressRingRef}
                    cx="50"
                    cy="50"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="url(#loginRingGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - COURSE_PROGRESS)}
                  />
                  <defs>
                    <linearGradient id="loginRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={ACCENT} />
                      <stop offset="100%" stopColor={ACCENT_SOFT} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[19px] font-bold" style={{ color: INK, fontFamily: FONT_DISPLAY }}>82%</span>
                  <span className="text-[9px]" style={{ color: INK_SOFT }}>complete</span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="truncate text-[14.5px] font-semibold" style={{ color: INK, fontFamily: FONT_DISPLAY }}>
                  Salesforce + LWC Track
                </div>
                <div className="mt-0.5 text-[12px]" style={{ color: INK_SOFT }}>
                  Mentor: Dr. Sarita Chandan Sakure
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["LWC", "Apex", "Data Cloud"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
                      style={{ background: `${ACCENT}14`, color: ACCENT_DEEP }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Next live session strip */}
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-black/[.025] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="white" strokeWidth="1.4" />
                    <path d="M2 6.5h12M5 1.5v2M11 1.5v2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <div className="text-[12.5px] font-semibold" style={{ color: INK }}>Next live session</div>
                  <div className="text-[11px]" style={{ color: INK_SOFT }}>Today · 6:00 PM</div>
                </div>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: ACCENT }}>Join</span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-black/[.05] pt-4">
              <div className="flex -space-x-2.5">
                {[ACCENT, ACCENT_SOFT, INK, ACCENT_DEEP].map((c, i) => (
                  <span key={i} className="h-7 w-7 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[12px] font-medium" style={{ color: INK_SOFT }}>12 mentors online</span>
            </div>
          </div>

          <div ref={badgeCard1Ref} className="absolute -left-8 top-6 flex items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: ACCENT }}>
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M8 2.5 1.5 5.5 8 8.5l6.5-3z" fill="white" fillOpacity="0.9" />
                <path d="M4 7v3c0 .9 1.8 1.8 4 1.8s4-.9 4-1.8V7" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M14.5 5.5V10" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className="text-[12.5px] font-semibold" style={{ color: INK }}>ISO Certified</div>
              <div className="text-[11px]" style={{ color: "#8A8A94" }}>Recognized institute</div>
            </div>
          </div>

          <div ref={badgeCard2Ref} className="absolute -bottom-7 -right-4 flex items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
              </svg>
            </span>
            <div>
              <div className="text-[12.5px] font-semibold" style={{ color: INK }}>4.8 / 5</div>
              <div className="text-[11px]" style={{ color: "#8A8A94" }}>Student rating</div>
            </div>
          </div>

          <div ref={badgeCard3Ref} className="absolute -right-9 top-1/2 hidden -translate-y-1/2 items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)] sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: ACCENT_DEEP }}>
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <circle cx="8" cy="6" r="4" stroke="white" strokeWidth="1.4" />
                <path d="M5.5 9.3 4.5 14l3.5-1.8L11.5 14l-1-4.7" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <div className="text-[12.5px] font-semibold" style={{ color: INK }}>340+ Placed</div>
              <div className="text-[11px]" style={{ color: "#8A8A94" }}>This year alone</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}