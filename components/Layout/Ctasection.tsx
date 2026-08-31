"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Font note: authored around Space Grotesk (display) + JetBrains Mono
 * (ticket labels / meta) + Inter (body copy) — matching every other
 * section on the site. Load via `next/font/google` in your root layout
 * for production; system fallbacks are included so it renders correctly
 * as-is.
 *
 * Design concept: the boarding-pass idea from the original CTA is pushed
 * further into something a printed ticket would actually do —
 * 1. the pass prints out of a slot at the top of the card on scroll-in
 * 2. the stub's Batch / Seat / Mode / Cost fields resolve like an
 *    airport split-flap display, character by character
 * 3. the barcode gets scanned by a light sweep, then a "CONFIRMED"
 *    stamp lands off-axis like a real ticket agent's stamp
 * 4. the whole card tilts gently toward the cursor, like picking it up
 * Reduced-motion users get the same layout with the scramble/tilt/scan
 * flourishes swapped for instant, static states.
 */

const PAPER = "#FAFAF8";
const INK = "#14141C";
const INK_SOFT = "#5B5B68";
const LINE = "rgba(20,20,28,0.12)";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

const STUB_FIELDS = [
  { label: "Batch", value: "2026" },
  { label: "Seat", value: "Open" },
  { label: "Mode", value: "Live" },
  { label: "Cost", value: "Free" },
];

type FeatureIcon = "live" | "project" | "certificate";

const FEATURES: { icon: FeatureIcon; label: string }[] = [
  { icon: "live", label: "Live mentor sessions" },
  { icon: "project", label: "Hands-on projects" },
  { icon: "certificate", label: "Certificate on completion" },
];

