"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Font note: authored around Space Grotesk (display / big numbers) +
 * JetBrains Mono (labels / eyebrows) + Inter (body copy) — matching the
 * Course Catalog section. Load via `next/font/google` in your root layout
 * for production; system fallbacks are included so it renders as-is.
 */

const PAPER = "#FAFAF8";
const INK = "#14141C";
const INK_SOFT = "#5B5B68";
const LINE = "rgba(20,20,28,0.10)";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

const HERO_STAT = { value: 92, suffix: "%", label: "Placement Rate" };

type MiniStat = { value: number; suffix: string; label: string };

const MINI_STATS: MiniStat[] = [
  { value: 5000, suffix: "+", label: "Students Trained" },
  { value: 8, suffix: "+", label: "Years Running" },
  { value: 20, suffix: "", label: "Avg. Batch Size" },
];

type Reason = {
  title: string;
  description: string;
  icon: "mentor" | "project" | "seats" | "support" | "curriculum";
};

const REASONS: Reason[] = [
  {
    title: "Live, mentor-led batches",
    description: "No pre-recorded playlists every session is taught live by working practitioners who answer questions in real time.",
    icon: "mentor",
  },
  {
    title: "Real project portfolios",
    description: "You leave with deployable work you built, not just a certificate of attendance the kind of portfolio hiring managers actually look at.",
    icon: "project",
  },
  {
    title: "Small batch sizes",
    description: "Capped enrollment so mentors can track progress and answer questions by name, instead of getting lost in a large cohort.",
    icon: "seats",
  },
  {
    title: "Placement support",
    description: "Resume reviews, mock interviews and direct referrals into our hiring partner network built into every track, not an add-on.",
    icon: "support",
  },
  {
    title: "Industry aligned curriculum",
    description: "Updated every cohort to track what Salesforce and hiring teams actually use now, not what was current two years ago.",
    icon: "curriculum",
  },
];

function ReasonIcon({ type, color }: { type: Reason["icon"]; color: string }) {
  const common = { stroke: color, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  switch (type) {
    case "mentor":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle cx="12" cy="8" r="3.2" {...common} />
          <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" {...common} />
        </svg>
      );
    case "project":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M8 8L3 12l5 4M16 8l5 4-5 4M13.5 6l-3 12" {...common} />
        </svg>
      );
    case "seats":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <circle cx="7" cy="8" r="2.6" {...common} />
          <circle cx="17" cy="8" r="2.6" {...common} />
          <path d="M2.5 19c0-3 2.2-5 4.5-5s4.5 2 4.5 5M12.5 19c0-3 2.2-5 4.5-5s4.5 2 4.5 5" {...common} />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M12 3.5c-4.7 0-8.5 3.4-8.5 8.2 0 1.9.6 3.6 1.7 5L4 20.5l3.9-1.1a9 9 0 0 0 4.1 1c4.7 0 8.5-3.4 8.5-8.2S16.7 3.5 12 3.5z" {...common} />
        </svg>
      );
    case "curriculum":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13z" {...common} />
          <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13z" {...common} />
        </svg>
      );
  }
}

