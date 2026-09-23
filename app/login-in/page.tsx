import { Suspense } from "react";
import LoginPage from "./component/login";

export default function LoginIn() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] w-full bg-white" />}>
      <LoginPage />
    </Suspense>
  );
}
