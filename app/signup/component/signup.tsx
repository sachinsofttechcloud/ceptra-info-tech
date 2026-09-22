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

const ROADMAP_STEPS = [
  { title: "Live Classes", detail: "Small batches, mentor-led sessions", done: true },
  { title: "Real Projects", detail: "Build what you'll actually ship at work", done: true },
  { title: "Mentor Reviews", detail: "1:1 feedback on every milestone", done: false },
  { title: "Placement Support", detail: "Resume, mock interviews, referrals", done: false },
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" fill="#0A66C2">
      <path d="M4.03 6.5H.76V17.4h3.27V6.5zM2.4 5.1a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8zM17.24 17.4h-3.26v-5.4c0-1.29-.02-2.94-1.79-2.94-1.8 0-2.08 1.4-2.08 2.85v5.49H6.86V6.5h3.13v1.49h.04c.44-.82 1.5-1.68 3.08-1.68 3.29 0 3.9 2.17 3.9 4.99v6.1z" />
    </svg>
  );
}

function SSOMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none">
      <rect x="2.5" y="4.5" width="13" height="9" rx="1.6" stroke={ACCENT_DEEP} strokeWidth="1.4" />
      <path d="M6 9h6M6 11.3h3.5" stroke={ACCENT_DEEP} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const SIGNUP_SOCIALS = [
  { id: "google", label: "Google", Icon: GoogleMark },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInMark },
  { id: "sso", label: "SSO", Icon: SSOMark },
];

