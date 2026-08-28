"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Font note: authored around Space Grotesk (display) + Inter (loading
 * copy) + JetBrains Mono (progress %) — matching the rest of the site.
 * Load via `next/font/google` in your root layout for production; system
 * fallbacks are included so it renders correctly as-is.
 *
 * Usage: mount once near the top of your root layout, as a sibling to
 * your page content — e.g. right after <body>, before <ScrollProgress />
 * / <Navbar />. It removes itself from the DOM once the exit finishes.
 */

const PAPER = "#FAFAF8";
const INK = "#14141C";
const INK_SOFT = "#5B5B68";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

const MIN_DURATION_MS = 1600;
const MAX_WAIT_MS = 4800;

const LOADING_LINES = ["Preparing your classroom", "Loading course library", "Almost ready"];

export default function Preloader() {
  const [done, setDone] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const bookPathRef = useRef<SVGPathElement>(null);
  const capPathRef = useRef<SVGPathElement>(null);
  const tasselRef = useRef<SVGGElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const perspectiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const start = Date.now();
    const counter = { val: 0 };

    // Draw-on: the book + cap outline sketch themselves in, tied to progress
    const bookLen = bookPathRef.current?.getTotalLength() ?? 0;
    const capLen = capPathRef.current?.getTotalLength() ?? 0;
    if (bookPathRef.current) gsap.set(bookPathRef.current, { strokeDasharray: bookLen, strokeDashoffset: bookLen });
    if (capPathRef.current) gsap.set(capPathRef.current, { strokeDasharray: capLen, strokeDashoffset: capLen });

    // Tassel sways gently, forever, while we wait
    gsap.to(tasselRef.current, {
      rotate: 8,
      transformOrigin: "top center",
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Loading copy cycles through
    const msgTl = gsap.timeline({ repeat: -1 });
    LOADING_LINES.forEach((text) => {
      msgTl
        .call(() => {
          if (messageRef.current) messageRef.current.textContent = text;
        })
        .fromTo(messageRef.current, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.3 })
        .to(messageRef.current, { autoAlpha: 0, y: -4, duration: 0.3 }, "+=0.9");
    });

    const progressTween = gsap.to(counter, {
      val: 88,
      duration: 2.6,
      ease: "power1.out",
      onUpdate: () => {
        const v = counter.val;
        if (bookPathRef.current) bookPathRef.current.style.strokeDashoffset = String(bookLen * (1 - Math.min(v / 70, 1)));
        if (capPathRef.current) capPathRef.current.style.strokeDashoffset = String(capLen * (1 - Math.max(0, Math.min((v - 25) / 55, 1))));
        if (percentRef.current) percentRef.current.textContent = Math.round(v) + "%";
        if (barFillRef.current) barFillRef.current.style.width = v + "%";
      },
    });

    let cancelled = false;
    let hasFinished = false;
    let innerTimeout: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (cancelled || hasFinished) return;
      hasFinished = true;
      const elapsed = Date.now() - start;
      const wait = Math.max(0, MIN_DURATION_MS - elapsed);
      innerTimeout = setTimeout(() => {
        if (cancelled) return;
        progressTween.kill();
        msgTl.kill();

        const tl = gsap.timeline({
          onComplete: () => {
            document.body.style.overflow = "";
            setDone(true);
          },
        });

        tl.to(counter, {
          val: 100,
          duration: 0.3,
          ease: "power2.out",
          onUpdate: () => {
            if (bookPathRef.current) bookPathRef.current.style.strokeDashoffset = "0";
            if (capPathRef.current) capPathRef.current.style.strokeDashoffset = "0";
            if (percentRef.current) percentRef.current.textContent = Math.round(counter.val) + "%";
            if (barFillRef.current) barFillRef.current.style.width = counter.val + "%";
          },
        })
          // Cap toss — a small celebratory bounce once "loading" completes
          .to(tasselRef.current, { rotate: 0, duration: 0.15 })
          .to(stageRef.current, { y: -18, duration: 0.35, ease: "power2.out" })
          .to(stageRef.current, { y: 0, duration: 0.4, ease: "bounce.out" })
          .to(contentRef.current, { autoAlpha: 0, duration: 0.25 }, "-=0.1")
          // Literal page turn: the panel swings away like a book page,
          // hinged on its left edge, revealing the site underneath.
          .to(
            pageRef.current,
            {
              rotateY: -115,
              duration: 0.85,
              ease: "power3.inOut",
              transformOrigin: "left center",
            },
            "+=0.05"
          );
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }
    const hardStop = setTimeout(finish, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("load", finish);
      clearTimeout(hardStop);
      if (innerTimeout) clearTimeout(innerTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div ref={perspectiveRef} className="fixed inset-0 z-[200]" style={{ perspective: 1400 }} aria-hidden>
      <div
        ref={pageRef}
        className="relative h-full w-full"
        style={{ background: PAPER, transformStyle: "preserve-3d", boxShadow: "8px 0 40px -12px rgba(20,20,28,0.25)" }}
      >
        <div ref={contentRef} className="flex h-full w-full flex-col items-center justify-center px-6">
          <div ref={stageRef} className="flex flex-col items-center">
            {/* Cap + open book, line-art, draws itself in */}
            <svg viewBox="0 0 160 130" className="h-28 w-36 sm:h-32 sm:w-40">
              {/* Open book */}
              <path
                ref={bookPathRef}
                d="M80 60 C 62 46, 30 44, 12 52 L12 100 C 30 92, 62 94, 80 108 C 98 94, 130 92, 148 100 L148 52 C 130 44, 98 46, 80 60 Z M80 60 L80 108"
                fill="none"
                stroke={ACCENT}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Graduation cap, sitting above the book */}
              <path
                ref={capPathRef}
                d="M80 8 L142 34 L80 60 L18 34 Z M50 44 L50 66 C 50 74, 62 80, 80 80 C 98 80, 110 74, 110 66 L110 44"
                fill="none"
                stroke={ACCENT_DEEP}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Tassel */}
              <g ref={tasselRef}>
                <line x1="128" y1="30" x2="128" y2="52" stroke={ACCENT_SOFT} strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="128" cy="56" r="3.5" fill={ACCENT_SOFT} />
              </g>
            </svg>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-[19px] font-bold tracking-tight" style={{ fontFamily: FONT_DISPLAY, color: INK }}>
                Ceptra
              </span>
            </div>

            <div ref={messageRef} className="mt-3 h-5 text-[13px]" style={{ fontFamily: FONT_BODY, color: INK_SOFT }}>
              Preparing your classroom
            </div>

            <div className="mt-6 flex w-[180px] flex-col items-center gap-2">
              <div className="h-[3px] w-full overflow-hidden rounded-full" style={{ background: "rgba(20,20,28,0.10)" }}>
                <div
                  ref={barFillRef}
                  className="h-full rounded-full"
                  style={{ width: "0%", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})` }}
                />
              </div>
              <span className="text-[11px] tabular-nums" style={{ fontFamily: FONT_MONO, color: INK_SOFT }}>
                <span ref={percentRef}>0%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}