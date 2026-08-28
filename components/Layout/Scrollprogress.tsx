"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";

/**
 * Fixed top-of-viewport progress bar that fills left-to-right as the visitor
 * scrolls the whole page. Drop this once near the root of your layout
 * (e.g. in app/layout.tsx, right after <body>), not inside individual
 * sections — it tracks document scroll, not any one section.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(barRef.current, { scaleX: self.progress });
      },
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 300);

    return () => {
      trigger.kill();
      window.removeEventListener("load", refresh);
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-transparent">
      <div
        ref={barRef}
        className="h-full w-full origin-left"
        style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})`, transform: "scaleX(0)" }}
      />
    </div>
  );
}