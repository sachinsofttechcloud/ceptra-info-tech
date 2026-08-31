"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

const skillPoints = [
  "Salesforce Admin",
  "Development",
  "Lightning Aura Components",
  "Lightning Web Components",
  "Integration Projects",
];

export function AboutMission() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingBoxRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const skillListRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* ============================================================
         HEADING (badge + title) — smooth fade in / fade out with a
         gentle rise, reversible on scroll back
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
         "CAREER DRIVEN" BADGE — fades in from the right with a
         soft pop, reversible
      ============================================================ */
      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { opacity: 0, x: 30, scale: 0.94 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.7,
            ease: "back.out(1.6)",
            scrollTrigger: {
              trigger: badgeRef.current,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }

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
         FLOATING CARD (small teamwork photo) — enters with a fade +
         scale pop first, THEN starts its continuous float once the
         entrance settles, instead of just appearing mid-bounce
      ============================================================ */
      if (cardRef.current) {
        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
            toggleActions: "play reverse play reverse",
          },
        });

        entranceTl.fromTo(
          cardRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.25, ease: "back.out(1.5)" },
        );

        // continuous float, starts only after the entrance pop finishes
        gsap.to(cardRef.current, {
          y: -15,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1,
        });
      }

      /* ============================================================
         CONTENT COLUMN — kicker + paragraphs fade in smoothly,
         reversible
      ============================================================ */
      const contentTextEls = gsap.utils.toArray<HTMLElement>(".fade-text", contentRef.current);
      contentTextEls.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: i * 0.12,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      /* ============================================================
         SKILL CHECKLIST — each item pops in (icon scales, text
         fades up) with a stagger, reversible
      ============================================================ */
      const skillItems = gsap.utils.toArray<HTMLElement>("li", skillListRef.current);
      skillItems.forEach((li, i) => {
        const icon = li.querySelector(".skill-icon");
        const label = li.querySelector(".skill-label");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: li,
            start: "top 92%",
            toggleActions: "play reverse play reverse",
          },
        });

        if (icon) {
          tl.fromTo(
            icon,
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
            i * 0.08,
          );
        }
        if (label) {
          tl.fromTo(
            label,
            { opacity: 0, x: 12 },
            { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" },
            i * 0.08 + 0.05,
          );
        }
      });

      /* ============================================================
         GLOWING BACKGROUND — continuous, unchanged
      ============================================================ */
      gsap.to(".about-mission-glow", {
        scale: 1.14,
        opacity: 0.8,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
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
      className="relative overflow-hidden bg-[#f7f5ff] py-12 sm:py-16 lg:py-20"
    >
      <div className="about-mission-glow absolute -left-16 top-8 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
      <div className="about-mission-glow absolute bottom-0 right-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headingBoxRef}
          className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <span className="fade-heading inline-flex items-center rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
              Our Mission
            </span>
            <h2
              className="fade-heading my-4 text-[32px] font-medium leading-[1.15] tracking-tight sm:text-[42px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Create &ldquo;Salesforce Developer&rdquo; Job Ready Candidates
            </h2>
          </div>

          <div
            ref={badgeRef}
            className="hidden md:inline-flex items-center gap-3 rounded-2xl border border-violet-200 bg-white/80 px-4 py-3 shadow-[0_12px_40px_rgba(91,79,224,0.08)] backdrop-blur"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              ✓
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Career Driven</p>
              <p className="text-xs text-slate-600">Job focused learning</p>
            </div>
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div ref={imageRef} className="relative">
            <div className="rounded-[30px] border border-violet-100 bg-white p-3 shadow-[0_30px_80px_rgba(23,17,82,0.12)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                {/* Desktop Image */}
                <Image
                  src="/about-us/mission/about-mission-D.avif"
                  alt="Salesforce students learning development and integration"
                  fill
                  className="hidden object-cover transition duration-700 hover:scale-105 lg:block"
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />

                {/* Mobile Image */}
                <Image
                  src="/about-us/mission/about-mission-M.avif"
                  alt="Salesforce students learning development and integration"
                  fill
                  className="object-cover transition duration-700 hover:scale-105 lg:hidden"
                  priority
                  sizes="100vw"
                />
              </div>
            </div>

            <div
              ref={cardRef}
              className="absolute -bottom-5 right-4 w-[180px] overflow-hidden rounded-[22px] border border-violet-200 bg-white p-2 shadow-[0_20px_50px_rgba(91,79,224,0.16)] sm:w-[220px]"
            >
              <div className="relative h-28 overflow-hidden rounded-[16px]">
                <Image
                  src="/about-us/vision/about-vision-M.avif"
                  alt="Salesforce project teamwork"
                  fill
                  className="object-cover"
                  sizes="220px"
                />
              </div>
            </div>
          </div>

          <div ref={contentRef} className="relative">
            <div className="fade-text mb-6 inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
              Hands-on Salesforce Training
            </div>

            <p className="fade-text text-base leading-8 text-slate-600 sm:text-lg">
              Students at Ceptra Infotech gain real world Salesforce experience
              and work on practical projects that prepare them for professional
              roles.
            </p>

            <p className="fade-text mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              Our learners are trained to work on Admin tasks, Development,
              Lightning Aura Components, Lightning Web Components, and
              Integration Projects so they become strong, job ready Salesforce
              Developer candidates.
            </p>

            <ul ref={skillListRef} className="mt-8 space-y-4">
              {skillPoints.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="skill-icon mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                    ✓
                  </span>
                  <span className="skill-label text-base font-medium text-slate-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutMission;