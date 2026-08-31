"use client";

import Link from "next/link";

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

const ACCENT = "#5B4FE0";

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

interface CourseCardProps {
  course: Course;
  layout?: "vertical" | "horizontal";
}

export default function CourseCard({ course }: CourseCardProps) {
  const hasDiscount =
    !!course.originalPrice && course.originalPrice > course.price;

  return (
    <Link
      href={course.href}
      className="p-4 carousel-card group flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Course Image */}
      <div className="relative w-full overflow-hidden rounded-lg bg-slate-100">
        <img
          src={course.image}
          alt={course.title}
          className="block h-auto w-full object-contain"
        />

        {course.badge && (
          <span
            className="absolute left-0 top-3 z-10 rounded-r-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: ACCENT }}
          >
            {course.badge}
          </span>
        )}
      </div>

      {/* Course Details */}
      <div className="mt-4 flex flex-1 flex-col">
        {/* Tags */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {course.tags.map((tag) => (
            <Tag key={tag} text={tag} />
          ))}
        </div>

        {/* Title */}
        <h3
          className="mb-3 line-clamp-2 text-sm font-bold leading-snug text-slate-900"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {course.title}
        </h3>

        {/* Price + Button */}
        <div className="mt-auto">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="text-lg font-extrabold"
              style={{ color: ACCENT }}
            >
              {formatINR(course.price)}
            </span>

            {hasDiscount && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(course.originalPrice!)}
                </span>

                <span className="text-xs font-bold text-emerald-600">
                  {discountPercent(
                    course.price,
                    course.originalPrice!
                  )}
                  % OFF
                </span>
              </>
            )}
            <span
              className="text-lg font-extrabold"
              style={{ color: ACCENT }}
            >
              {`$${Math.floor((course.price) / 95)}`}
            </span>
          </div>

          <span
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-transform duration-200 group-hover:scale-[1.02]"
            style={{ backgroundColor: ACCENT }}
          >
            Get this course
          </span>
        </div>
      </div>
    </Link>
  );
}

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function discountPercent(price: number, originalPrice: number) {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function Tag({ text }: { text: string }) {
  return (
    <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {text}
    </span>
  );
}