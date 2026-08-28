// // app/courses/[slug]/page.tsx
// import { notFound } from "next/navigation";
// import Link from "next/link";
// import { ALL_COURSES } from "@/app/courses/component/CourseData/coursesList";
// import { ArrowLeft } from "lucide-react";

// const FONT_DISPLAY =
//   "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
// const ACCENT = "#5B4FE0";

// interface PageProps {
//   params: Promise<{ slug: string }>;
// }

// export default async function CourseDetailPage({ params }: PageProps) {
//   const { slug } = await params;
//   const course = ALL_COURSES.find((c) => c.slug === slug);

//   if (!course) {
//     notFound();
//   }

//   const hasDiscount =
//     !!course.originalPrice && course.originalPrice > course.price;
//   const discount = hasDiscount
//     ? Math.round(
//         ((course.originalPrice! - course.price) / course.originalPrice!) * 100
//       )
//     : 0;

//   return (
//     <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 border-2">
//       <Link
//         href="/courses"

//         className="mb-6 text-sm font-medium text-slate-500 hover:text-violet-700 flex gap-2 items-center"
//       >
//        <ArrowLeft className="h-4 w-4" /> <span>Back to courses</span>
//       </Link>

//       <div className="flex flex-col gap-2">

//       </div>
//       {/* <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
//         <div className="relative overflow-hidden rounded-xl bord

//         er border-slate-200 bg-slate-100">
//           <img
//             src={course.image}
//             alt={course.title}
//             className="block h-auto w-full object-contain"
//           />
//           {course.badge && (
//             <span
//               className="absolute left-0 top-3 z-10 rounded-r-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
//               style={{ backgroundColor: ACCENT }}
//             >
//               {course.badge}
//             </span>
//           )}
//         </div>

//         <div className="flex flex-col">
//           <div className="mb-3 flex flex-wrap gap-1.5">
//             {course.tags.map((tag) => (
//               <span
//                 key={tag}
//                 className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>

//           <h1
//             className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl"
//             style={{ fontFamily: FONT_DISPLAY }}
//           >
//             {course.title}
//           </h1>

//           <div className="mb-6 flex items-center gap-3">
//             <span className="text-3xl font-extrabold" style={{ color: ACCENT }}>
//               ₹{course.price.toLocaleString("en-IN")}
//             </span>
//             {hasDiscount && (
//               <>
//                 <span className="text-base text-slate-400 line-through">
//                   ₹{course.originalPrice!.toLocaleString("en-IN")}
//                 </span>
//                 <span className="text-sm font-bold text-emerald-600">
//                   {discount}% OFF
//                 </span>
//               </>
//             )}
//           </div>

//           <button
//             type="button"
//             className="flex h-12 w-full items-center justify-center rounded-lg text-base font-semibold text-white transition-transform duration-200 hover:scale-[1.02] sm:w-64"
//             style={{ backgroundColor: ACCENT }}
//           >
//             Enroll Now
//           </button>
//         </div>
//       </div> */}
//     </section>
//   );
// }

// export function generateStaticParams() {
//   return ALL_COURSES.map((c) => ({ slug: c.slug }));
// }

// app/courses/[slug]/page.tsx
import { notFound } from "next/navigation";
import { ALL_COURSES } from "@/app/courses/component/CourseData/coursesList";
import CourseDetailClient from "./CourseDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = ALL_COURSES.find((c) => c.slug === slug);

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}

export function generateStaticParams() {
  return ALL_COURSES.map((c) => ({ slug: c.slug }));
}
