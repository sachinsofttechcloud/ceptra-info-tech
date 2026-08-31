"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Font note: authored around Space Grotesk (display) + JetBrains Mono
 * (tags / meta) + Inter (body copy). For production, load these via
 * `next/font/google` in your root layout. System fallbacks are included so
 * the layout still renders correctly as-is.
 */

const PAPER = "#FAFAF8";
const INK = "#14141C";
const INK_SOFT = "#5B5B68";
const LINE = "rgba(20,20,28,0.09)";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO =
  "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

type Course = {
  category: string;
  title: string;
  description: string;
  duration: string;
  batchSize: string;
  seats: "Open" | "Filling Fast" | "Few Seats Left";
  icon:
    | "cloud"
    | "megaphone"
    | "bolt"
    | "component"
    | "briefcase"
    | "database"
    | "bot"
    | "code"
    | "target";
  href: string;
};

const COURSES: Course[] = [
  {
    category: "Marketing Cloud",
    title: "Marketing Cloud Engagement",
    description:
      "Journey Builder, Email Studio and automation studio hands on, with real campaign builds and audience segmentation.",
    duration: "3 Months",
    batchSize: "20 students",
    seats: "Filling Fast",
    icon: "megaphone",
    href: "/courses/marketing-cloud-engagement",
  },
  {
    category: "Marketing Cloud",
    title: "Marketing Cloud Next",
    description:
      "The next gen Marketing Cloud experience unified data model, AI assisted journeys and the latest platform tooling.",
    duration: "3 Months",
    batchSize: "18 students",
    seats: "Open",
    icon: "bolt",
    href: "/courses/data-cloud-agentforce-marketing-cloud-next",
  },
  {
    category: "Marketing Cloud",
    title: "Digital Marketing",
    description:
      "SEO, paid ads, social and analytics a practical, campaign-driven path to running marketing end to end.",
    duration: "3 Months",
    batchSize: "20 students",
    seats: "Open",
    icon: "target",
    href: "/digital-marketing/",
  },
  {
    category: "Data Cloud",
    title: "Data Cloud",
    description:
      "Unify customer data across sources and build the segments that power every downstream Salesforce workflow.",
    duration: "2 Months",
    batchSize: "18 students",
    seats: "Few Seats Left",
    icon: "database",
    href: "/courses/data-cloud-agentforce-marketing-cloud-next",
  },
  {
    category: "AgentForce",
    title: "AgentForce",
    description:
      "Design and deploy autonomous AI agents on the Salesforce platform, from prompt design to production rollout.",
    duration: "2 Months",
    batchSize: "15 students",
    seats: "Filling Fast",
    icon: "bot",
    href: "/courses/data-cloud-agentforce-marketing-cloud-next",
  },
  {
    category: "Development",
    title: "Salesforce + LWC",
    description:
      "Lightning Web Components from scratch component architecture, Apex integration and deployable custom UI.",
    duration: "4 Months",
    batchSize: "18 students",
    seats: "Open",
    icon: "component",
    href: "/courses/lwc",
  },
  {
    category: "Development",
    title: "Web Development",
    description:
      "Modern frontend and backend fundamentals HTML, CSS, JavaScript and framework driven project builds.",
    duration: "4 Months",
    batchSize: "20 students",
    seats: "Open",
    icon: "code",
    href: "/courses/web-developement/",
  },
  {
    category: "CRM Platform",
    title: "CRM Platform",
    description:
      "Admin, development and configuration fundamentals across the Salesforce ecosystem, built for real project work.",
    duration: "4 Months",
    batchSize: "20 students",
    seats: "Filling Fast",
    icon: "cloud",
    href: "/courses/salesforce-training/",
  },
  {
    category: "CRM Platform",
    title: "CRM Cloud",
    description:
      "Lead to opportunity workflows, forecasting and automation for sales teams running on Salesforce.",
    duration: "2 Months",
    batchSize: "20 students",
    seats: "Open",
    icon: "briefcase",
    href: "/courses/crm-cloud/",
  },
  {
    category: "Sales or Service Cloud",
    title: "Sales Cloud",
    description:
      "Lead to opportunity workflows, forecasting and automation for sales teams running on Salesforce.",
    duration: "2 Months",
    batchSize: "20 students",
    seats: "Open",
    icon: "briefcase",
    href: "/courses/sales-cloud/",
  },
];

const CATEGORIES = Array.from(new Set(COURSES.map((c) => c.category)));

