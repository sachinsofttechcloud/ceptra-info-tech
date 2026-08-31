"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Font note: authored around Space Grotesk (display) + JetBrains Mono
 * (eyebrow / step labels) + Inter (body copy) — matching the rest of the
 * site. Load via `next/font/google` in your root layout for production;
 * system fallbacks are included so it renders correctly as-is.
 *
 * Hiring-partner names below are placeholders (generic, non-trademarked)
 * so nothing here reproduces a real company's logo or mark — swap
 * `PARTNERS` for your actual partner names/logos before shipping.
 */

const PAPER = "#FAFAF8";
const INK = "#14141C";
const INK_SOFT = "#5B5B68";
const LINE = "rgba(20,20,28,0.09)";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

type Stat = { value: number; suffix: string; label: string };

const STATS: Stat[] = [
  { value: 92, suffix: "%", label: "Placement Rate" },
  { value: 6.5, suffix: " LPA", label: "Average Package" },
  { value: 18, suffix: " LPA", label: "Highest Package" },
  { value: 150, suffix: "+", label: "Hiring Partners" },
];

type Step = { title: string; description: string };

interface PlacementsProps {
  id?: string;
}

const STEPS: Step[] = [
  { title: "Resume & Portfolio", description: "We rebuild your resume and portfolio around real project work, not just course completion." },
  { title: "Mock Interviews", description: "Practice rounds with mentors covering technical, behavioral and role specific questions." },
  { title: "Employer Referrals", description: "Direct introductions into our hiring partner network based on your track and strengths." },
  { title: "Offer & Negotiation", description: "Guidance through final rounds, offer review and salary negotiation before you sign." },
];

// Generic placeholder names — replace with your real hiring partners.
const PARTNERS = [
  "NimbusWorks",
  "BrightPath Tech",
  "Vertex Digital",
  "CloudNine Solutions",
  "Northgate Systems",
  "Solaris Consulting",
  "Bluepeak Labs",
  "Meridian Software",
];

function formatStat(stat: Stat) {
  return (Number.isInteger(stat.value) ? stat.value.toString() : stat.value.toFixed(1)) + stat.suffix;
}

export default function Placements({ id }: PlacementsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<Array<HTMLDivElement | null>>([]);
  const statValueRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const directional = (el: Element | null, dy = 20) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 78%",
          end: "bottom 15%",
          onEnter: () => gsap.fromTo(el, { y: dy }, { y: 0, duration: 0.55, ease: "power3.out" }),
          onEnterBack: () => gsap.fromTo(el, { y: -dy }, { y: 0, duration: 0.55, ease: "power3.out" }),
        });
      };

      directional(headingRef.current, 20);

      statRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          end: "bottom 10%",
          onEnter: () => gsap.fromTo(el, { y: 18 }, { y: 0, duration: 0.5, delay: i * 0.05, ease: "power3.out" }),
          onEnterBack: () => gsap.fromTo(el, { y: -18 }, { y: 0, duration: 0.5, ease: "power3.out" }),
        });
      });

      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          end: "bottom 10%",
          onEnter: () => gsap.fromTo(el, { y: 20 }, { y: 0, duration: 0.5, delay: i * 0.07, ease: "power3.out" }),
          onEnterBack: () => gsap.fromTo(el, { y: -20 }, { y: 0, duration: 0.5, ease: "power3.out" }),
        });
      });

      // Count-up stats — DOM already shows the final value as a safe default.
      STATS.forEach((stat, i) => {
        const el = statValueRefs.current[i];
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            const counter = { val: 0 };
            gsap.to(counter, {
              val: stat.value,
              duration: 1.3,
              ease: "power2.out",
              onUpdate: () => {
                const v = Number.isInteger(stat.value) ? Math.round(counter.val) : counter.val.toFixed(1);
                el.textContent = v + stat.suffix;
              },
            });
          },
        });
      });

      // Infinite marquee of hiring-partner names — continuous, no scroll
      // dependency, seamless loop via a duplicated list shifted by -50%.
      if (marqueeRef.current) {
        gsap.to(marqueeRef.current, {
          xPercent: -50,
          duration: 26,
          repeat: -1,
          ease: "none",
        });
      }

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
    <section id={id} ref={sectionRef} className="relative overflow-hidden py-12 lg:py-20" style={{ background: PAPER, fontFamily: FONT_BODY, color: INK }}>
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Header */}
        <div ref={headingRef} className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em]"
            style={{ fontFamily: FONT_MONO, color: ACCENT_DEEP }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
            Placements
          </div>
          <h2 className="mt-4 text-[32px] font-medium leading-[1.15] tracking-tight sm:text-[42px]" style={{ fontFamily: FONT_DISPLAY }}>
            Where our students
            <br />
            land next.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-7" style={{ color: INK_SOFT }}>
            {`Placement support isn't a one off session it's built into every track, from
            resume to offer letter.`}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              ref={(el) => {
                statRefs.current[i] = el;
              }}
              className="rounded-2xl border p-5"
              style={{ borderColor: LINE, background: "white" }}
            >
              <div
                className="text-[26px] font-medium tabular-nums sm:text-[30px]"
                style={{
                  fontFamily: FONT_DISPLAY,
                  backgroundImage: `linear-gradient(135deg, ${ACCENT_DEEP}, ${ACCENT})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                <span
                  ref={(el) => {
                    statValueRefs.current[i] = el;
                  }}
                >
                  {formatStat(stat)}
                </span>
              </div>
              <div className="mt-1.5 text-[11.5px] uppercase tracking-wide" style={{ fontFamily: FONT_MONO, color: INK_SOFT }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="relative mt-16">
          <div className="hidden h-px sm:block" style={{ background: LINE, marginBottom: -1 }} />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4 sm:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                    style={{ fontFamily: FONT_MONO, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {i < STEPS.length - 1 && <span className="h-px flex-1 sm:hidden" style={{ background: LINE }} />}
                </div>
                <h3 className="mt-3 text-[16px] font-medium" style={{ fontFamily: FONT_DISPLAY }}>
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-6" style={{ color: INK_SOFT }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring partner marquee */}
        <div className="mt-16 border-t pt-10" style={{ borderColor: LINE }}>
          <div className="text-center text-[11.5px] uppercase tracking-wide" style={{ fontFamily: FONT_MONO, color: INK_SOFT }}>
            Our alumni work at
          </div>
          <div
            className="relative mt-6 overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div ref={marqueeRef} className="flex w-max items-center gap-12">
              {[...PARTNERS, ...PARTNERS].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="whitespace-nowrap text-[18px] font-medium"
                  style={{ fontFamily: FONT_DISPLAY, color: INK_SOFT }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/contact-us/"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
          >
            Talk to Placement Team
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}