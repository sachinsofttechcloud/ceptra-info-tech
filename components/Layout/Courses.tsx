"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import PopularCourses from "@/components/Layout/CourseSection";
import FilterCourses from "@/components/Layout/FilterCourses";
import FilteredCoursesView from "@/components/Layout/CoursesPageContent";
import AdminCourseTools from "@/components/Layout/AdminCourseTools";
import { getStoredUser } from "@/components/Auth/AuthGuard";
import { isAdminEmail } from "@/lib/admin";

function CoursesInner() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const [nameFilter, setNameFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const sync = () => setIsAdmin(isAdminEmail(getStoredUser()?.email));
    sync();
    window.addEventListener("ceptra_auth_change", sync);
    return () => window.removeEventListener("ceptra_auth_change", sync);
  }, []);

  return (
    <>
      {isAdmin && <AdminCourseTools nameFilter={nameFilter} onNameFilter={setNameFilter} />}
      {filter ? (
        <FilteredCoursesView filter={filter} />
      ) : (
        <>
      <PopularCourses groupType="new-courses" nameFilter={isAdmin ? nameFilter : ""} />
      <FilterCourses groupType="" />
      <PopularCourses groupType="recent-courses" nameFilter={isAdmin ? nameFilter : ""} />
      <PopularCourses groupType="featured-courses" nameFilter={isAdmin ? nameFilter : ""} />
      <PopularCourses groupType="all-courses" nameFilter={isAdmin ? nameFilter : ""} />
        </>
      )}
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