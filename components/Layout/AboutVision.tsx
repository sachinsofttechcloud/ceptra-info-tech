"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";
const ACCENT = "#5B4FE0";

export const AboutVision = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingBoxRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const badgeRowRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ============================================================
         HEADING (badge + title) — smooth fade in / fade out with a
         gentle rise underneath the fade, reversible on scroll back
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
              start: "top 85%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      /* ============================================================
         PARAGRAPHS — smooth fade in / fade out, staggered
      ============================================================ */
      paragraphRefs.current.forEach((para, i) => {
        if (!para) return;
        gsap.fromTo(
          para,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: i * 0.15,
            scrollTrigger: {
              trigger: para,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      /* ============================================================
         PILL TAGS — same smooth fade, staggered a touch faster
      ============================================================ */
      const badgeEls = gsap.utils.toArray<HTMLElement>(".fade-badge", badgeRowRef.current);
      badgeEls.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            delay: i * 0.1,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      /* ============================================================
         RIGHT IMAGE — fade in from the RIGHT (opposite of the
         AboutUs section, since the image sits on the right here),
         reversible
      ============================================================ */
      if (rightImageRef.current) {
        gsap.fromTo(
          rightImageRef.current,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: rightImageRef.current,
              start: "top 82%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }

      /* ============================================================
         FLOATING "EXCELLENCE" BADGE — pops in slightly after the
         image, reversible
      ============================================================ */
      if (floatingBadgeRef.current) {
        gsap.fromTo(
          floatingBadgeRef.current,
          { opacity: 0, y: 16, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: 0.2,
            ease: "back.out(1.6)",
            scrollTrigger: {
              trigger: rightImageRef.current,
              start: "top 82%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
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
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-20 sm:py-28 lg:py-32"
      style={{ fontFamily: FONT_BODY }}
    >
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-violet-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-violet-50/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div ref={headingBoxRef} className="max-w-2xl">
          <span className="fade-heading inline-flex items-center rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
            Our Vission
          </span>
          <h2
            className="fade-heading my-4 text-[32px] font-medium leading-[1.15] tracking-tight sm:text-[42px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            Empowering Aspiring Salesforce Developers to Become Industry-Ready
            Professionals.{" "}
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div ref={leftContentRef} className=" sm:p-10">
            <p
              ref={(el) => {
                paragraphRefs.current[0] = el;
              }}
              className="text-base leading-8 text-slate-700 sm:text-lg"
            >
              We envision transforming Salesforce education by providing
              world-class training that empowers professionals.
            </p>

            <p
              ref={(el) => {
                paragraphRefs.current[1] = el;
              }}
              className="mt-6 text-base leading-8 text-slate-700 sm:text-lg"
            >
              Our mission is to bridge the gap between industry demands and
              student capabilities through practical, hands-on learning
              experiences.
            </p>

            <p
              ref={(el) => {
                paragraphRefs.current[2] = el;
              }}
              className="mt-6 text-base leading-8 text-slate-700 sm:text-lg"
            >
              We aspire to be the trusted partner for every student seeking
              excellence, innovation, and career growth opportunities.
            </p>

            <div ref={badgeRowRef} className="mt-8 flex gap-4 flex-wrap">
              <div className="fade-badge inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                Quality Training
              </div>
              <div className="fade-badge inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                Industry Ready
              </div>
              <div className="fade-badge inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                Career Growth
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div ref={rightImageRef} className="relative">
            <div className="relative overflow-hidden rounded-[28px] border border-violet-100 bg-white p-3 shadow-[0_24px_70px_rgba(107,92,255,0.12)]">
              <div className="relative aspect-4/3 overflow-hidden rounded-[22px]">
                {/* Desktop Image */}
                <Image
                  src="/about-us/vision/about-vision-D.avif"
                  alt="Vision - Future Growth and Leadership"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="hidden object-cover transition-transform duration-700 hover:scale-105 lg:block"
                  quality={90}
                />

                {/* Mobile Image */}
                <Image
                  src="/about-us/vision/about-vision-M.avif"
                  alt="Vision - Future Growth and Leadership"
                  fill
                  sizes="100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105 lg:hidden"
                  quality={90}
                />
              </div>
            </div>

            {/* Floating accent badge */}
            <div
              ref={floatingBadgeRef}
              className="absolute -bottom-6 -right-6 rounded-2xl border border-white bg-white px-6 py-4 shadow-[0_12px_40px_rgba(107,92,255,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-violet-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Excellence</p>
                  <p className="text-xs text-slate-600">Our Commitment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutVision;