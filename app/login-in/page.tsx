import type { Metadata } from "next";
import { Suspense } from "react";
import LoginPage from "./component/login";

export const metadata: Metadata = {
  title: "Student Login",
  description: "Log in to your Ceptra Infotech student portal to access your enrolled courses, live class links, and resources.",
  openGraph: {
    title: "Student Login | Ceptra Infotech",
    description: "Log in to your Ceptra Infotech student portal to access your enrolled courses, live class links, and resources.",
    url: "https://ceptrainfotech.com/login-in/",
  },
};

export default function LoginIn() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] w-full bg-white" />}>
      <LoginPage />
    </Suspense>
  );
}
