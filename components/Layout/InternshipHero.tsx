"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

const FONT_MONO =
  "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";

export default function InternshipHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      // Background image initial state
      gsap.set(backgroundRef.current, {
        scale: 1.08,
      });

      // Hero entrance animation
      tl.fromTo(
        sectionRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.8,
        },
      )

        // Dark overlay
        .fromTo(
          overlayRef.current,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 1,
          },
          "-=0.5",
        )

        // Eyebrow
        .from(
          eyebrowRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4",
        )

        // Heading
        .from(
          headingRef.current,
          {
            y: 50,
            opacity: 0,
            scale: 0.96,
            duration: 0.9,
            ease: "power4.out",
          },
          "-=0.3",
        )

        // Description
        .from(
          descriptionRef.current,
          {
            y: 25,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.5",
        )

        // Button
        .from(
          buttonRef.current,
          {
            y: 20,
            opacity: 0,
            scale: 0.9,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          "-=0.3",
        );

      // Background image zoom
      gsap.to(backgroundRef.current, {
        scale: 1.18,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Button floating animation
      gsap.to(buttonRef.current, {
        y: -5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[320px] w-full overflow-hidden sm:min-h-[400px] lg:min-h-[450px]"
    >
      {/* ==========================================
          BACKGROUND IMAGE
      ========================================== */}

      <div
        ref={backgroundRef}
        className="
    absolute
    inset-0
    scale-[1.08]
    bg-cover
    bg-center
    bg-no-repeat
    will-change-transform
  "
        style={{
          backgroundImage: "url('/internship/internship-hero-D.webp')",
        }}
      />

      {/* ==========================================
          DARK OVERLAY
      ========================================== */}

      <div ref={overlayRef} className="absolute inset-0 bg-black/45" />

      {/* ==========================================
          COLOR OVERLAY
      ========================================== */}

      <div className="absolute inset-0 bg-[#7d6818]/20 mix-blend-multiply" />

      {/* ==========================================
          HERO CONTENT - BOTTOM ALIGNED
      ========================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[500px]
          w-full
          max-w-7xl
          items-end
          justify-center
          px-5
          pb-16
          pt-20
          text-center
          sm:min-h-[540px]
          sm:px-8
          sm:pb-20
          lg:min-h-[580px]
          lg:px-10
          lg:pb-14
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-5xl
            flex-col
            items-center
          "
        >
          <div
            ref={eyebrowRef}
            className="
    mb-4
    inline-flex
    items-center
    justify-center
    gap-2
    rounded-full
    border
    border-white/20
    bg-white/10
    px-3
    py-1.5
    text-[9px]
    font-medium
    uppercase
    tracking-[0.16em]
    text-violet-100
    backdrop-blur-sm
    sm:mb-5
    sm:px-4
    sm:py-2
    sm:text-[10px]
    sm:tracking-[0.18em]
  "
            style={{
              fontFamily: FONT_MONO,
            }}
          >
            <Link
              href="/"
              className="transition-colors duration-200 hover:text-white"
            >
              Home
            </Link>

            <span className="opacity-50">/</span>

            <span className="text-white">Internship</span>
          </div>

          {/* Heading */}

          <h1
            ref={headingRef}
            className="
              w-full
              max-w-5xl
              text-2xl
              font-extrabold
              leading-[1.08]
              tracking-tight
              text-white
              sm:text-3xl
              md:text-4xl
              lg:text-5xl
          "
            style={{
              fontFamily: FONT_DISPLAY,
            }}
          >
            Welcome to E Learning IT Internship Program!
          </h1>

          {/* Description */}

          <p
            ref={descriptionRef}
            className="
              mt-5
              w-full
              max-w-4xl
              text-sm
              font-medium
              leading-6
              text-white/90
              sm:mt-6
              sm:text-base
              sm:leading-7
            "
          >
            Turn your passion for technology into a rewarding career with our E
            Learning IT Internship Program.
          </p>

          {/* CTA */}

          <div ref={buttonRef} className="mt-7 sm:mt-9">
            <Link
              href="/contact-us"
              className="
                inline-flex
                rounded-full
                bg-gradient-to-r
                from-[#5B4FE0]
                to-[#8A7DFF]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-[0_15px_40px_rgba(91,79,224,0.4)]
                sm:px-7
                sm:py-3.5
              "
            >
              Book Free Demo with Career Counsellor
            </Link>
          </div>
        </div>
      </div>

      {/* ==========================================
          BOTTOM GRADIENT
      ========================================== */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          right-0
          h-32
          bg-gradient-to-t
          from-black/50
          to-transparent
        "
      />
    </section>
  );
}
