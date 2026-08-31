"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Font note: authored around Space Grotesk (display) + JetBrains Mono
 * (badge / meta) + Inter (body copy) — matching every other section on
 * the site. Load via `next/font/google` in your root layout for
 * production; system fallbacks are included so it renders correctly as-is.
 */

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";
const INK = "#12121A";
const INK_SOFT = "#5B5B68";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";

const HEADING_LINE_1 = ["Where", "Careers"];
const HEADING_LINE_2 = ["Are", "Built"];

// Institute-style outcome stats, not a course-marketplace catalog size.
const STATS = [
  { target: 8, suffix: "+", decimals: 0, label: "Years Running" },
  { target: 5000, suffix: "+", decimals: 0, label: "Students Trained" },
  { target: 92, suffix: "%", decimals: 0, label: "Placement Rate" },
  { target: 4.8, suffix: "/5", decimals: 1, label: "Student Rating" },
];

// Live batches/tracks, standing in for the marquee of subjects.
const TRACKS = [
  "Salesforce",
  "Marketing Cloud",
  "Salesforce + LWC",
  "Data Cloud",
  "AgentForce",
  "Web Development",
  "Digital Marketing",
];

function Word({ text, gradient = false }: { text: string; gradient?: boolean }) {
  return (
    <span className="inline-block overflow-hidden pb-1 align-bottom">
      <span
        className={["hero-word inline-block will-change-transform", gradient ? "hero-word-gradient bg-clip-text text-transparent" : ""].join(" ")}
        style={
          gradient
            ? { backgroundImage: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT}, ${ACCENT})`, backgroundSize: "200% 100%" }
            : undefined
        }
      >
        {text}
      </span>
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const underlinePathRef = useRef<SVGPathElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);
  const secondaryBtnRef = useRef<HTMLAnchorElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statValueRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const visualWrapRef = useRef<HTMLDivElement>(null);
  const ghostCardRef = useRef<HTMLDivElement>(null);
  const visualCardOuterRef = useRef<HTMLDivElement>(null);
  const visualCardRef = useRef<HTMLDivElement>(null);
  const blobRef1 = useRef<HTMLDivElement>(null);
  const blobRef2 = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const avatarRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const badgeCard1Ref = useRef<HTMLDivElement>(null);
  const badgeCard2Ref = useRef<HTMLDivElement>(null);
  const badgeCard3Ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = headingRef.current ? headingRef.current.querySelectorAll<HTMLElement>(".hero-word") : [];
      const gradientWords = headingRef.current ? headingRef.current.querySelectorAll<HTMLElement>(".hero-word-gradient") : [];

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(badgeRef.current, { y: 16, opacity: 0, duration: 0.5 })
        .from(words, { yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.05, ease: "power4.out" }, "-=0.2")
        .fromTo(underlinePathRef.current, { strokeDashoffset: 340 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.3")
        .from(paraRef.current, { y: 16, opacity: 0, duration: 0.5 }, "-=0.6")
        .from(ctaRef.current ? Array.from(ctaRef.current.children) : [], { y: 14, opacity: 0, scale: 0.94, duration: 0.45, stagger: 0.08 }, "-=0.3")
        .from(proofRef.current, { x: -14, opacity: 0, duration: 0.5 }, "-=0.25")
        .from(marqueeRef.current, { opacity: 0, duration: 0.5 }, "-=0.2")
        .from(statsRef.current, { y: 20, opacity: 0, duration: 0.5 }, "-=0.2")
        .add(() => {
          STATS.forEach((stat, i) => {
            const el = statValueRefs.current[i];
            if (!el) return;
            const counter = { val: 0 };
            gsap.to(counter, {
              val: stat.target,
              duration: 1.5,
              delay: i * 0.1,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = counter.val.toFixed(stat.decimals) + stat.suffix;
              },
            });
          });
        }, "-=0.3")
        .from(ghostCardRef.current, { scale: 0.85, opacity: 0, rotate: -12, duration: 0.7 }, "-=1.3")
        .from(visualCardOuterRef.current, { scale: 0.88, opacity: 0, rotate: -4, duration: 0.8, ease: "back.out(1.5)" }, "-=0.6")
        .from(ringRef.current, { scale: 0.7, opacity: 0, duration: 0.7 }, "-=0.7")
        .from(progressBarRef.current, { scaleX: 0, duration: 0.9, ease: "power2.out" }, "-=0.3")
        .from(avatarRefs.current.filter(Boolean), { scale: 0, opacity: 0, duration: 0.4, stagger: 0.08, ease: "back.out(3)" }, "-=0.7")
        .from([badgeCard1Ref.current, badgeCard2Ref.current, badgeCard3Ref.current], { y: 24, opacity: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2)" }, "-=0.5")
        .from(particleRefs.current.filter(Boolean), { scale: 0, opacity: 0, duration: 0.4, stagger: 0.05 }, "-=0.6");

      // ---- Ambient loops ----
      gsap.to(blobRef1.current, { rotate: 360, duration: 46, repeat: -1, ease: "none" });
      gsap.to(blobRef2.current, { rotate: -360, duration: 55, repeat: -1, ease: "none" });
      gsap.to(ringRef.current, { rotate: -360, duration: 60, repeat: -1, ease: "none" });

      gsap.to(gradientWords, { backgroundPosition: "200% 50%", duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });

      gsap.to(badgeCard1Ref.current, { y: -12, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(badgeCard2Ref.current, { y: 12, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.3 });
      gsap.to(badgeCard3Ref.current, { y: -9, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.15 });
      gsap.to(iconRef.current, { y: -6, rotate: 4, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });

      particleRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, { x: "random(-18, 18)", y: "random(-24, 24)", duration: 3 + i * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.2 });
      });

      // ---- Infinite track marquee ----
      let marqueeCleanup: (() => void) | undefined;
      if (marqueeRef.current) {
        const track = marqueeRef.current;
        const loop = gsap.to(track, { xPercent: -50, duration: 18, ease: "none", repeat: -1 });
        const onEnter = () => loop.timeScale(0.25);
        const onLeave = () => loop.timeScale(1);
        track.addEventListener("mouseenter", onEnter);
        track.addEventListener("mouseleave", onLeave);
        marqueeCleanup = () => {
          track.removeEventListener("mouseenter", onEnter);
          track.removeEventListener("mouseleave", onLeave);
        };
      }

      // ---- Magnetic buttons ----
      const magneticCleanups: Array<() => void> = [];
      [primaryBtnRef, secondaryBtnRef].forEach((ref) => {
        const el = ref.current;
        if (!el) return;
        const moveX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
        const moveY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        const handleMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          moveX((e.clientX - rect.left - rect.width / 2) * 0.35);
          moveY((e.clientY - rect.top - rect.height / 2) * 0.5);
        };
        const handleLeave = () => {
          moveX(0);
          moveY(0);
        };
        el.addEventListener("mousemove", handleMove);
        el.addEventListener("mouseleave", handleLeave);
        magneticCleanups.push(() => {
          el.removeEventListener("mousemove", handleMove);
          el.removeEventListener("mouseleave", handleLeave);
        });
      });

      // ---- Mouse parallax tilt ----
      let tiltCleanup: (() => void) | undefined;
      if (sectionRef.current && visualCardRef.current) {
        const rotateX = gsap.quickTo(visualCardRef.current, "rotateX", { duration: 0.6, ease: "power3.out" });
        const rotateY = gsap.quickTo(visualCardRef.current, "rotateY", { duration: 0.6, ease: "power3.out" });
        const blob1X = gsap.quickTo(blobRef1.current, "x", { duration: 0.8, ease: "power3.out" });
        const blob1Y = gsap.quickTo(blobRef1.current, "y", { duration: 0.8, ease: "power3.out" });
        const blob2X = gsap.quickTo(blobRef2.current, "x", { duration: 0.9, ease: "power3.out" });
        const blob2Y = gsap.quickTo(blobRef2.current, "y", { duration: 0.9, ease: "power3.out" });

        const handleSectionMove = (e: MouseEvent) => {
          const rect = sectionRef.current!.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          rotateY(px * 10);
          rotateX(-py * 10);
          blob1X(px * 26);
          blob1Y(py * 26);
          blob2X(px * -20);
          blob2Y(py * -20);
        };
        const sectionEl = sectionRef.current;
        sectionEl.addEventListener("mousemove", handleSectionMove);
        tiltCleanup = () => sectionEl.removeEventListener("mousemove", handleSectionMove);
      }

      // ---- Scroll parallax ----
      gsap.to(visualWrapRef.current, { y: 60, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(blobRef1.current, { y: -80, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true } });

      return () => {
        marqueeCleanup?.();
        magneticCleanups.forEach((fn) => fn());
        tiltCleanup?.();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const marqueeItems = [...TRACKS, ...TRACKS];

  return (
    <section ref={sectionRef} className="relative overflow-hidden -mt-16 lg:-mt-20 pb-20 lg:pb-16 bg-white">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(91,79,224,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 65% 65% at 70% 30%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 70% 30%, black, transparent)",
        }}
      />
      {/* Gradient mesh blobs */}
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[560px] w-[560px] rounded-full opacity-[0.55] blur-3xl"
        style={{ background: `radial-gradient(circle, ${ACCENT_SOFT}, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full opacity-[0.4] blur-3xl"
        style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-16 px-6 pt-20 lg:grid-cols-2 lg:pt-28">
        {/* Left: copy */}
        <div>
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-black/[.08] bg-black/[.02] px-4 py-1.5 text-[13px] font-medium"
            style={{ fontFamily: FONT_MONO, color: INK_SOFT }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
            Live Training Since 2016
          </div>

          <h1
            ref={headingRef}
            className="relative mt-5 text-[42px] font-extrabold leading-[1.08] tracking-tight sm:text-[58px]"
            style={{ fontFamily: FONT_DISPLAY, color: INK }}
          >
            <div>
              {HEADING_LINE_1.map((w, i) => (
                <span key={i}>
                  <Word text={w} />{" "}
                </span>
              ))}
            </div>
            <div className="relative inline-block">
              {HEADING_LINE_2.map((w, i) => (
                <span key={i}>
                  <Word text={w} gradient />{" "}
                </span>
              ))}
              <svg viewBox="0 0 320 24" className="pointer-events-none absolute -bottom-3 left-0 h-4 w-full" preserveAspectRatio="none">
                <path
                  ref={underlinePathRef}
                  d="M2 16 C 60 4, 120 22, 180 10 S 280 4, 318 14"
                  fill="none"
                  stroke={ACCENT}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="340"
                  opacity="0.55"
                />
              </svg>
            </div>
          </h1>

          <p ref={paraRef} className="mt-6 max-w-md text-[16.5px] leading-7" style={{ color: INK_SOFT }}>
            Join Ceptra for live, mentor-led Salesforce and tech training — small
            batches, real project work, and mentors who track every student by
            name, not by ticket number.
          </p>

          <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              ref={primaryBtnRef}
              href="/contact-us/"
              className="inline-flex h-12 items-center justify-center rounded-full px-6 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,79,224,0.55)]"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
            >
              Book Free Demo Class
            </Link>
            <Link
              ref={secondaryBtnRef}
              href="#placement"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/[.1] px-6 text-[14.5px] font-semibold transition-colors duration-200 hover:bg-black/[.03]"
              style={{ color: INK }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: INK }}>
                <svg viewBox="0 0 10 10" className="ml-[1px] h-2.5 w-2.5">
                  <path d="M1 1l7 4-7 4z" fill="currentColor" />
                </svg>
              </span>
              See Placement Results
            </Link>
          </div>

          <div ref={proofRef} className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[ACCENT, ACCENT_SOFT, INK].map((c, i) => (
                <span key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white" style={{ background: c }}>
                  {["S", "M", "R"][i]}
                </span>
              ))}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black/[.05] text-[10.5px] font-semibold" style={{ color: INK }}>
                +5K
              </span>
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
                    <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
                  </svg>
                ))}
              </div>
              <div className="text-[12.5px]" style={{ color: INK_SOFT }}>
                Trusted by 5,000+ students &amp; professionals
              </div>
            </div>
          </div>

          {/* Infinite track marquee */}
          <div className="relative mt-8 max-w-lg overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div ref={marqueeRef} className="flex w-max items-center gap-3">
              {marqueeItems.map((track, i) => (
                <span
                  key={i}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-black/[.07] bg-black/[.015] px-3.5 py-1.5 text-[12.5px] font-medium"
                  style={{ color: "#3A3A46" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: i % 2 === 0 ? ACCENT : ACCENT_SOFT }} />
                  {track}
                </span>
              ))}
            </div>
          </div>

          <div ref={statsRef} className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 rounded-2xl border border-black/[.06] bg-black/[.015] p-6 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <div key={stat.label}>
                <div className="text-[20px] font-bold" style={{ color: INK }}>
                  <span
                    ref={(el) => {
                      statValueRefs.current[i] = el;
                    }}
                  >
                    0{stat.suffix}
                  </span>
                </div>
                <div className="mt-0.5 text-[12.5px]" style={{ color: INK_SOFT }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: layered visual composition — a results/outcome card */}
        <div className="relative flex items-center justify-center py-10" style={{ perspective: 1000 }}>
          <div
            ref={blobRef1}
            className="pointer-events-none absolute h-[440px] w-[440px] rounded-[45%] opacity-[0.18] blur-2xl"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
          />
          <div
            ref={blobRef2}
            className="pointer-events-none absolute h-[300px] w-[300px] translate-x-16 translate-y-24 rounded-[40%] opacity-[0.15] blur-2xl"
            style={{ background: `linear-gradient(135deg, ${ACCENT_DEEP}, ${ACCENT_SOFT})` }}
          />
          <div
            ref={ringRef}
            className="pointer-events-none absolute h-[400px] w-[400px] rounded-full border border-dashed opacity-30"
            style={{ borderColor: ACCENT }}
          />

          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              ref={(el) => {
                particleRefs.current[i] = el;
              }}
              className="pointer-events-none absolute h-2 w-2 rounded-full"
              style={{ background: i % 2 === 0 ? ACCENT : ACCENT_SOFT, top: `${12 + i * 17}%`, left: i % 2 === 0 ? "2%" : "94%", opacity: 0.5 }}
            />
          ))}

          <div ref={visualWrapRef} className="relative w-full max-w-md" style={{ transformStyle: "preserve-3d" }}>
            <div
              ref={ghostCardRef}
              className="absolute inset-0 -z-10 translate-x-6 translate-y-8 rotate-[-8deg] rounded-3xl border border-black/[.05] opacity-70 blur-[1px]"
              style={{ background: `linear-gradient(160deg, ${ACCENT_SOFT}18, ${ACCENT}0d)` }}
            />

            <div ref={visualCardOuterRef} style={{ transformStyle: "preserve-3d" }}>
              <div ref={visualCardRef} className="relative rounded-3xl border border-black/[.06] bg-white p-5 shadow-[0_40px_80px_-24px_rgba(20,20,40,0.32)]" style={{ transformStyle: "preserve-3d" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                  </div>
                  <span className="rounded-full bg-black/[.04] px-2.5 py-1 text-[10.5px] font-semibold" style={{ color: INK_SOFT }}>
                    Batch 2026
                  </span>
                </div>

                <div className="mt-4 flex h-44 items-center justify-center overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}>
                  <div ref={iconRef}>
                    {/* Trophy icon — placement outcome, not a course-progress ring */}
                    <svg viewBox="0 0 48 48" className="h-16 w-16" fill="none">
                      <path d="M16 8h16v10a8 8 0 0 1-16 0V8z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="white" fillOpacity="0.15" />
                      <path d="M16 10h-5a4 4 0 0 0 4 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M32 10h5a4 4 0 0 1-4 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M24 26v6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M17 40h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M19 32h10l1.5 8h-13z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="white" fillOpacity="0.12" />
                    </svg>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-40 rounded-full bg-black/[.08]" />
                    <div className="h-2.5 w-24 rounded-full bg-black/[.06]" />
                  </div>
                  <span className="rounded-full bg-black/[.05] px-3 py-1 text-[12px] font-semibold" style={{ color: INK }}>
                    ₹18 LPA
                  </span>
                </div>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-black/[.06]">
                  <div ref={progressBarRef} className="h-full w-[92%] origin-left rounded-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})` }} />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/[.05] pt-4">
                  <div className="flex -space-x-2">
                    {[ACCENT, ACCENT_SOFT, INK].map((c, i) => (
                      <span
                        key={i}
                        ref={(el) => {
                          avatarRefs.current[i] = el;
                        }}
                        className="h-7 w-7 rounded-full border-2 border-white"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[12px] font-medium" style={{ color: INK_SOFT }}>
                    340+ hires this year
                  </span>
                </div>
              </div>
            </div>

            {/* Floating badge: affiliation/recognition */}
            <div ref={badgeCard1Ref} className="absolute lg:-left-10 top-8 flex items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: ACCENT }}>
                <svg viewBox="0 0 16 16" className="h-4 w-4">
                  <path d="M3 8l3.5 3.5L13 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </span>
              <div>
                <div className="text-[12.5px] font-semibold" style={{ color: INK }}>ISO Certified</div>
                <div className="text-[11px]" style={{ color: "#8A8A94" }}>Recognized institute</div>
              </div>
            </div>

            {/* Floating badge: rating */}
            <div ref={badgeCard2Ref} className="absolute -bottom-8 -right-4 lg:-right-8 flex items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)]">
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

            {/* Floating badge: small batch size */}
            <div ref={badgeCard3Ref} className="absolute -right-10 top-1/2 hidden -translate-y-1/2 items-center gap-2.5 rounded-2xl border border-black/[.06] bg-white px-3.5 py-2.5 shadow-[0_18px_38px_-12px_rgba(20,20,40,0.28)] sm:flex">
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
          </div>
        </div>
      </div>
    </section>
  );
}