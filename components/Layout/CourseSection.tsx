"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from "lucide-react";
import CourseCard from "@/app/courses/component/CourseCard";
import data from "@/app/courses/component/CourseData/db.json";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ACCENT = "#5B4FE0";
const AUTO_ROTATE_MS = 1000;

interface Course {
  slug: string;
  title: string;
  image: string;
  tags: string[];
  price: number;
  originalPrice?: number;
  badge?: string;
  href: string;
}

interface CourseGroup {
  type: string;
  layout?: "vertical" | "horizontal";
  heading?: string;
  seeAllHref?: string | null;
  data: Course[];
}

const COURSE_GROUPS: CourseGroup[] = data.courses as CourseGroup[];
const ALL_COURSES_TYPE = "all-courses";

function EdgeArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Previous courses" : "Next courses"}
      onClick={onClick}
      className={`hidden md:flex absolute top-1/2 z-10 h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white shadow-md transition-transform hover:scale-110 ${direction === "left" ? "-left-3 sm:-left-5" : "-right-3 sm:-right-5"
        }`}
      style={{ borderColor: `${ACCENT}40`, color: ACCENT }}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function useVisibleCount() {
  const [count, setCount] = useState(4);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1280) setCount(4);
      else if (w >= 1024) setCount(3);
      else if (w >= 640) setCount(2);
      else setCount(1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return count;
}

export default function PopularCourses({ groupType = "new-courses" }: { groupType?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isAllCourses = groupType === ALL_COURSES_TYPE;

  const group: CourseGroup | undefined = isAllCourses
    ? {
      type: ALL_COURSES_TYPE,
      layout: "vertical",
      heading: "All courses",
      seeAllHref: "/courses",
      data: Array.from(
        new Map(
          COURSE_GROUPS.flatMap((g) => g.data).map((c) => [c.slug, c]),
        ).values(),
      ),
    }
    : COURSE_GROUPS.find((g) => g.type === groupType);

  const COURSES: Course[] = group?.data ?? [];
  const layout = group?.layout ?? "vertical";
  const heading = group?.heading ?? "Courses";

  const activeType = searchParams.get("type");
  const isExpanded = activeType === groupType;
  const isHiddenByOtherSection = !!activeType && activeType !== groupType;

  const openSeeAll = () => {
    router.push(`${pathname}?type=${groupType}`, { scroll: false });
  };

  const closeSeeAll = () => {
    router.push(pathname, { scroll: false });
  };

  const rawVisibleCount = useVisibleCount();
  const visibleCount = rawVisibleCount;

  const total = COURSES.length;
  const canNavigate = total > visibleCount;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const visibleCourses = Array.from(
    { length: Math.min(visibleCount, total) },
    (_, i) => COURSES[(index + i) % total],
  );

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    setIndex((prev) => (prev + 1) % total);
  }, [canNavigate, total]);

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    setIndex((prev) => (prev - 1 + total) % total);
  }, [canNavigate, total]);

  const jumpTo = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIndex(i);
  };

  useEffect(() => {
    if (
      !canNavigate ||
      isPaused ||
      isExpanded ||
      isHiddenByOtherSection ||
      layout !== "horizontal"
    ) {
      return;
    }
    timerRef.current = setInterval(goNext, AUTO_ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [canNavigate, isPaused, goNext, index, isExpanded, isHiddenByOtherSection, layout]);

  const handleManualNav = (dir: "prev" | "next") => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (dir === "next") goNext();
    else goPrev();
  };

  useEffect(() => {
    if (!trackRef.current || isExpanded) return;
    gsap.fromTo(
      trackRef.current,
      { opacity: 0.4, x: 12 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
    );
  }, [index, isExpanded]);

  useEffect(() => {
    if (isExpanded || isHiddenByOtherSection) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".carousel-card", trackRef.current);
      cards.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 24, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: "power3.out",
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 98%",
              toggleActions: "play reverse play reverse",
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [isExpanded, isHiddenByOtherSection]);

  useEffect(() => {
    if (!isExpanded || !trackRef.current) return;
    const cards = gsap.utils.toArray<HTMLElement>(".course-reveal", trackRef.current);
    cards.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out", delay: i * 0.05 },
      );
    });
  }, [isExpanded]);

  const showLeftArrow = canNavigate && layout === "vertical" && index !== 0 && !isExpanded;
  const showRightArrow = canNavigate && !isExpanded;
  const showDots = canNavigate && layout === "horizontal";

  if (total === 0) return null;
  if (isHiddenByOtherSection) return null;

  if (isExpanded) {
    return (
      <section ref={sectionRef} className="w-full bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={closeSeeAll}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <h2 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">{heading}</h2>
          <p className="mb-8 text-sm text-slate-500">
            {total} {total === 1 ? "course" : "courses"} in this section
          </p>

          <div
            ref={trackRef}
            className={
              layout === "horizontal"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            }
          >
            {COURSES.map((course, i) => (
              <div key={`${course.slug}-${i}`} className="course-reveal">
                <CourseCard course={course} layout={layout} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full bg-white py-10 sm:py-14">
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 sm:text-base">
            {heading}
          </h2>
          {group?.seeAllHref && (
            <button
              type="button"
              onClick={openSeeAll}
              className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: ACCENT }}
            >
              See All
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          {showLeftArrow && (
            <EdgeArrow direction="left" onClick={() => handleManualNav("prev")} />
          )}
          {showRightArrow && (
            <EdgeArrow direction="right" onClick={() => handleManualNav("next")} />
          )}

          <div
            ref={trackRef}
            className="grid gap-4 md:px-6"
            style={{
              gridTemplateColumns: `repeat(${Math.min(visibleCount, total)}, minmax(0, 1fr))`,
            }}
          >
            {visibleCourses.map((course, i) => (
              <CourseCard
                key={`${course.slug}-${index}-${i}`}
                course={course}
                layout={layout}
              />
            ))}
          </div>
        </div>

        {showDots && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {COURSES.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to course set ${i + 1}`}
                  aria-current={active}
                  onClick={() => jumpTo(i)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: active ? 22 : 8,
                    backgroundColor: active ? ACCENT : "#e2e2ea",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}