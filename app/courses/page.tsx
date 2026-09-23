"use client";

import Courses from "@/components/Layout/Courses";
import AuthGuard from "@/components/Auth/AuthGuard";

const CoursesPage = () => {
  return (
    <AuthGuard>
      <Courses />
    </AuthGuard>
  );
};

export default CoursesPage;
