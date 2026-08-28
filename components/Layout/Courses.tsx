"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PopularCourses from "@/components/Layout/CourseSection";
import FilterCourses from "@/components/Layout/FilterCourses";
import FilteredCoursesView from "@/components/Layout/CoursesPageContent";

function CoursesInner() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  if (filter) {
    return <FilteredCoursesView filter={filter} />;
  }

  return (
    <>
      <PopularCourses groupType="new-courses" />
      <FilterCourses groupType="" />
      <PopularCourses groupType="recent-courses" />
      <PopularCourses groupType="featured-courses" />
      <PopularCourses groupType="all-courses" />
    </>
  );
}

const Courses = () => {
  return (
    <Suspense fallback={null}>
      <CoursesInner />
    </Suspense>
  );
};

export default Courses;