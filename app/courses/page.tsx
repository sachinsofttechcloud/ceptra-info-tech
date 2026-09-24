import type { Metadata } from "next";
import Courses from "@/components/Layout/Courses";
import AuthGuard from "@/components/Auth/AuthGuard";

export const metadata: Metadata = {
  title: "Courses Catalogue",
  description: "Browse our industry-proven training courses in Salesforce Admin, Developer, Marketing Cloud, LWC, Agentforce, and Data Cloud.",
  openGraph: {
    title: "Courses Catalogue | Ceptra Infotech",
    description: "Browse our industry-proven training courses in Salesforce Admin, Developer, Marketing Cloud, LWC, Agentforce, and Data Cloud.",
    url: "https://ceptrainfotech.com/courses/",
  },
};

const CoursesPage = () => {
  return (
    <AuthGuard>
      <Courses />
    </AuthGuard>
  );
};

export default CoursesPage;
