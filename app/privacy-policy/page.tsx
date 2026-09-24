import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy & Class Rules | Ceptra Infotech",
  description: "Official Class Policy, Code of Conduct, and Privacy Rules for students enrolled at Ceptra Infotech Pvt. Ltd.",
  openGraph: {
    title: "Privacy Policy & Class Rules | Ceptra Infotech",
    description: "Official Class Policy, Code of Conduct, and Privacy Rules for students enrolled at Ceptra Infotech Pvt. Ltd.",
    url: "https://ceptrainfotech.com/privacy-policy/",
    siteName: "Ceptra Infotech",
  },
};

const POLICIES = [
  {
    num: "1",
    title: "Attendance & Punctuality",
    text: "Attend live classes regularly and join on time.",
    type: "info",
  },
  {
    num: "2",
    title: "Missed Classes",
    text: "If you miss a class, please complete it using the available recording.",
    type: "info",
  },
  {
    num: "3",
    title: "Schedule & Trainer Updates",
    text: "Class timings or trainers may occasionally change. Updates will always be shared in the official group.",
    type: "info",
  },
  {
    num: "4",
    title: "Exclusive Course Materials",
    text: "Class recordings, PPTs, notes, assignments, projects and interview material are strictly for enrolled students only.",
    type: "warning",
  },
  {
    num: "5",
    title: "Strict No-Sharing Policy",
    text: "Do not share, forward, sell, screen-record or upload our course material anywhere.",
    type: "strict",
  },
  {
    num: "6",
    title: "Practice & Assignments",
    text: "Complete your hands-on practice, assignments and projects regularly.",
    type: "info",
  },
  {
    num: "7",
    title: "Fee Payment & Refund Policy",
    text: "Course fees must be paid as per the agreed schedule. Once the batch/course access has started, fees are generally non-refundable.",
    type: "warning",
  },
  {
    num: "8",
    title: "Batch Transfers",
    text: "Batch changes are subject to seat availability and management approval.",
    type: "info",
  },
  {
    num: "9",
    title: "Code of Conduct",
    text: "Maintain professional and respectful behaviour with trainers, coordinators and other students.",
    type: "info",
  },
  {
    num: "10",
    title: "Placement Assistance",
    text: "Ceptra Infotech provides interview preparation and placement assistance, but job placement cannot be guaranteed. Final selection depends on your knowledge, interview performance and the hiring company's decision.",
    type: "info",
  },
];

const ADDITIONAL_RULES = [
  "Certification guidance will be provided where included.",
  "Please use training projects honestly as learning/project experience and do not claim false professional experience.",
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 sm:p-10 text-white shadow-xl mb-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-100 border border-white/20 mb-4">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Official Policy Document
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Class Policy & Terms
            </h1>
            <p className="mt-3 max-w-2xl text-violet-100 text-sm sm:text-base leading-relaxed">
              Dear Students, please read and follow these essential guidelines during your training journey at Ceptra Infotech Pvt. Ltd.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </div>

        {/* Policy List Container / Iframe-friendly view */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Guidelines & Privacy Agreement</h2>
              <p className="text-xs text-slate-500">Effective for all batches and enrolled students</p>
            </div>
          </div>

          <div className="space-y-4">
            {POLICIES.map((item) => (
              <div
                key={item.num}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  item.type === "strict"
                    ? "bg-rose-50/60 border-rose-200 text-rose-900"
                    : item.type === "warning"
                    ? "bg-amber-50/60 border-amber-200 text-amber-950"
                    : "bg-slate-50/80 border-slate-200/80 text-slate-800"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    item.type === "strict"
                      ? "bg-rose-600 text-white"
                      : item.type === "warning"
                      ? "bg-amber-600 text-white"
                      : "bg-violet-600 text-white"
                  }`}
                >
                  {item.num}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Additional Commitments
            </h3>
            {ADDITIONAL_RULES.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          {/* Agreement Notice */}
          <div className="mt-8 rounded-xl bg-slate-900 p-5 text-center text-white">
            <p className="text-xs sm:text-sm font-medium text-slate-300">
              By continuing with any course or batch, students acknowledge and agree to adhere strictly to all the policies outlined above.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span className="font-semibold text-violet-400">Ceptra Infotech Pvt. Ltd.</span>
              <span>Salesforce Training | Hands-on Practice | Interview Prep | Placement Assistance</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
