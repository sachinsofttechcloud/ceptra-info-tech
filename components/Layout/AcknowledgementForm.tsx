"use client";

import { useState } from "react";
import { CheckCircle2, Send, ShieldCheck, Check, Sparkles, X } from "lucide-react";
import { API_URL } from "@/lib/admin";

const COURSE_OPTIONS = [
  "Salesforce Admin & Developer",
  "Salesforce Marketing Cloud (SFMC)",
  "Lightning Web Components (LWC)",
  "Agentforce & Data Cloud Masterclass",
  "Salesforce Flow Masterclass",
  "Full Stack Web Development",
  "Other Training Program",
];

export default function AcknowledgementForm() {
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState(COURSE_OPTIONS[0]);
  const [customCourse, setCustomCourse] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!studentName.trim()) {
      setErrorMsg("Please enter your Student Name.");
      return;
    }
    const finalCourse = courseName === "Other Training Program" ? customCourse.trim() : courseName;
    if (!finalCourse) {
      setErrorMsg("Please select or enter your Course Name.");
      return;
    }
    if (mobileNumber.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit Mobile Number.");
      return;
    }
    if (!acceptedTerms) {
      setErrorMsg("You must accept the terms and conditions declaration.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/acknowledgements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          courseName: finalCourse,
          mobileNumber: mobileNumber.trim(),
          date,
          acceptedTerms: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(`Acknowledgement recorded successfully for ${studentName.trim()}!`);
        setShowToast(true);

        // Reset form
        setStudentName("");
        setMobileNumber("");
        setAcceptedTerms(false);

        // Auto dismiss top-right toast after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      } else {
        setErrorMsg(data.message || "Failed to submit acknowledgement. Please try again.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg("Network error. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TOP RIGHT TOAST POPUP */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-emerald-500/40 animate-bounce-in max-w-sm sm:max-w-md">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Form Submitted Successfully
            </h4>
            <p className="text-xs font-medium text-slate-200 mt-0.5">{toastMessage}</p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* FORM CARD CONTAINER */}
      <div className="mt-10 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/50 p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-3 border-b border-violet-100 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Student Declaration & Acknowledgement Form
            </h3>
            <p className="text-xs text-slate-500">
              Fill and submit this official digital acknowledgement to record your agreement in the institute database.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Student Name */}
            <div>
              <label htmlFor="ackStudentName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Student Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="ackStudentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Course Name */}
            <div>
              <label htmlFor="ackCourseName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Name <span className="text-rose-500">*</span>
              </label>
              <select
                id="ackCourseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              >
                {COURSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {courseName === "Other Training Program" && (
                <input
                  type="text"
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                  placeholder="Specify course title"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 outline-none focus:border-violet-600"
                />
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="ackMobile" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                id="ackMobile"
                type="tel"
                inputMode="numeric"
                value={mobileNumber}
                onChange={handleMobileChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="ackDate" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="ackDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                By ticking this box, I confirm that I have read, understood, and agreed to follow all 32 sections of the{" "}
                <strong className="text-slate-900 font-semibold">Ceptra Infotech Student Terms and Conditions</strong>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:bg-violet-700 hover:shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Submitting to Database...</span>
            ) : (
              <>
                <span>Submit Digital Acknowledgement</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
