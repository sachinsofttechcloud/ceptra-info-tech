import type { Metadata } from "next";
import Signup from "./component/signup";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new Ceptra Infotech account to enroll in live Salesforce courses, access learning material, and track progress.",
  openGraph: {
    title: "Create Account | Ceptra Infotech",
    description: "Create a new Ceptra Infotech account to enroll in live Salesforce courses, access learning material, and track progress.",
    url: "https://ceptrainfotech.com/signup/",
  },
};

export default function SignupPage() {

    return (
        <>
          <Signup />
        </>
    )
}