const SEAT_STYLES: Record<Course["seats"], string> = {
  Open: "bg-emerald-50 text-emerald-600",
  "Filling Fast": "bg-amber-50 text-amber-600",
  "Few Seats Left": "bg-rose-50 text-rose-600",
};

function CourseIcon({ type }: { type: Course["icon"] }) {
  const common = {
    stroke: "white",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  switch (type) {
    case "cloud":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path
            d="M7 17h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7.1 10.1 3.5 3.5 0 0 0 7 17z"
            {...common}
          />
        </svg>
      );
    case "megaphone":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path d="M3 10v4h3l6 4V6L6 10H3z" {...common} />
          <path d="M15 9c1 .8 1 5.2 0 6M18 7c2 1.6 2 8.4 0 10" {...common} />
        </svg>
      );
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" {...common} />
        </svg>
      );
    case "component":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <rect x="3" y="3" width="7" height="7" rx="1.5" {...common} />
          <rect x="14" y="3" width="7" height="7" rx="1.5" {...common} />
          <rect x="3" y="14" width="7" height="7" rx="1.5" {...common} />
          <rect x="14" y="14" width="7" height="7" rx="1.5" {...common} />
        </svg>
      );
    case "briefcase":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <rect x="3" y="7.5" width="18" height="12" rx="2" {...common} />
          <path
            d="M8 7.5V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5v2M3 13h18"
            {...common}
          />
        </svg>
      );
    case "database":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <ellipse cx="12" cy="5.5" rx="8" ry="2.8" {...common} />
          <path d="M4 5.5v13c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8v-13" {...common} />
          <path d="M4 12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8" {...common} />
        </svg>
      );
    case "bot":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <rect x="4" y="9" width="16" height="11" rx="2.5" {...common} />
          <path d="M12 5.5v3.5M9.5 4h5" {...common} />
          <circle cx="9" cy="14.5" r="1" fill="white" stroke="none" />
          <circle cx="15" cy="14.5" r="1" fill="white" stroke="none" />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path d="M8 8L3 12l5 4M16 8l5 4-5 4M13.5 6l-3 12" {...common} />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <circle cx="12" cy="12" r="8" {...common} />
          <circle cx="12" cy="12" r="4.5" {...common} />
          <circle cx="12" cy="12" r="1" fill="white" stroke="none" />
        </svg>
      );
  }
}