export default function Signup() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);

  const visualRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const badgeCard1Ref = useRef<HTMLDivElement>(null);
  const badgeCard2Ref = useRef<HTMLDivElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(cardRef.current, { y: 26, opacity: 0, scale: 0.97, duration: 0.6 })
        .from(badgeRef.current, { y: 12, opacity: 0, duration: 0.4 }, "-=0.3")
        .from(headingRef.current, { y: 14, opacity: 0, duration: 0.45 }, "-=0.2")
        .from(formRef.current ? Array.from(formRef.current.children) : [], { y: 12, opacity: 0, duration: 0.4, stagger: 0.06 }, "-=0.2")
        .from(visualRef.current, { scale: 0.92, opacity: 0, duration: 0.7, ease: "back.out(1.4)" }, "-=0.55")
        .from(stepRefs.current.filter(Boolean), { x: -14, opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.35")
        .from([badgeCard1Ref.current, badgeCard2Ref.current], { y: 18, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(2)" }, "-=0.5");

      gsap.to(blobRef1.current, { rotate: 360, duration: 46, repeat: -1, ease: "none" });
      gsap.to(blobRef2.current, { rotate: -360, duration: 55, repeat: -1, ease: "none" });
      gsap.to(badgeCard1Ref.current, { y: -10, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(badgeCard2Ref.current, { y: 10, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.2 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const student = [
      { src: "/home/akshara.webp", name: "Akshara" },
      { src: "/home/chaitali.webp", name: "Chaitali" },
      { src: "/home/jasbir.webp", name: "Jasbir" },
      { src: "/home/pratik.webp", name: "Pratik" },
    ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white px-6 py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(91,79,224,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 65% 65% at 50% 25%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 50% 25%, black, transparent)",
        }}
      />
      <div
        ref={blobRef1}
        className="pointer-events-none absolute -right-32 -top-20 h-[440px] w-[440px] rounded-full opacity-[0.4] blur-3xl"
        style={{ background: `radial-gradient(circle, ${ACCENT_SOFT}, transparent 70%)` }}
      />
      <div
        ref={blobRef2}
        className="pointer-events-none absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full opacity-[0.3] blur-3xl"
        style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        {/* Left: form */}
        <div ref={cardRef} className="mx-auto w-full max-w-md rounded-3xl border border-black/[.06] bg-white p-8 shadow-[0_40px_80px_-24px_rgba(20,20,40,0.28)]">
          <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-black/[.08] bg-black/[.02] px-4 py-1.5 text-[12.5px] font-medium" style={{ fontFamily: FONT_MONO, color: INK_SOFT }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
            Join Ceptra
          </div>

          <h1 ref={headingRef} className="mt-4 text-[28px] font-extrabold leading-[1.15] tracking-tight" style={{ fontFamily: FONT_DISPLAY, color: INK }}>
            Create your account
          </h1>
          <p className="mt-1.5 text-[14.5px] leading-6" style={{ color: INK_SOFT }}>
            Start with a live batch, mentor support, and real project work.
          </p>

          <form ref={formRef} className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="h-12 w-full rounded-xl border border-black/[.1] bg-black/[.015] px-4 text-[14.5px] outline-none transition-colors focus:border-transparent focus:ring-2"
                style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                className="h-12 w-full rounded-xl border border-black/[.1] bg-black/[.015] px-4 text-[14.5px] outline-none transition-colors focus:border-transparent focus:ring-2"
                style={{ color: INK, ["--tw-ring-color" as string]: ACCENT_SOFT }}
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="mb-1.5 block text-[13px] font-medium" style={{ color: INK }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
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
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((r) => !r)}
                className="h-4 w-4 rounded border-black/[.2]"
                style={{ accentColor: ACCENT }}
              />
              Remember me
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)]"
              style={{ background: "linear-gradient(135deg, rgb(91, 79, 224), rgb(138, 125, 255))" }}
            >
              Sign Up
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-black/[.08]" />
              <span className="text-[11.5px] tracking-wide" style={{ color: INK_SOFT }}>
                Access quickly
              </span>
              <span className="h-px flex-1 bg-black/[.08]" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {SIGNUP_SOCIALS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-black/[.1] text-[13px] font-medium transition-colors hover:bg-black/[.03]"
                  style={{ color: INK }}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </form>

          <p className="mt-6 text-center text-[13.5px]" style={{ color: INK_SOFT }}>
            Already have an account?{" "}
            <Link href="/login-in" className="font-semibold" style={{ color: ACCENT }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Right: what joining looks like */}
        <div className="relative hidden items-center justify-center py-10 lg:flex">
          <div ref={visualRef} className="relative w-full max-w-sm rounded-3xl border border-black/[.06] bg-white p-6 shadow-[0_40px_80px_-24px_rgba(20,20,40,0.32)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14.5px] font-semibold" style={{ color: INK, fontFamily: FONT_DISPLAY }}>
                  Your learning path
                </div>
                <div className="mt-0.5 text-[12px]" style={{ color: INK_SOFT }}>
                  From first class to first offer
                </div>
              </div>
              <span className="rounded-full bg-black/[.04] px-2.5 py-1 text-[10.5px] font-semibold" style={{ color: INK_SOFT }}>
                8 weeks
              </span>
            </div>

            <ol className="relative mt-6 space-y-5 pl-2">
              <div className="absolute bottom-3 left-[15px] top-3 w-px bg-black/[.08]" />
              {ROADMAP_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative flex items-start gap-3.5"
                >
                  <span
                    className="relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                    style={{
                      background: step.done ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` : "white",
                      border: step.done ? "none" : `1.5px solid rgba(0,0,0,0.12)`,
                    }}
                  >
                    {step.done ? (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                        <path d="M3 8l3.5 3.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    ) : (
                      <span className="h-2 w-2 rounded-full" style={{ background: "rgba(0,0,0,0.15)" }} />
                    )}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold" style={{ color: INK }}>
                      {step.title}
                    </div>
                    <div className="text-[12px]" style={{ color: INK_SOFT }}>
                      {step.detail}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex items-center justify-between border-t border-black/[.05] pt-4">
              <div className="flex -space-x-2.5">
               {student.map((person, i) => (
               <div key={i} className="h-7 w-7 overflow-hidden rounded-full border-2 border-white">
                <img src={person.src} alt="err" className="h-full w-full object-cover" />
               </div>
               ))}
              </div>
              <span className="text-[12px] font-medium" style={{ color: INK_SOFT }}>
               2,000+ alumni
             </span>
           </div>
          </div>

          <div ref={badgeCard1Ref} className="absolute -left-8 top-4 flex items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: ACCENT_DEEP }}>
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.6" />
                <path d="M8 5v3l2 1.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className="text-[12.5px] font-semibold" style={{ color: INK }}>Small Batches</div>
              <div className="text-[11px]" style={{ color: "#8A8A94" }}>Max 20 students</div>
            </div>
          </div>

          <div ref={badgeCard2Ref} className="absolute -bottom-6 -right-4 flex items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)]">
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
        </div>
      </div>
    </section>
  );
}