const RING_RADIUS = 78;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const ringColRef = useRef<HTMLDivElement>(null);
  const listColRef = useRef<HTMLDivElement>(null);
  const ringProgressRef = useRef<SVGCircleElement>(null);
  const ringValueRef = useRef<HTMLSpanElement>(null);
  const miniStatRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const accordionBodyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const meshOuterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const meshInnerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const shapeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const reasonRowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? -1 : i));
  };

  // Accordion open/close animation — height + rotation, no opacity involved
  useEffect(() => {
    accordionBodyRefs.current.forEach((body, i) => {
      if (!body) return;
      if (i === openIndex) {
        const h = body.scrollHeight;
        gsap.to(body, { height: h, duration: 0.4, ease: "power3.out" });
      } else {
        gsap.to(body, { height: 0, duration: 0.35, ease: "power3.inOut" });
      }
    });
  }, [openIndex]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const directional = (el: Element | null, dx: number, dy = 0) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 78%",
          end: "bottom 15%",
          onEnter: () => gsap.fromTo(el, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }),
          onEnterBack: () => gsap.fromTo(el, { x: -dx, y: -dy }, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }),
        });
      };

      directional(headingRef.current, 0, 20);

      // Ring column: bouncier scale-in with overshoot, plus the usual
      // direction-aware x-slide
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 78%",
        end: "bottom 15%",
        onEnter: () => {
          gsap.fromTo(ringColRef.current, { x: -28 }, { x: 0, duration: 0.6, ease: "power3.out" });
          gsap.fromTo(ringColRef.current, { scale: 0.85 }, { scale: 1, duration: 0.7, ease: "back.out(1.6)" });
        },
        onEnterBack: () => {
          gsap.fromTo(ringColRef.current, { x: 28 }, { x: 0, duration: 0.6, ease: "power3.out" });
          gsap.fromTo(ringColRef.current, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: "power3.out" });
        },
      });
      directional(listColRef.current, 28);

      // Ring wrapper drifts a slow continuous rotation tied to scroll —
      // separate element from the strokeDashoffset fill, so they never fight.
      gsap.to(ringWrapRef.current, {
        rotate: 12,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1 },
      });

      // Accordion rows: staggered pop-in with a light overshoot for a
      // livelier, less flat reveal
      reasonRowRefs.current.forEach((row, i) => {
        if (!row) return;
        ScrollTrigger.create({
          trigger: row,
          start: "top 92%",
          end: "bottom 10%",
          onEnter: () =>
            gsap.fromTo(
              row,
              { y: 22, scale: 0.97 },
              { y: 0, scale: 1, duration: 0.5, delay: i * 0.06, ease: "back.out(1.7)" }
            ),
          onEnterBack: () => gsap.fromTo(row, { y: -18 }, { y: 0, duration: 0.45, ease: "power3.out" }),
        });
      });

      // Background: ambient blob drift (inner) + independent scroll parallax
      // (outer wrapper) — split so the two motions never fight each other.
      meshInnerRefs.current.forEach((blob, i) => {
        if (!blob) return;
        gsap.to(blob, {
          x: i % 2 === 0 ? 34 : -28,
          y: i % 2 === 0 ? -24 : 30,
          scale: 1.12,
          duration: 7 + i * 1.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      meshOuterRefs.current.forEach((wrapper, i) => {
        if (!wrapper) return;
        gsap.to(wrapper, {
          yPercent: i % 2 === 0 ? 24 : -18,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1 + i * 0.3 },
        });
      });

      // Background: small floating shapes — continuous rotation + bob
      shapeRefs.current.forEach((shape, i) => {
        if (!shape) return;
        gsap.to(shape, { rotate: i % 2 === 0 ? 360 : -360, duration: 24 + i * 6, repeat: -1, ease: "none" });
        gsap.to(shape, { y: -12, duration: 3.2 + i * 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });

      // Background: dot grid gently pans + fades in with scroll
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { opacity: 0, backgroundPosition: "0px 0px" },
          {
            opacity: 1,
            backgroundPosition: "36px 36px",
            ease: "none",
            scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "top 20%", scrub: 1 },
          }
        );
      }

      // Ring fill + count-up, once, triggered by scroll — DOM already shows
      // the final numeral (see JSX) so a missed trigger never leaves it wrong.
      if (ringProgressRef.current) {
        gsap.set(ringProgressRef.current, { strokeDasharray: RING_CIRCUMFERENCE, strokeDashoffset: RING_CIRCUMFERENCE });
      }
      ScrollTrigger.create({
        trigger: ringColRef.current,
        start: "top 75%",
        once: true,
        onEnter: () => {
          const counter = { val: 0 };
          gsap.to(ringProgressRef.current, {
            strokeDashoffset: RING_CIRCUMFERENCE * (1 - HERO_STAT.value / 100),
            duration: 1.6,
            ease: "power2.out",
          });
          gsap.to(counter, {
            val: HERO_STAT.value,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              if (ringValueRef.current) ringValueRef.current.textContent = Math.round(counter.val) + HERO_STAT.suffix;
            },
          });
        },
      });

      MINI_STATS.forEach((stat, i) => {
        const el = miniStatRefs.current[i];
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          once: true,
          onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: stat.value,
              duration: 1.2,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = Math.round(counter.val).toLocaleString() + stat.suffix;
              },
            });
          },
        });
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const t = setTimeout(refresh, 300);
      return () => {
        window.removeEventListener("load", refresh);
        clearTimeout(t);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-12 lg:py-20" style={{ fontFamily: FONT_BODY, color: INK }}>
      {/* Gradient wash base */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, #F3F1FC 0%, ${PAPER} 45%, #FDF6F0 100%)` }}
      />
      {/* Animated background layer */}
      <div className="pointer-events-none absolute inset-0">
        <div
          ref={gridRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${INK}12 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 65% 55% at 50% 35%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 50% 35%, black 40%, transparent 100%)",
          }}
        />

        <div ref={(el) => { meshOuterRefs.current[0] = el; }} className="absolute -right-32 -top-10 h-[420px] w-[420px]">
          <div
            ref={(el) => { meshInnerRefs.current[0] = el; }}
            className="h-full w-full rounded-full opacity-[0.10] blur-[100px]"
            style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
          />
        </div>
        <div ref={(el) => { meshOuterRefs.current[1] = el; }} className="absolute -left-24 bottom-0 h-[340px] w-[340px]">
          <div
            ref={(el) => { meshInnerRefs.current[1] = el; }}
            className="h-full w-full rounded-full opacity-[0.08] blur-[90px]"
            style={{ background: `radial-gradient(circle, ${ACCENT_SOFT}, transparent 70%)` }}
          />
        </div>

        <div
          ref={(el) => { shapeRefs.current[0] = el; }}
          className="absolute left-[6%] top-[20%] h-9 w-9 rounded-xl border"
          style={{ borderColor: `${ACCENT}30` }}
        />
        <div
          ref={(el) => { shapeRefs.current[1] = el; }}
          className="absolute right-[8%] bottom-[16%] h-5 w-5 rounded-full border-2"
          style={{ borderColor: `${ACCENT_SOFT}40` }}
        />
        <div
          ref={(el) => { shapeRefs.current[2] = el; }}
          className="absolute right-[30%] top-[12%] h-2.5 w-2.5 rounded-full"
          style={{ background: `${ACCENT_DEEP}45` }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6">
        {/* Header */}
        <div ref={headingRef} className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em]"
            style={{ fontFamily: FONT_MONO, color: ACCENT_DEEP }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
            Why Ceptra
          </div>
          <h2 className="mt-4 text-[34px] font-medium leading-[1.1] tracking-tight sm:text-[46px]" style={{ fontFamily: FONT_DISPLAY }}>
            Built for outcomes,
            <br />
            not attendance certificates.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-[320px_1fr] lg:gap-16">
          {/* Left: hero stat ring + mini stats */}
          <div ref={ringColRef} className="flex flex-col items-center lg:items-start">
            <div className="relative h-[200px] w-[200px]">
              <div ref={ringWrapRef} className="absolute inset-0">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke={LINE} strokeWidth="14" />
                <circle
                  ref={ringProgressRef}
                  cx="100"
                  cy="100"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={ACCENT_DEEP} />
                    <stop offset="100%" stopColor={ACCENT_SOFT} />
                  </linearGradient>
                </defs>
                </svg>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[40px] font-medium leading-none" style={{ fontFamily: FONT_DISPLAY }}>
                  <span ref={ringValueRef}>
                    {HERO_STAT.value}
                    {HERO_STAT.suffix}
                  </span>
                </span>
                <span className="mt-1 text-[11px] uppercase tracking-wide" style={{ fontFamily: FONT_MONO, color: INK_SOFT }}>
                  {HERO_STAT.label}
                </span>
              </div>
            </div>

            <div className="mt-8 flex w-full flex-col gap-4 border-t pt-6" style={{ borderColor: LINE }}>
              {MINI_STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-[12.5px]" style={{ color: INK_SOFT }}>
                    {stat.label}
                  </span>
                  <span
                    className="text-[16px] font-medium tabular-nums"
                    style={{ fontFamily: FONT_DISPLAY, color: ACCENT_DEEP }}
                  >
                    <span
                      ref={(el) => {
                        miniStatRefs.current[i] = el;
                      }}
                    >
                      {stat.value.toLocaleString()}
                      {stat.suffix}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: accordion */}
          <div ref={listColRef} className="flex flex-col">
            {REASONS.map((reason, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={reason.title}
                  ref={(el) => {
                    reasonRowRefs.current[i] = el;
                  }}
                  className="border-b"
                  style={{ borderColor: LINE }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className="flex w-full items-center gap-4 py-5 text-left"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
                      style={{ background: isOpen ? `${ACCENT}14` : "transparent", border: `1px solid ${isOpen ? "transparent" : LINE}` }}
                    >
                      <ReasonIcon type={reason.icon} color={isOpen ? ACCENT : INK_SOFT} />
                    </span>
                    <span
                      className="flex-1 text-[17px]"
                      style={{ fontFamily: FONT_DISPLAY, fontWeight: isOpen ? 600 : 500, color: isOpen ? INK : INK_SOFT }}
                    >
                      {reason.title}
                    </span>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-300"
                      style={{ border: `1px solid ${LINE}`, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                    >
                      <svg viewBox="0 0 12 12" className="h-3 w-3">
                        <path d="M6 1v10M1 6h10" stroke={isOpen ? ACCENT : INK_SOFT} strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <div
                    ref={(el) => {
                      accordionBodyRefs.current[i] = el;
                    }}
                    className="overflow-hidden"
                    style={{ height: i === openIndex ? "auto" : 0 }}
                  >
                    <p className="max-w-lg pb-5 pl-14 text-[13.5px] leading-6" style={{ color: INK_SOFT }}>
                      {reason.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}