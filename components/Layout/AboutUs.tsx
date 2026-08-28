"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

const HIGHLIGHTS = [
  {
    title: "Expert Professional Training",
    description:
      "Ceptra Infotech provides highly skilled and experienced professionals to train students and make them strong for their professional careers.",
    icon: "expert",
  },
  {
    title: "Online Salesforce Training",
    description:
      "Ceptra Infotech provides online Salesforce training with flexible learning options.",
    icon: "online",
  },
  {
    title: "Short Term & Long Term Training",
    description:
      "We offer tailored training programs based on the candidate's learning goals and time availability.",
    icon: "duration",
  },
  {
    title: "Fulfilling Student Needs",
    description:
      "We understand student requirements and guide them with industry-focused learning and support.",
    icon: "student",
  },
];

const BOTTOM_FEATURES = [
  { title: "Best Salesforce Training", subtitle: "In Central India" },
  { title: "Placement Support", subtitle: "Professional Career Growth" },
  { title: "Freelancing Projects", subtitle: "Work with Companies" },
  { title: "Flexible Modes", subtitle: "Online, Short & Long Term" },
];

function FeatureIcon({ type }: { type: string }) {
  const common = {
    stroke: "#5B4FE0",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  switch (type) {
    case "expert":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" {...common} />
          <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" {...common} />
          <path d="M16 11l2 2 4-4" {...common} />
        </svg>
      );
    case "online":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" {...common} />
          <line x1="8" y1="21" x2="16" y2="21" {...common} />
          <line x1="12" y1="17" x2="12" y2="21" {...common} />
        </svg>
      );
    case "duration":
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" {...common} />
          <polyline points="12 6 12 12 16 14" {...common} />
        </svg>
      );
    case "student":
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" {...common} />
          <path d="M6 12v5c3 3 9 3 12 0v-5" {...common} />
        </svg>
      );
  }
}

export default function AboutUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingBoxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const bottomFeaturesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ============================================================
         HEADING (badge + title) — smooth fade in / fade out with a
         gentle rise underneath the fade (not a flat opacity snap),
         reversible on scroll back
      ============================================================ */
      const headingEls = gsap.utils.toArray<HTMLElement>(".fade-heading", headingBoxRef.current);
      headingEls.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: i * 0.15,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      /* ============================================================
         IMAGE — fade in from the LEFT, reversible
      ============================================================ */
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: imageRef.current,
              start: "top 82%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }

      /* ============================================================
         CONTENT TEXT (description paragraphs) — smooth fade in /
         fade out with the same gentle rise, staggered
      ============================================================ */
      const textEls = gsap.utils.toArray<HTMLElement>(".fade-text", contentRef.current);
      textEls.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: i * 0.15,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      /* ============================================================
         HIGHLIGHT CARDS — alternate fade-left / fade-right,
         reversible, gently staggered
      ============================================================ */
      const highlightCards = gsap.utils.toArray<HTMLElement>(
        ".highlight-card",
        highlightsRef.current,
      );
      highlightCards.forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { x: fromLeft ? -48 : 48, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power3.out",
            delay: (i % 4) * 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      /* ============================================================
         BOTTOM FEATURE CARDS — same alternating fade-left / fade-right
      ============================================================ */
      const featureCards = gsap.utils.toArray<HTMLElement>(
        ".feature-card",
        bottomFeaturesRef.current,
      );
      featureCards.forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { x: fromLeft ? -48 : 48, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power3.out",
            delay: (i % 4) * 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
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
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-linear-to-br from-violet-50 via-white to-orange-50 py-20 sm:py-24"
    >
      <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div ref={headingBoxRef} className="max-w-2xl ">
          <span className="fade-heading inline-flex rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
            About Us
          </span>
          <h2
            className="fade-heading my-4 text-[32px] font-medium leading-[1.15] tracking-tight sm:text-[42px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            Our History
          </h2>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div ref={imageRef} className="relative lg:col-span-5">
            <div className="mx-auto max-w-120 overflow-hidden rounded-[28px] border border-violet-100 bg-white p-3 shadow-[0_24px_70px_rgba(107,92,255,0.12)] transition-transform duration-300 hover:-translate-y-1">
              <div className="relative aspect-4/3 overflow-hidden rounded-[22px]">
                {/* Desktop Image */}
                <Image
                  src="/about-us/history/about-history-D.webp"
                  alt="Ceptra Infotech Company History"
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="hidden object-cover transition-transform duration-700 hover:scale-105 md:block"
                  priority
                  quality={90}
                />

                {/* Mobile Image */}
                <Image
                  src="/about-us/history/about-history-M.webp"
                  alt="Ceptra Infotech Company History"
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105 md:hidden"
                  priority
                  quality={90}
                />
              </div>
            </div>
          </div>

          <div ref={contentRef} className="lg:col-span-7">
            <div className="space-y-4 text-base leading-8 text-slate-600 sm:text-lg">
              <p className="fade-text">
                <span className="font-semibold text-slate-900">
                  Ceptra Infotech
                </span>{" "}
                is a Salesforce training and placement institute in Central
                India dedicated to helping students build strong careers in the
                IT industry.
              </p>
              <p className="fade-text">
                We work with companies and provide real-world Salesforce project
                exposure, helping learners gain practical knowledge and
                confidence for job opportunities.
              </p>
            </div>

            <div ref={highlightsRef} className="mt-8 grid gap-4 sm:grid-cols-2">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="highlight-card rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                      <FeatureIcon type={item.icon} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={bottomFeaturesRef}
          className="mt-16 rounded-[28px] border border-violet-100 bg-white/70 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BOTTOM_FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="feature-card rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:bg-violet-50"
              >
                <span className="block text-base font-bold text-violet-700 sm:text-lg">
                  {feature.title}
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  {feature.subtitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}