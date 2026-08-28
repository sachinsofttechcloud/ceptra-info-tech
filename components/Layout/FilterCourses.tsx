"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, PlayCircle, FileEdit, Video } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

interface FilterCard {
  label: string;
  href: string;
  icon: typeof PlayCircle;
  from: string;
  to: string;
}

const FILTER_CARDS: FilterCard[] = [
  {
    label: "Live Courses",
    href: "/courses?filter=live",
    icon: PlayCircle,
    from: "#E14D77",
    to: "#B62F52",
  },
  {
    label: "Interview Readiness",
    href: "/courses?filter=interview-readiness",
    icon: FileEdit,
    from: "#3E5FE0",
    to: "#28409E",
  },
  {
    label: "Recorded Courses",
    href: "/courses?filter=recorded",
    icon: Video,
    from: "#2BB37E",
    to: "#158A5D",
  },
];

function FilterCardItem({ card }: { card: FilterCard }) {
  const Icon = card.icon;
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const logCurrentFilter = () => {
    console.log(filter);
  };

  return (
    <Link
      href={card.href}
      className="filter-card group relative flex h-28 w-40 flex-col justify-between overflow-hidden rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1 sm:h-30 sm:w-50"
      style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})` }}
      onClick={logCurrentFilter}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* decorative icon badge */}
      <div className="pointer-events-none absolute -bottom-3 -right-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6 text-white/70" strokeWidth={1.75} />
      </div>

      <h3
        className="relative z-10 max-w-[60%] text-base font-bold leading-tight text-white sm:text-xl"
        style={{ fontFamily: FONT_DISPLAY }}
      >
        {card.label}
      </h3>

      <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-white transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export default function FilterCourses({ groupType = "" }: { groupType?: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  const searchParams = useSearchParams();

  const filter = searchParams.get("filter");
  const type = searchParams.get("type");

  const hidden = groupType || filter || type;


  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".fade-heading", sectionRef.current).forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".filter-card", sectionRef.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>{
      !hidden && <section ref={sectionRef} className="w-full bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="fade-heading mb-5 text-sm font-bold uppercase tracking-wide text-slate-800 sm:text-base">
            Filter courses
          </h2>

          <div className="flex flex-wrap gap-4">
            {FILTER_CARDS.map((card) => (
              <FilterCardItem key={card.label} card={card} />
            ))}
          </div>
        </div>
      </section>
    }

    </>
  );
}