export default function InstitutePrograms() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const visibleCourses = COURSES.filter((c) => c.category === activeCategory);

  // Scroll reveal for the header — direction-aware: enters from above when
  // scrolling down, from below when scrolling back up. Position-only, so
  // content is always fully visible regardless of direction or timing.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const directional = (el: Element | null, distance = 22, delay = 0) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 82%",
          end: "bottom 15%",
          onEnter: () =>
            gsap.fromTo(
              el,
              { y: distance },
              { y: 0, duration: 0.55, delay, ease: "power3.out" },
            ),
          onEnterBack: () =>
            gsap.fromTo(
              el,
              { y: -distance },
              { y: 0, duration: 0.55, delay, ease: "power3.out" },
            ),
        });
      };

      directional(headingRef.current, 22);
      directional(tabBarRef.current, 16, 0.1);

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

  // Direction-aware reveal for the course grid — cards rise from below when
  // scrolling down, settle in from above when scrolling back up.
  useEffect(() => {
    if (!gridRef.current) return;
    const el = gridRef.current;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      end: "bottom 10%",
      onEnter: () =>
        gsap.fromTo(
          el.children,
          { y: 24 },
          { y: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" },
        ),
      onEnterBack: () =>
        gsap.fromTo(
          el.children,
          { y: -24 },
          { y: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" },
        ),
    });
    return () => st.kill();
  }, []);

  // Slide the pill indicator behind whichever tab is active
  useLayoutEffect(() => {
    const btn = tabRefs.current[activeCategory];
    const bar = tabBarRef.current;
    if (!btn || !bar || !indicatorRef.current) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    gsap.to(indicatorRef.current, {
      x: btnRect.left - barRect.left,
      width: btnRect.width,
      duration: 0.35,
      ease: "power3.out",
    });
  }, [activeCategory]);

  // Simple slide-in for the course grid whenever the category changes
  useLayoutEffect(() => {
    if (!gridRef.current) return;
    gsap.fromTo(
      gridRef.current.children,
      { y: 10 },
      { y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" },
    );
  }, [activeCategory]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 lg:py-20"
      style={{ background: PAPER, fontFamily: FONT_BODY, color: INK }}
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Header */}
        <div ref={headingRef} className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em]"
            style={{ fontFamily: FONT_MONO, color: ACCENT_DEEP }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: ACCENT }}
            />
            Course Catalog
          </div>
          <h2
            className="mt-4 text-[34px] font-medium leading-[1.1] tracking-tight sm:text-[46px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            Learn what runs the
            <br />
            modern enterprise stack.
          </h2>
          <p
            className="mt-4 text-[15.5px] leading-7"
            style={{ color: INK_SOFT }}
          >
            Browse by track every batch is live and mentor led, capped small
            so faculty can track each learner by name.
          </p>
        </div>

        {/* Tab bar */}
        <div
          ref={tabBarRef}
          className="relative mt-10 flex flex-wrap items-center gap-2 border-b pb-4"
          style={{ borderColor: LINE }}
        >
          <div
            ref={indicatorRef}
            className="absolute bottom-[-1px] left-0 h-[2px] rounded-full"
            style={{
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})`,
              width: 0,
            }}
          />
          {CATEGORIES.map((cat) => {
            const count = COURSES.filter((c) => c.category === cat).length;
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                ref={(el) => {
                  tabRefs.current[cat] = el;
                }}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors duration-200"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: isActive ? INK : INK_SOFT,
                  background: isActive ? `${ACCENT}0d` : "transparent",
                }}
              >
                {cat}
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10.5px]"
                  style={{
                    fontFamily: FONT_MONO,
                    background: isActive
                      ? `${ACCENT}22`
                      : "rgba(20,20,28,0.06)",
                    color: isActive ? ACCENT_DEEP : INK_SOFT,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course grid for the active tab */}
        <div
          ref={gridRef}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleCourses.map((course) => (
            <div
              key={course.title}
              className="group flex flex-col rounded-3xl border p-6 transition-shadow duration-300 hover:shadow-[0_24px_50px_-24px_rgba(20,20,40,0.25)]"
              style={{ borderColor: LINE, background: "white" }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
                  }}
                >
                  <CourseIcon type={course.icon} />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SEAT_STYLES[course.seats]}`}
                >
                  {course.seats}
                </span>
              </div>

              <div
                className="mt-5 text-[11.5px] font-semibold uppercase tracking-wide"
                style={{ fontFamily: FONT_MONO, color: ACCENT_DEEP }}
              >
                {course.category}
              </div>
              <h3
                className="mt-1.5 text-[19px] font-medium"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {course.title}
              </h3>
              <p
                className="mt-2.5 flex-1 text-[13.5px] leading-6"
                style={{ color: INK_SOFT }}
              >
                {course.description}
              </p>

              <div
                className="mt-5 flex items-center justify-between border-t pt-4 text-[12.5px]"
                style={{ borderColor: LINE, color: INK_SOFT }}
              >
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M8 5v3l2 1.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span style={{ fontFamily: FONT_MONO }}>
                    {course.duration}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                    <circle
                      cx="5.5"
                      cy="5.5"
                      r="2.2"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <circle
                      cx="11"
                      cy="6.5"
                      r="1.8"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                    <path
                      d="M2 13c.5-2.3 2.3-3.5 4.5-3.5S10.5 10.7 11 13"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span style={{ fontFamily: FONT_MONO }}>
                    {course.batchSize}
                  </span>
                </span>
              </div>

              <Link
                href={"/courses"}
                className="mt-5 inline-flex items-center justify-center rounded-full border py-2.5 text-[13.5px] font-semibold transition-colors duration-200"
                style={{
                  borderColor: LINE,
                  color: INK,
                  backgroundImage: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundImage = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`;
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundImage = "none";
                  e.currentTarget.style.color = INK;
                  e.currentTarget.style.borderColor = LINE;
                }}
              >
                View syllabus
              </Link>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div
          className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl p-8 sm:flex-row sm:items-center"
          style={{
            background: `linear-gradient(150deg, ${ACCENT_DEEP}, ${ACCENT})`,
          }}
        >
          <div>
            <h3
              className="text-[20px] font-medium text-white"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Not sure which track fits?
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-6 text-white/80">
              Talk to our counsellor for a free assessment and personalised
              recommendation.
            </p>
          </div>
          <Link
            href="/contact-us/"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-[#12121a] transition-transform duration-200 hover:scale-[1.03]"
          >
            Talk to a Counsellor
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
