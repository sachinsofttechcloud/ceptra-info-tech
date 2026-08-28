"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, ArrowDownUp } from "lucide-react";
import PopularCourses from "@/components/Layout/CourseSection";
import FilterCourses from "@/components/Layout/FilterCourses";
import CourseCard from "@/app/courses/component/CourseCard";
import { ALL_COURSES } from "@/app/courses/component/CourseData/coursesList";

const FILTER_LABELS: Record<string, string> = {
  live: "Live Courses",
  "interview-readiness": "Interview Readiness",
  recorded: "Recorded Courses",
};

type SortOption = "newest" | "price-low" | "price-high" | "popular";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price Low To High" },
  { value: "price-high", label: "Price High To Low" },
  { value: "popular", label: "Popular" },
];

/* ============================================================
   FILTERED LISTING VIEW — shown only when ?filter= is present.
============================================================ */
export default function FilteredCoursesView({ filter }: { filter: string }) {
  const router = useRouter();
  const heading = FILTER_LABELS[filter] ?? "Courses";

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim().toLowerCase()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const [sortBy, setSortBy] = useState<SortOption | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 const courses = useMemo(() => {
    let list =
      filter === "interview-readiness"
        ? [...ALL_COURSES]
        : ALL_COURSES.filter((c) => c.category === filter);

    console.log("filter", filter);

    if (debouncedSearch) {
      list = list.filter((c) => c.title.toLowerCase().includes(debouncedSearch));
    }

    const sorted = [...list];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      default:
        break;
    }

    return sorted;
  }, [filter, debouncedSearch, sortBy]);

  const currentSortLabel = sortBy ? SORT_OPTIONS.find((o) => o.value === sortBy)?.label : "Sort";

  return (
    <main className="w-full bg-white">
      <div className="border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push("/courses")}
            aria-label="Back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for courses"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div ref={sortRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {currentSortLabel}
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === opt.value}
                      onChange={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className="accent-[#5B4FE0]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl">{heading}</h1>

        {courses.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">
            No courses found{debouncedSearch ? ` for "${searchInput}"` : ""}.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} layout="vertical" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