function FeatureGlyph({ icon, color }: { icon: FeatureIcon; color: string }) {
  const common = { stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  switch (icon) {
    case "live":
      // A play-monitor: live, screen-based class
      return (
        <svg viewBox="0 0 20 20" className="h-4 w-4">
          <rect x="2.5" y="3.5" width="15" height="10.5" rx="1.8" {...common} />
          <path d="M8.3 6.8l4 2.7-4 2.7V6.8z" fill={color} stroke="none" />
          <path d="M7 17h6" {...common} />
        </svg>
      );
    case "project":
      // A checked task / hands-on build
      return (
        <svg viewBox="0 0 20 20" className="h-4 w-4">
          <rect x="3" y="2.5" width="14" height="15" rx="1.8" {...common} />
          <path d="M6.3 7.2h7.4M6.3 10.2h7.4M6.3 13.2h4.6" {...common} />
        </svg>
      );
    case "certificate":
      // A graduation cap: course completion
      return (
        <svg viewBox="0 0 20 20" className="h-4 w-4">
          <path d="M2 8.2L10 4l8 4.2-8 4.2-8-4.2z" {...common} />
          <path d="M5.4 10v3.4c0 1.2 2.1 2.2 4.6 2.2s4.6-1 4.6-2.2V10" {...common} />
          <path d="M17 8.6v4.4" {...common} />
        </svg>
      );
  }
}

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Scrambles an element's text through random characters before settling
 *  on the final value, like an airport split-flap board resolving. */
function flapResolve(el: HTMLElement | null, finalValue: string, delay: number) {
  if (!el) return;
  const proxy = { step: 0 };
  const steps = 9;
  gsap.to(proxy, {
    step: steps,
    duration: 0.62,
    delay,
    ease: `steps(${steps})`,
    onUpdate: () => {
      if (proxy.step >= steps) {
        el.textContent = finalValue;
        return;
      }
      el.textContent = finalValue
        .split("")
        .map((ch) => (ch === " " ? " " : FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)]))
        .join("");
    },
  });
}

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const blobOuterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const blobInnerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardWrapRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const stubRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const barcodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scanRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const flapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const primaryBtnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        // Static, fully-resolved state — no scramble, tilt, or looping scan.
        STUB_FIELDS.forEach((f, i) => {
          if (flapRefs.current[i]) flapRefs.current[i]!.textContent = f.value;
        });
        gsap.set(barcodeRefs.current, { scaleY: 1 });
        gsap.set(stampRef.current, { opacity: 1, scale: 1, rotate: -8 });
        return;
      }

      // Ambient background: slow blob drift + independent scroll parallax,
      // and a dot grid that gently pans — fills the full-height section
      // with quiet motion around the card, echoing the footer treatment.
      blobInnerRefs.current.forEach((blob, i) => {
        if (!blob) return;
        gsap.to(blob, {
          x: i % 2 === 0 ? 36 : -30,
          y: i % 2 === 0 ? -26 : 28,
          scale: 1.1,
          duration: 8 + i * 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      blobOuterRefs.current.forEach((wrapper, i) => {
        if (!wrapper) return;
        gsap.to(wrapper, {
          yPercent: i % 2 === 0 ? 14 : -12,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1 + i * 0.3 },
        });
      });
      if (gridRef.current) {
        gsap.to(gridRef.current, {
          backgroundPosition: "32px 32px",
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      }

      // Card starts clipped up into the printer slot and slightly raised.
      gsap.set(ticketRef.current, { clipPath: "inset(0% 0% 100% 0%)", y: -14 });
      gsap.set(stampRef.current, { opacity: 0, scale: 0.4, rotate: -30 });
      gsap.set(scanRef.current, { opacity: 0, x: 0 });

      const directional = (el: Element | null, dy = 20, delay = 0) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 78%",
          end: "bottom 15%",
          onEnter: () => gsap.fromTo(el, { y: dy }, { y: 0, duration: 0.55, delay, ease: "power3.out" }),
          onEnterBack: () => gsap.fromTo(el, { y: -dy }, { y: 0, duration: 0.55, delay, ease: "power3.out" }),
        });
      };
      directional(badgeRef.current, 16);
      directional(headingRef.current, 22, 0.05);
      directional(paraRef.current, 16, 0.1);
      directional(featuresRef.current, 14, 0.15);
      directional(ctaRef.current, 16, 0.2);

      // Main sequence: card prints out of the slot, stub flaps resolve,
      // barcode gets scanned, stamp lands. Runs once on first entry.
      ScrollTrigger.create({
        trigger: cardWrapRef.current,
        start: "top 80%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          tl.to(ticketRef.current, {
            clipPath: "inset(0% 0% 0% 0%)",
            y: 0,
            duration: 0.85,
            ease: "power4.out",
          });

          STUB_FIELDS.forEach((f, i) => {
            tl.add(() => flapResolve(flapRefs.current[i], f.value, 0), 0.35 + i * 0.1);
          });

          tl.fromTo(
            barcodeRefs.current,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.35, stagger: 0.018, ease: "power2.out" },
            0.75
          );

          tl.set(scanRef.current, { opacity: 1, x: -4 }, 1.05);
          tl.to(scanRef.current, { x: 200, duration: 0.55, ease: "power1.inOut" }, 1.05);
          tl.to(scanRef.current, { opacity: 0, duration: 0.15 }, 1.55);

          tl.to(
            stampRef.current,
            { opacity: 1, scale: 1, rotate: -8, duration: 0.7, ease: "elastic.out(1, 0.55)" },
            1.15
          );
        },
      });

      // Ambient loop: a faint sweep re-crosses the barcode every few
      // seconds, like a reader idling — subtle, not the main event.
      gsap.to(scanRef.current, {
        keyframes: [
          { opacity: 0, x: -4, duration: 0 },
          { opacity: 0.7, duration: 0.3 },
          { x: 200, duration: 0.5, ease: "power1.inOut" },
          { opacity: 0, duration: 0.2 },
        ],
        repeat: -1,
        repeatDelay: 3.2,
        delay: 3,
      });

      // Magnetic primary button
      const btn = primaryBtnRef.current;
      if (btn) {
        const moveX = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
        const moveY = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
        const handleMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          moveX((e.clientX - rect.left - rect.width / 2) * 0.3);
          moveY((e.clientY - rect.top - rect.height / 2) * 0.4);
        };
        const handleLeave = () => {
          moveX(0);
          moveY(0);
        };
        btn.addEventListener("mousemove", handleMove);
        btn.addEventListener("mouseleave", handleLeave);
      }

      // Ticket lifts and tilts toward the cursor, like picking it up off a desk.
      const ticket = ticketRef.current;
      if (ticket) {
        gsap.set(ticket, { transformPerspective: 900, transformOrigin: "center" });
        const liftY = gsap.quickTo(ticket, "y", { duration: 0.4, ease: "power3.out" });
        const rotX = gsap.quickTo(ticket, "rotationX", { duration: 0.5, ease: "power3.out" });
        const rotY = gsap.quickTo(ticket, "rotationY", { duration: 0.5, ease: "power3.out" });

        const handleTilt = (e: MouseEvent) => {
          const rect = ticket.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          rotY(px * 5);
          rotX(-py * 5);
        };
        const enter = () => {
          liftY(-5);
          gsap.to(ticket, { boxShadow: "0 40px 80px -20px rgba(20,20,40,0.28)", duration: 0.3, ease: "power2.out" });
          ticket.addEventListener("mousemove", handleTilt);
        };
        const leave = () => {
          liftY(0);
          rotX(0);
          rotY(0);
          gsap.to(ticket, { boxShadow: "0 24px 60px -20px rgba(20,20,40,0.18)", duration: 0.3, ease: "power2.out" });
          ticket.removeEventListener("mousemove", handleTilt);
        };
        ticket.addEventListener("mouseenter", enter);
        ticket.addEventListener("mouseleave", leave);
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
      className="relative flex w-full items-center justify-center overflow-hidden px-6 py-12 lg:py-20"
      style={{ background: PAPER, fontFamily: FONT_BODY }}
    >
      {/* Full-bleed ambient background so the section reads as a real
          destination, not a card floating in empty space */}
      <div className="pointer-events-none absolute inset-0">
        <div
          ref={gridRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${INK}1f 1.3px, transparent 1.3px)`,
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 65% 70% at 50% 50%, black 25%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 65% 70% at 50% 50%, black 25%, transparent 100%)",
          }}
        />
        <div ref={(el) => { blobOuterRefs.current[0] = el; }} className="absolute -left-24 -top-24 max-h-[400px] w-[460px]">
          <div
            ref={(el) => { blobInnerRefs.current[0] = el; }}
            className="h-full w-full rounded-full opacity-[0.20] blur-[100px]"
            style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 70%)` }}
          />
        </div>
        <div ref={(el) => { blobOuterRefs.current[1] = el; }} className="absolute -right-28 bottom-[-90px] max-h-[360px] w-[400px]">
          <div
            ref={(el) => { blobInnerRefs.current[1] = el; }}
            className="h-full w-full rounded-full opacity-[0.16] blur-[90px]"
            style={{ background: `radial-gradient(circle, ${ACCENT_SOFT}, transparent 70%)` }}
          />
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Printer slot the ticket emerges from */}
        <div ref={cardWrapRef} className="relative">
          {/* <div
            className="relative z-0 mx-auto h-5 w-[94%] rounded-b-[10px]"
            style={{ background: `linear-gradient(180deg, ${INK}, #26263a)` }}
          >
            <div className="absolute inset-x-10 top-[7px] h-[3px] rounded-full bg-black/40" />
          </div> */}

          <div
            ref={ticketRef}
            className="relative z-10 -mt-1 flex flex-col overflow-visible rounded-[32px] bg-white shadow-[0_32px_80px_-24px_rgba(20,20,40,0.20)] sm:flex-row"
          >
            {/* Main offer side */}
            <div className="relative flex-1 px-9 py-12 sm:px-14 sm:py-16">
              {/* Confirmation stamp, landing on the white panel once the ticket prints */}
              <div
                ref={stampRef}
                className="pointer-events-none absolute right-8 top-8 z-20 sm:right-11 sm:top-11"
                aria-hidden="true"
              >
                <div
                  className="flex h-[58px] w-[58px] rotate-[-8deg] items-center justify-center rounded-full border-2"
                  style={{ borderColor: ACCENT_DEEP, color: ACCENT_DEEP, background: "rgba(91,79,224,0.05)" }}
                >
                  <span
                    className="text-center text-[8.5px] font-bold uppercase leading-[1.15] tracking-wide"
                    style={{ fontFamily: FONT_MONO }}
                  >
                    Seat
                    <br />
                    Confirmed
                  </span>
                </div>
              </div>

              <div
                ref={badgeRef}
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11.5px] font-semibold uppercase tracking-wide"
                style={{ fontFamily: FONT_MONO, borderColor: LINE, color: ACCENT_DEEP }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                Limited Seats
              </div>

              <h2
                ref={headingRef}
                className="mt-5 max-w-lg text-[34px] font-medium leading-[1.15] tracking-tight sm:text-[44px]"
                style={{ fontFamily: FONT_DISPLAY, color: INK }}
              >
                Your seat in the next batch is waiting.
              </h2>

              <p ref={paraRef} className="mt-4 max-w-md text-[15.5px] leading-7 sm:text-[16.5px]" style={{ color: INK_SOFT }}>
                Sit in on a free live class, meet your mentor, and reserve your
                spot before the batch fills — no cost, no commitment.
              </p>

              <div ref={featuresRef} className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                {FEATURES.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-[13.5px]" style={{ color: INK_SOFT }}>
                    <FeatureGlyph icon={f.icon} color={ACCENT} />
                    {f.label}
                  </div>
                ))}
              </div>

              <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  ref={primaryBtnRef}
                  href="/contact-us/"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white shadow-[0_14px_28px_-10px_rgba(91,79,224,0.55)] transition-transform duration-200"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
                >
                  Reserve My Seat
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex h-14 items-center justify-center rounded-full border px-7 text-[15px] font-semibold transition-colors duration-200 hover:bg-black/[.03]"
                  style={{ borderColor: LINE, color: INK }}
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            {/* Perforated tear line with punch-hole notches */}
            <div className="relative hidden w-0 sm:block">
              <div className="absolute inset-y-6 left-0 border-l-2 border-dashed" style={{ borderColor: LINE }} />
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full" style={{ background: PAPER }} />
              <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full" style={{ background: PAPER }} />
            </div>
            <div className="relative block h-0 sm:hidden">
              <div className="absolute inset-x-6 top-0 border-t-2 border-dashed" style={{ borderColor: LINE }} />
              <span className="absolute -top-3 -left-3 h-6 w-6 rounded-full" style={{ background: PAPER }} />
              <span className="absolute -top-3 -right-3 h-6 w-6 rounded-full" style={{ background: PAPER }} />
            </div>

            {/* Ticket stub */}
            <div
              ref={stubRef}
              className="flex w-full flex-col justify-between overflow-hidden rounded-b-[32px] px-8 py-10 text-white sm:w-[280px] sm:rounded-l-none sm:rounded-r-[32px] sm:px-8"
              style={{ background: `linear-gradient(160deg, ${ACCENT_DEEP}, ${ACCENT} 60%, ${ACCENT_SOFT})` }}
            >
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65" style={{ fontFamily: FONT_MONO }}>
                  Boarding
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[22px] font-medium" style={{ fontFamily: FONT_DISPLAY }}>
                  <FeatureGlyph icon="certificate" color="white" />
                  Career Track
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6">
                {STUB_FIELDS.map((f, i) => (
                  <div key={f.label}>
                    <div className="text-[10px] uppercase tracking-wide text-white/55" style={{ fontFamily: FONT_MONO }}>
                      {f.label}
                    </div>
                    <div
                      ref={(el) => {
                        flapRefs.current[i] = el;
                      }}
                      className="mt-1 text-[15px] font-semibold tabular-nums"
                      style={{ fontFamily: FONT_MONO }}
                    >
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Barcode with a scanning sweep */}
              <div className="relative mt-9 h-9 overflow-hidden">
                <div className="flex h-9 items-end gap-[3.5px]">
                  {Array.from({ length: 27 }).map((_, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        barcodeRefs.current[i] = el;
                      }}
                      className="origin-bottom bg-white/70"
                      style={{ width: 2.5, height: i % 3 === 0 ? "100%" : i % 2 === 0 ? "65%" : "40%" }}
                    />
                  ))}
                </div>
                <div
                  ref={scanRef}
                  className="pointer-events-none absolute inset-y-0 left-0 w-5"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)" }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}