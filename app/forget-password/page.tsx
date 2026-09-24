import type { Metadata } from "next";
import Password from "./component/password";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password to regain access to your Ceptra Infotech student portal account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgetPassword() {
    
    return (
        <>
         <Password />
        </>
    )
}