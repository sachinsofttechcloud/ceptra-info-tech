"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

interface ReasonCard {
  number: string;
  title: string;
  description: string;
  align: "left" | "right";
}

const REASONS: ReasonCard[] = [
  {
    number: "01",
    title: "Real-World Projects",
    description:
      "Get hands-on experience by working on projects that mirror real industry scenarios.",
    align: "left",
  },
  {
    number: "02",
    title: "Industry Experts",
    description:
      "Learn from experienced professionals who are experts in their fields.",
    align: "right",
  },
  {
    number: "03",
    title: "Career Guidance",
    description:
      "Receive guidance and mentorship to help you kickstart your career in the right direction.",
    align: "left",
  },
  {
    number: "04",
    title: "Networking Opportunities",
    description:
      "Build connections with professionals in the industry and expand your network.",
    align: "right",
  },
  {
    number: "05",
    title: "Flexible Schedule",
    description:
      "Our internship program is designed to fit your schedule, allowing you to balance work and studies.",
    align: "left",
  },
];

export default function WhyChooseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingBoxRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ==========================================
      // HEADING ANIMATION
      // ==========================================
      gsap.fromTo(
        headingBoxRef.current,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingBoxRef.current,
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // ==========================================
      // SCROLL-LINKED CARD REVEAL
      // Each card's animation progress is bound directly
      // to scroll position via scrub (not a one-shot play).
      // Scrubbing runs against the card itself in normal
      // document flow — nothing is pinned or cropped, so
      // there's no reserved blank space to leak.
      // ==========================================
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const reason = REASONS[i];
        const fromX = reason.align === "left" ? -80 : 80;

        gsap.fromTo(
          card,
          { x: fromX, opacity: 0, scale: 0.94 },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 95%",   // animation begins as card enters viewport
              end: "top 55%",     // finishes once card nears center
              scrub: 0.6,          // ties progress to scroll position
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full bg-white">
      {/* ==========================================
          HEADING
      ========================================== */}
      <div
        ref={headingBoxRef}
        className="
          mx-auto w-full max-w-4xl px-5 pb-6 pt-8
          sm:px-8 sm:pb-8 sm:pt-10
          lg:px-10
          mt-4
        "
      >
        <span
          className="
            inline-flex rounded-full border border-violet-200 bg-violet-100
            px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]
            text-violet-700
          "
        >
          Internship
        </span>

        <h2
          className="my-2 text-[28px] font-medium leading-[1.15] tracking-tight sm:text-[36px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          Why Choose E-LearningIT for Your Internship?
        </h2>
      </div>

      {/* ==========================================
          CARD LIST — normal document flow, no pin,
          no cropped viewport, no reserved gap
      ========================================== */}
      <div
        className="
          mx-auto w-full max-w-4xl
          px-5 pb-16
          sm:px-8
          lg:px-10
        "
      >
        <div className="flex flex-col gap-6">
          {REASONS.map((reason, index) => (
            <div
              key={reason.number}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={`
                shrink-0
                ${reason.align === "left" ? "mr-6 sm:mr-16 lg:mr-24" : "ml-6 sm:ml-16 lg:ml-24"}
              `}
            >
              {reason.align === "left" ? (
                <div className="flex h-full w-full overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
                  <div className="flex w-20 shrink-0 items-center justify-center bg-indigo-50 sm:w-28">
                    <span
                      className="text-3xl font-black text-neutral-900 sm:text-4xl lg:text-5xl"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {reason.number}
                    </span>
                  </div>
                  <div className="flex-1 p-4 sm:p-5">
                    <h3 className="mb-1.5 text-base font-bold text-neutral-900 sm:text-lg">
                      {reason.title}
                    </h3>
                    <p className="text-sm leading-5 text-neutral-500 sm:leading-6">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="ml-auto flex h-full w-full overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
                  <div className="flex-1 p-4 sm:p-5">
                    <h3 className="mb-1.5 text-base font-bold text-neutral-900 sm:text-lg">
                      {reason.title}
                    </h3>
                    <p className="text-sm leading-5 text-neutral-500 sm:leading-6">
                      {reason.description}
                    </p>
                  </div>
                  <div className="flex w-20 shrink-0 items-center justify-center bg-indigo-50 sm:w-28">
                    <span
                      className="text-3xl font-black text-neutral-900 sm:text-4xl lg:text-5xl"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {reason.number}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}