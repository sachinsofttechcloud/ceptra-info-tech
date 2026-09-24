import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import AcknowledgementForm from "@/components/Layout/AcknowledgementForm";

export const metadata: Metadata = {
  title: "Student Terms and Conditions | Ceptra Infotech",
  description: "Official Student Terms and Conditions governing course admission, fee structure, refund policy, code of conduct, and placement assistance at Ceptra Infotech Pvt. Ltd.",
  openGraph: {
    title: "Student Terms and Conditions | Ceptra Infotech",
    description: "Official Student Terms and Conditions governing course admission, fee structure, refund policy, code of conduct, and placement assistance at Ceptra Infotech Pvt. Ltd.",
    url: "https://ceptrainfotech.com/terms/",
    siteName: "Ceptra Infotech",
  },
};

const TERMS_SECTIONS = [
  {
    id: 1,
    title: "1. Admission and Registration",
    content: [
      "Admission will be considered confirmed after the required registration process and payment have been completed.",
      "Students must provide correct information during registration.",
      "Ceptra Infotech reserves the right to reject or cancel an admission in cases involving false information, misuse of institute resources, misconduct, or violation of these Terms and Conditions.",
    ],
  },
  {
    id: 2,
    title: "2. Course Fees",
    content: [
      "Students must pay course fees according to the payment schedule communicated at the time of admission.",
      "Any discount, promotional offer, scholarship, or special fee is valid only for the period and conditions communicated by Ceptra Infotech.",
      "Students are responsible for keeping their payment receipt or transaction proof.",
      "Training access may be temporarily suspended if agreed payments remain pending.",
    ],
  },
  {
    id: 3,
    title: "3. Refund Policy",
    content: [
      "Students are advised to understand the course syllabus, duration, batch timing, fee structure, and training format before completing admission.",
      "Once the batch has started and the student has received access to classes, recordings, training material, practical environments, or other course resources, course fees are generally non-refundable.",
      "Any exceptional refund request will be reviewed by Ceptra Infotech management based on the circumstances and applicable terms.",
      "Failure to attend classes does not automatically qualify a student for a refund.",
    ],
  },
  {
    id: 4,
    title: "4. Batch Transfer",
    content: [
      "Batch transfer is not guaranteed. Students requesting a batch transfer must contact Ceptra Infotech.",
      "Approval may depend on seat availability, course progress, reason for transfer, trainer availability, and management approval.",
      "Additional charges may apply in certain situations.",
    ],
  },
  {
    id: 5,
    title: "5. Attendance",
    content: [
      "Students are expected to attend live classes regularly and join sessions on time.",
      "Students who miss a class are responsible for completing the missed topic through available recordings, notes, assignments, or other resources.",
      "Ceptra Infotech is not responsible for learning gaps caused by repeated absence or lack of practice.",
    ],
  },
  {
    id: 6,
    title: "6. Class Timings and Schedule",
    content: [
      "Class timings communicated during admission are planned schedules.",
      "Ceptra Infotech may modify class timing, training date, trainer, session sequence, practical schedule, training platform, or batch structure due to holidays, trainer availability, technical issues, Salesforce platform availability, emergencies, or operational requirements.",
      "Important updates will be communicated through the official batch communication channel.",
    ],
  },
  {
    id: 7,
    title: "7. Class Recordings",
    content: [
      "Class recordings may be provided depending on the respective training program, strictly for personal learning and revision.",
      "Students must NOT: share recordings with another person; upload recordings on YouTube/social media; share via WhatsApp, Telegram, Google Drive; sell/redistribute; screen-record classes; share login credentials; or provide access to an unauthorized person.",
      "Recording access may be provided for a limited duration depending on the course.",
    ],
  },
  {
    id: 8,
    title: "8. Course Material",
    content: [
      "Course material (PPTs, PDFs, notes, recordings, assignments, interview questions, project documents, practice exercises, templates, sample datasets, certification material, technical scenarios) is intended only for registered students.",
      "Students must not reproduce, redistribute, commercially use, resell, or publish Ceptra Infotech training material without authorization.",
    ],
  },
  {
    id: 9,
    title: "9. Intellectual Property",
    content: [
      "All original content, training material, presentations, recordings, documents, assignments, projects, methodologies, and resources remain the intellectual property of Ceptra Infotech or their rights holders.",
      "Enrollment grants permission for personal learning only and does not transfer ownership or intellectual property rights.",
    ],
  },
  {
    id: 10,
    title: "10. Practical Training",
    content: [
      "Students are expected to participate in practical sessions and complete assignments regularly.",
      "Practical environments may include Salesforce orgs, sandboxes, trial environments, developer orgs, third-party apps, APIs, or databases.",
      "Ceptra Infotech cannot guarantee permanent access to third-party systems.",
    ],
  },
  {
    id: 11,
    title: "11. Salesforce Platform Changes",
    content: [
      "Salesforce products and features may change through releases, updates, product renaming, feature retirement, licensing changes, or platform modifications.",
      "Course content may therefore be updated from time to time. Screens, features, processes, or terminology shown during training may differ from later Salesforce releases.",
    ],
  },
  {
    id: 12,
    title: "12. Technical Requirements",
    content: [
      "Students are responsible for arranging a laptop/desktop, stable internet, required applications, headphones/mic, suitable browser, and power backup.",
      "Problems with personal devices, internet, or local setup do not automatically qualify for a refund or additional batch.",
    ],
  },
  {
    id: 13,
    title: "13. Assignments and Practice",
    content: [
      "Students should complete assignments and practical exercises provided by trainers.",
      "Learning outcomes depend significantly on attendance, individual practice, assignments, projects, and interview preparation.",
    ],
  },
  {
    id: 14,
    title: "14. Student Conduct",
    content: [
      "Students must behave professionally and respectfully with trainers, coordinators, management, other students, and placement representatives.",
      "Prohibited conduct includes abusive language, harassment, threats, class disruption, unauthorized advertising, spam, sharing inappropriate content, or misusing student groups.",
      "Serious misconduct may result in removal from the batch or course access termination.",
    ],
  },
  {
    id: 15,
    title: "15. WhatsApp and Official Groups",
    content: [
      "Official groups are used primarily for class updates, technical questions, assignments, course discussions, interview prep, certification info, and placement updates.",
      "Avoid advertisements, political discussions, spam, personal disputes, and inappropriate messages in official groups.",
    ],
  },
  {
    id: 16,
    title: "16. Certification Preparation",
    content: [
      "Certification preparation may include syllabus guidance, practice questions, mock tests, revision sessions, and exam prep.",
      "Salesforce certification examination fees are separate unless specifically stated otherwise.",
      "Ceptra Infotech does not guarantee that a student will pass any third-party certification examination.",
    ],
  },
  {
    id: 17,
    title: "17. Interview Preparation",
    content: [
      "Includes technical questions, scenario-based questions, mock interviews, resume guidance, project explanations, and communication guidance.",
      "Interview success depends on the student's preparation and performance.",
    ],
  },
  {
    id: 18,
    title: "18. Placement Assistance",
    content: [
      "Ceptra Infotech provides placement assistance (resume guidance, interview prep, mock interviews, job opening alerts, profile sharing, recruiter connections).",
      "Placement assistance does NOT constitute a guarantee of employment. Final hiring decisions are made by employers.",
    ],
  },
  {
    id: 19,
    title: "19. Salary and Employment",
    content: [
      "Ceptra Infotech does not guarantee a specific salary, company, job location, remote employment, designation, or fixed joining date.",
      "Employment terms are determined by the hiring company and candidate.",
    ],
  },
  {
    id: 20,
    title: "20. Resume and Experience Representation",
    content: [
      "Students must provide truthful information regarding education, employment, certifications, and projects.",
      "Training projects must not be falsely represented as actual employment or client experience. Ceptra Infotech does not support false employment claims.",
    ],
  },
  {
    id: 21,
    title: "21. Real-Time and Training Projects",
    content: [
      "Projects provided during training may be simulated, demo implementations, practice projects, or case studies designed for learning.",
      "Students should accurately describe their role and the nature of the project during interviews.",
    ],
  },
  {
    id: 22,
    title: "22. Third-Party Services",
    content: [
      "Training may involve third-party products (Salesforce, Zoom, Google Meet, Teams, cloud platforms). Ceptra Infotech is not responsible for third-party interruptions, pricing, or downtime.",
    ],
  },
  {
    id: 23,
    title: "23. Confidentiality",
    content: [
      "Students must not disclose confidential information relating to Ceptra Infotech, trainers, clients, partner orgs, other students, or employers.",
    ],
  },
  {
    id: 24,
    title: "24. Account and Login Security",
    content: [
      "Students are responsible for protecting login credentials. Login details must not be shared. Access may be suspended if credential sharing is detected.",
    ],
  },
  {
    id: 25,
    title: "25. Course Duration",
    content: [
      "Course duration communicated is an estimated period. Actual completion dates may vary depending on holidays, trainer availability, student needs, and technical sessions.",
    ],
  },
  {
    id: 26,
    title: "26. Holidays and Cancelled Sessions",
    content: [
      "Classes may not occur on public holidays, festival holidays, or trainer emergencies. Missed sessions will be adjusted or rescheduled appropriately.",
    ],
  },
  {
    id: 27,
    title: "27. Communication",
    content: [
      "Students are responsible for regularly checking official channels (WhatsApp, email, portal, phone) for class and course updates.",
    ],
  },
  {
    id: 28,
    title: "28. Removal from Training",
    content: [
      "Ceptra Infotech reserves the right to suspend access for unauthorized material distribution, account sharing, fraud, harassment, abusive behaviour, or non-payment of fees.",
    ],
  },
  {
    id: 29,
    title: "29. Changes to Course Content",
    content: [
      "Topics may be updated, added, or replaced to reflect technology updates and maintain curriculum relevance.",
    ],
  },
  {
    id: 30,
    title: "30. Force Majeure and Unavoidable Circumstances",
    content: [
      "Ceptra Infotech is not responsible for delays caused by natural disasters, widespread outages, government restrictions, platform downtime, or events beyond control.",
    ],
  },
  {
    id: 31,
    title: "31. Policy Updates",
    content: [
      "Ceptra Infotech may revise these Terms and Conditions for operational, academic, technical, or legal reasons. Students will be informed of significant changes.",
    ],
  },
  {
    id: 32,
    title: "32. Student Acknowledgement",
    content: [
      "By registering, paying course fees, accessing resources, or attending classes, the student confirms that course details, fee structure, and terms are understood and accepted.",
      "Placement assistance is understood as assistance and not a job guarantee. Certification prep does not guarantee exam pass.",
    ],
  },
];

export default function TermsAndConditionsPage() {
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

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl mb-8 border border-slate-800">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-300 border border-violet-500/30 mb-4">
              <ShieldAlert className="h-4 w-4 text-violet-400" />
              Ceptra Infotech Pvt. Ltd.
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Student Terms & Conditions
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
              These Terms and Conditions apply to all students enrolling in training programs, courses, workshops, interview-prep, or certification programs offered by Ceptra Infotech Pvt. Ltd.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        </div>

        {/* Main Content Container (Iframe-friendly card) */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Comprehensive Student Agreement</h2>
              <p className="text-xs text-slate-500">Read carefully prior to course registration and fee payment</p>
            </div>
          </div>

          <div className="space-y-6">
            {TERMS_SECTIONS.map((section) => (
              <div
                key={section.id}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                  {section.title}
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold select-none">•</span>
                      <span>{paragraph}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Student Acknowledgement Form */}
          <AcknowledgementForm />
        </div>
      </div>
    </main>
  );
}
