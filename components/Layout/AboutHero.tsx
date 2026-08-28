"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const INK = "#14141C";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

const FONT_MONO =
  "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";

const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

export const AboutHero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const floatingBadgeRef = useRef<HTMLDivElement>(null);
  const badgeNumberRef = useRef<HTMLDivElement>(null);

  const meshBlobRefs = useRef<Array<HTMLDivElement | null>>([]);
  const shapeRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const animateIn = (
        target: Element | null,
        from: gsap.TweenVars,
        to: gsap.TweenVars,
        delay = 0,
      ) => {
        if (!target) return;

        gsap.fromTo(target, from, {
          ...to,
          delay,
          duration: 0.8,
          ease: "power3.out",
        });
      };

      const triggerAnimations = () => {
        animateIn(
          contentRef.current,
          {
            opacity: 0,
            y: 35,
            scale: 0.98,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
          },
          0.1,
        );

        animateIn(
          headingRef.current,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
          },
          0.2,
        );

        animateIn(
          breadcrumbRef.current,
          {
            opacity: 0,
            y: 12,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
          },
          0.35,
        );

        if (floatingBadgeRef.current) {
          gsap.fromTo(
            floatingBadgeRef.current,
            {
              opacity: 0,
              x: 25,
              y: 15,
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.7,
              delay: 0.45,
              ease: "back.out(1.5)",
            },
          );
        }
      };

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top 90%",
        end: "bottom 10%",
        once: false,
        onEnter: triggerAnimations,
        onEnterBack: triggerAnimations,
      });

      /* ============================================================
         CONTINUOUS / LOOPING ANIMATIONS
         These run forever (repeat: -1) independent of scroll state,
         so the hero stays gently "alive" rather than going static
         once the entrance animation finishes.
      ============================================================ */

      // Floating badge — gentle up/down bob, forever
      if (floatingBadgeRef.current) {
        gsap.to(floatingBadgeRef.current, {
          y: -8,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Badge number circle — soft pulse, forever
      if (badgeNumberRef.current) {
        gsap.to(badgeNumberRef.current, {
          scale: 1.08,
          boxShadow: `0 0 0 8px ${ACCENT}00`,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Heading — very subtle continuous float, forever
      if (headingRef.current) {
        gsap.to(headingRef.current, {
          y: -4,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1, // let the entrance settle first
        });
      }

      // Breadcrumb pill — slow opacity breathing, forever
      if (breadcrumbRef.current) {
        gsap.to(breadcrumbRef.current, {
          opacity: 0.85,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1,
        });
      }

      /* ================= BACKGROUND BLOBS ================= */
      // Position drift (forever) + independent opacity pulse (forever)
      meshBlobRefs.current.forEach((blob, index) => {
        if (!blob) return;

        gsap.to(blob, {
          x: index % 2 === 0 ? 22 : -22,
          y: index % 2 === 0 ? -18 : 20,
          scale: 1.08,
          duration: 6 + index * 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(blob, {
          opacity: index % 2 === 0 ? 0.22 : 0.16,
          duration: 3.5 + index,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      /* ================= FLOATING SHAPES ================= */
      // Continuous rotation + continuous bob — both already infinite
      shapeRefs.current.forEach((shape, index) => {
        if (!shape) return;

        gsap.to(shape, {
          rotate: index % 2 === 0 ? 360 : -360,
          duration: 20 + index * 4,
          repeat: -1,
          ease: "none",
        });

        gsap.to(shape, {
          y: -8,
          duration: 3 + index * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      const refresh = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener("load", refresh);

      const timeout = setTimeout(refresh, 300);

      return () => {
        window.removeEventListener("load", refresh);
        clearTimeout(timeout);
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{
        fontFamily: FONT_BODY,
        color: INK,
      }}
    >
      {/* ================= BACKGROUND ================= */}

      <div className="absolute inset-0">
        {/* Desktop */}
        <Image
          src="/about-us/hero/about-us-hero-D.webp"
          alt="Salesforce training and team learning"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="
          hidden
          scale-100
          object-cover
          object-center
          brightness-95
          contrast-105
          md:block
          "
        />

        {/* Mobile */}
        <Image
          src="/about-us/hero/about-us-hero-M.webp"
          alt="Salesforce training and team learning"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="
          block
          scale-[1.06]
          object-cover
          object-center
          brightness-95
          contrast-105
          md:hidden
         "
        />

        {/* Dark Overlay */}

        <div className="absolute inset-0 bg-[#0f1226]/30" />

        {/* Gradient Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#1c1a38]/65
            via-[#1c1a38]/45
            to-[#2c2d5a]/25
          "
        />
      </div>

      {/* ================= DECORATIVE ELEMENTS ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Left Glow */}

        <div
          className="
            absolute
            -left-28
            top-5
            h-64
            w-64
            sm:h-80
            sm:w-80
            lg:-left-20
            lg:top-10
            lg:h-96
            lg:w-96
          "
        >
          <div
            ref={(el) => {
              meshBlobRefs.current[0] = el;
            }}
            className="
              h-full
              w-full
              rounded-full
              opacity-15
              blur-[70px]
              lg:blur-[100px]
            "
            style={{
              background: `radial-gradient(circle, ${ACCENT}, transparent 70%)`,
            }}
          />
        </div>

        {/* Right Glow */}

        <div
          className="
            absolute
            -right-28
            top-1/3
            h-64
            w-64
            sm:h-80
            sm:w-80
            lg:-right-20
            lg:h-96
            lg:w-96
          "
        >
          <div
            ref={(el) => {
              meshBlobRefs.current[1] = el;
            }}
            className="
              h-full
              w-full
              rounded-full
              opacity-10
              blur-[65px]
              lg:blur-[90px]
            "
            style={{
              background: `radial-gradient(circle, ${ACCENT_SOFT}, transparent 70%)`,
            }}
          />
        </div>

        {/* Floating Square */}

        <div
          ref={(el) => {
            shapeRefs.current[0] = el;
          }}
          className="
            absolute
            left-[7%]
            top-[25%]
            h-5
            w-5
            rounded-md
            border
            sm:h-7
            sm:w-7
            sm:rounded-lg
            lg:h-8
            lg:w-8
            lg:rounded-xl
          "
          style={{
            borderColor: `${ACCENT}45`,
          }}
        />

        {/* Floating Circle */}

        <div
          ref={(el) => {
            shapeRefs.current[1] = el;
          }}
          className="
            absolute
            right-[7%]
            top-[20%]
            h-4
            w-4
            rounded-full
            border
            sm:h-5
            sm:w-5
          "
          style={{
            borderColor: `${ACCENT_SOFT}50`,
          }}
        />
      </div>

      {/* ================= HERO CONTENT ================= */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-80
          max-w-6xl
          items-center
          justify-center
          px-4
          py-14
          sm:min-h-88
          sm:px-6
          sm:py-16
          lg:min-h-105
          lg:px-8
          lg:py-20
        "
      >
        <div
          ref={contentRef}
          className="
            mx-auto
            w-full
            max-w-2xl
            text-center
          "
        >
          {/* ================= BREADCRUMB ================= */}

          <div
            ref={breadcrumbRef}
            className="
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

            <span className="text-white">About Us</span>
          </div>

          {/* ================= HEADING ================= */}

          <h1
            ref={headingRef}
            className="
              mx-auto
              mt-4
              max-w-xl
              px-2
              text-2xl
              font-medium
              leading-[1.15]
              tracking-tight
              text-white
              sm:mt-5
              sm:text-3xl
              md:text-4xl
              lg:text-5xl
            "
            style={{
              fontFamily: FONT_DISPLAY,
            }}
          >
            Pioneering Salesforce Excellence in Central India
          </h1>
        </div>
      </div>

      {/* ================= FLOATING BADGE ================= */}

      <div
        ref={floatingBadgeRef}
        className="
          absolute
          bottom-4
          right-3
          z-10
          rounded-xl
          border
          border-white/20
          bg-white/10
          px-3
          py-2
          shadow-[0_15px_40px_rgba(20,20,28,0.25)]
          backdrop-blur-md
          sm:bottom-5
          sm:right-5
          sm:rounded-2xl
          sm:px-4
          sm:py-3
          lg:bottom-6
          lg:right-8
        "
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Number */}

          <div
            ref={badgeNumberRef}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-violet-500
              text-xs
              font-bold
              text-white
              shadow-lg
              shadow-violet-500/30
              sm:h-10
              sm:w-10
              sm:text-sm
            "
          >
            5+
          </div>

          {/* Text */}

          <div>
            <p
              className="
                text-[8px]
                uppercase
                tracking-[0.14em]
                text-violet-100
                sm:text-[10px]
                sm:tracking-[0.18em]
              "
            >
              Industry
            </p>

            <p className="text-[11px] font-semibold text-white sm:text-sm">
              Salesforce Skills
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;