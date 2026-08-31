"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/dist/client/link";

gsap.registerPlugin(ScrollTrigger);

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

const FONT_MONO =
  "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";

export default function ContactHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Directional animation helper
      const directional = (el: Element | null, dy = 20) => {
        if (!el) return;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 78%",
          end: "bottom 15%",

          onEnter: () =>
            gsap.fromTo(
              el,
              {
                y: dy,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power3.out",
              },
            ),

          onEnterBack: () =>
            gsap.fromTo(
              el,
              {
                y: -dy,
                opacity: 0,
              },
              {
                y: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power3.out",
              },
            ),
        });
      };

      // Apply directional animations
      directional(eyebrowRef.current, 15);
      directional(headingRef.current, 25);
      directional(descriptionRef.current, 20);

      // Floating icons animation
      gsap.to(".contact-icon", {
        y: -8,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 0.4,
          from: "random",
        },
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
      className="relative min-h-80 overflow-hidden bg-cover bg-center bg-no-repeat py-20 sm:min-h-80 sm:py-24 lg:min-h-115.5 lg:py-32 bg-[url('/contact-us/contact-us-hero-M.webp')] lg:bg-[url('/contact-us/contact-us-hero-D.webp')]"
      style={{
        backgroundAttachment: "scroll",
        fontFamily: FONT_BODY,
      }}
    >
      {/* Blackish overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(3, 37, 65, 0.72) 0%, rgba(8, 47, 73, 0.58) 45%, rgba(0, 119, 182, 0.45) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-10 sm:px-6 lg:pb-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
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

            <span className="text-white">Contact-us</span>
          </div>

          {/* Main Heading */}
          <h1
            ref={headingRef}
            className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-6xl"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            We&apos;re just a message away
          </h1>

          {/* Description */}
          <p
            ref={descriptionRef}
            className="mx-auto mt-4 max-w-2xl text-md leading-8 text-cyan-100/85 lg:text-xl"
          >
            Any questions? Our team is ready to assist you with admissions,
            programs and more.
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
    </section>
  );
}
