"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Clock, ArrowRight, Laptop, Building2, type LucideIcon } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";

// Single accent used everywhere for non-black text, icons, and the CTA arrow.
const ACCENT = "#5B4FE0";

/* ============================================================
   DATA — same order and content as the source, nothing dropped.
   Bold text is written as **like this** and parsed by RichText.
============================================================ */

type Variant =
  | "hero"
  | "domain"
  | "benefit-grid"
  | "chip-cloud"
  | "duration-cards"
  | "stats"
  | "cta-banner";

interface ListBlock {
  heading?: string;
  intro?: string;
  items: string[];
  boldItems?: boolean;
}

interface Section {
  id: string;
  variant: Variant;
  kicker?: string;
  heading?: string;
  subheading?: string;
  paragraphs?: string[];
  lists?: ListBlock[];
}

const SECTIONS: Section[] = [
  {
    id: "overview",
    variant: "hero",
    kicker: "Paid Internship Program",
    heading: "Kickstart Your Career with Real-Time Industry Experience",
    paragraphs: [
      "At **Ceptra Infotech Pvt. Ltd.**, we believe that practical experience is the key to building a successful career. Our **Paid Internship Program** is designed to bridge the gap between academic learning and industry expectations by providing hands-on training, live projects, and mentorship from experienced professionals.",
      "Whether you're a student, recent graduate, or working professional looking to upskill, our internship program helps you gain real-world experience, enhance your technical skills, and improve your employability.",
    ],
    lists: [
      {
        heading: "Why Choose Our Internship Program?",
        items: [
          "Work on Live Industry Projects",
          "Learn from Experienced Mentors",
          "Hands-on Practical Training",
          "Industry-Oriented Curriculum",
          "Daily Task Assignments",
          "Code Reviews & Project Guidance",
          "Soft Skills & Communication Training",
          "Resume Building Assistance",
          "LinkedIn Profile Optimization",
          "Mock Interviews",
          "Internship Certificate",
          "Placement Assistance",
          "Flexible Online & Offline Learning",
        ],
      },
    ],
  },
  {
    id: "domain-salesforce",
    variant: "domain",
    kicker: "Internship Domain — 01",
    heading: "Salesforce Internship",
    subheading: "Build Your Career in the World's #1 CRM Platform",
    paragraphs: [
      "Our Salesforce Internship provides practical exposure to real business projects using Salesforce technologies. Students gain experience in CRM development, automation, integrations, and cloud-based applications.",
    ],
    lists: [
      {
        heading: "Internship Modules",
        items: [
          "Salesforce Administration",
          "Apex Programming",
          "Lightning Web Components (LWC)",
          "SOQL & SOSL",
          "Flow Builder",
          "Validation Rules",
          "Process Automation",
          "Reports & Dashboards",
          "Salesforce Security",
          "Deployment",
          "Git Basics",
          "Marketing Cloud",
          "Data Cloud",
          "Agentforce Fundamentals",
          "Live Client Projects",
        ],
      },
      {
        heading: "Live Projects",
        intro: "Students work on real-time projects from industries such as:",
        items: ["Banking", "Healthcare", "Real Estate", "Tours & Travels", "E-commerce", "Insurance"],
      },
      {
        heading: "Career Opportunities",
        items: [
          "Salesforce Administrator",
          "Salesforce Developer",
          "Marketing Cloud Developer",
          "Salesforce Consultant",
          "CRM Developer",
          "Salesforce Business Analyst",
        ],
      },
    ],
  },
  {
    id: "domain-digital-marketing",
    variant: "domain",
    kicker: "Internship Domain — 02",
    heading: "Digital Marketing Internship",
    subheading: "Learn Modern Digital Marketing with Practical Experience",
    paragraphs: [
      "Our Digital Marketing Internship focuses on current industry practices, helping students understand how businesses generate leads, increase website traffic, and build strong online brands.",
    ],
    lists: [
      {
        heading: "Internship Modules",
        items: [
          "Digital Marketing Fundamentals",
          "Search Engine Optimization (SEO)",
          "Search Engine Marketing (SEM)",
          "Google Ads",
          "Social Media Marketing",
          "Facebook & Instagram Ads",
          "LinkedIn Marketing",
          "Content Marketing",
          "Email Marketing",
          "WhatsApp Marketing",
          "YouTube Marketing",
          "Google Analytics",
          "Google Search Console",
          "AI Tools for Digital Marketing",
          "Canva for Marketing",
          "Marketing Strategy Development",
        ],
      },
      {
        heading: "Practical Exposure",
        items: [
          "Live Campaign Creation",
          "Website Optimization",
          "Social Media Management",
          "Keyword Research",
          "Ad Campaign Management",
          "Performance Analysis",
          "Lead Generation Projects",
        ],
      },
      {
        heading: "Career Opportunities",
        items: [
          "Digital Marketing Executive",
          "SEO Executive",
          "Social Media Manager",
          "Performance Marketer",
          "Content Strategist",
          "PPC Specialist",
        ],
      },
    ],
  },
  {
    id: "domain-web-dev",
    variant: "domain",
    kicker: "Internship Domain — 03",
    heading: "Website Development Internship",
    subheading: "Become a Professional Web Developer",
    paragraphs: [
      "Learn to design and develop responsive, modern, and dynamic websites through practical implementation and real client projects.",
    ],
    lists: [
      {
        heading: "Internship Modules",
        items: [
          "HTML5",
          "CSS3",
          "JavaScript",
          "Bootstrap",
          "Responsive Web Design",
          "React Basics",
          "PHP Fundamentals",
          "MySQL Database",
          "WordPress Development",
          "Website Hosting",
          "Domain Management",
          "UI/UX Basics",
          "Website Optimization",
          "API Integration",
          "Git & GitHub",
        ],
      },
      {
        heading: "Live Projects",
        intro: "Students will build:",
        items: [
          "Business Websites",
          "Portfolio Websites",
          "Educational Websites",
          "E-commerce Websites",
          "Landing Pages",
          "Admin Dashboards",
          "Dynamic Web Applications",
        ],
      },
      {
        heading: "Career Opportunities",
        items: [
          "Front-End Developer",
          "Web Developer",
          "WordPress Developer",
          "UI Developer",
          "Full Stack Developer (Foundation)",
          "Website Designer",
        ],
      },
    ],
  },
  {
    id: "benefits",
    variant: "benefit-grid",
    heading: "Internship Benefits",
    paragraphs: ["Every intern receives:"],
    lists: [
      {
        items: [
          "Live Project Experience",
          "Industry Mentorship",
          "Practical Assignments",
          "Weekly Assessments",
          "Interview Preparation",
          "Resume Building",
          "LinkedIn Profile Optimization",
          "Internship Completion Certificate",
          "Letter of Recommendation (for outstanding performers)",
          "Placement Assistance",
          "Access to Learning Resources",
          "Doubt-Clearing Sessions",
        ],
      },
      {
        heading: "Training Mode",
        intro: "We offer flexible learning options:",
        items: [
          "**Online Internship** – Attend live sessions from anywhere in India.",
          "**Offline Internship** – Learn in our classroom environment with direct mentor support.",
        ],
      },
    ],
  },
  {
    id: "who-can-apply",
    variant: "chip-cloud",
    heading: "Who Can Apply?",
    paragraphs: ["Our internship programs are suitable for:"],
    lists: [
      {
        items: [
          "BE/B.Tech Students",
          "BCA/MCA Students",
          "Sc./M.Sc. Graduates",
          "Diploma Students",
          "MBA Students",
          "Fresh Graduates",
          "Final-Year Students",
          "Working Professionals",
          "Career Switchers",
        ],
      },
    ],
  },
  {
    id: "duration",
    variant: "duration-cards",
    paragraphs: ["No prior industry experience is required."],
    heading: "Internship Duration",
    lists: [
      {
        intro: "Choose a program that fits your goals:",
        items: [
          "**3 Month** – Foundation Program",
          "**4 Months** – Intermediate Training",
          "**6 Months** – Advanced Internship with Live Projects",
        ],
      },
    ],
  },
  {
    id: "placement-support",
    variant: "stats",
    heading: "Placement Support",
    paragraphs: [
      "Our internship is designed with a strong focus on employability. Students receive:",
    ],
    lists: [
      {
        items: [
          "Technical Mock Interviews",
          "HR Interview Preparation",
          "Resume & Portfolio Building",
          "Communication Skills Training",
          "Job Referral Assistance",
          "Placement Guidance",
        ],
      },
      {
        heading: "Why Ceptra Infotech?",
        boldItems: true,
        items: [
          "1200+ Students Successfully Placed",
          "5+ Years of Training Excellence",
          "Industry-Experienced Trainers",
          "Real-Time Live Projects",
          "100% Practical Learning",
          "Affordable Paid Internship Programs",
          "Online & Offline Batches",
          "Career-Focused Training",
          "Dedicated Placement Assistance",
        ],
      },
    ],
  },
  {
    id: "cta",
    variant: "cta-banner",
    heading: "Start Your Professional Journey Today",
    paragraphs: [
      "Transform your knowledge into practical skills with **Ceptra Infotech's Paid Internship Program**. Gain hands-on experience, work on live projects, earn an internship certificate, and prepare yourself for exciting career opportunities in **Salesforce, Digital Marketing, and Website Development**.",
      "**Enroll today and take the first step toward a successful IT career with Ceptra Infotech Pvt. Ltd.**",
    ],
  },
];

/* ============================================================
   RICH TEXT — turns **bold** markers into <strong>.
============================================================ */

function RichText({ text, boldClassName }: { text: string; boldClassName?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className={boldClassName ?? "font-semibold text-neutral-900"}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// splits "1200+ Students Successfully Placed" -> ["1200+", "Students Successfully Placed"]
function splitStat(text: string): [string | null, string] {
  const match = text.match(/^([\d.,]+\+?%?)\s+(.*)$/);
  return match ? [match[1], match[2]] : [null, text];
}

// splits "**Label** – Description" -> ["Label", "Description"]
function splitLabelDesc(text: string): [string, string] {
  const match = text.match(/\*\*([^*]+)\*\*\s*–\s*(.*)/);
  return match ? [match[1], match[2]] : [text, ""];
}

/* ============================================================
   SMALL BUILDING BLOCKS — all colored text/icons use ACCENT
============================================================ */

function Kicker({ text }: { text: string }) {
  return (
    <span
      className="reveal-item mb-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
      style={{ borderColor: `${ACCENT}55`, backgroundColor: `${ACCENT}14`, color: ACCENT }}
    >
      {text}
    </span>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <li className="reveal-item flex items-start gap-2.5 text-sm leading-6 text-neutral-600 sm:text-[15px]">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${ACCENT}1A` }}
      >
        <Check className="h-3 w-3" style={{ color: ACCENT }} strokeWidth={3} />
      </span>
      <span>
        <RichText text={text} />
      </span>
    </li>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span
      className="reveal-card inline-flex rounded-lg border px-3.5 py-1.5 text-xs font-medium sm:text-sm"
      style={{ borderColor: `${ACCENT}33`, backgroundColor: `${ACCENT}0D`, color: ACCENT }}
    >
      {text}
    </span>
  );
}

/* ============================================================
   FEATURE CARD — the shared "icon box" theme.
   Used by the 2-box Training Mode grid AND the 3-box Duration
   grid, so both read as the same design language instead of
   two different card styles.
============================================================ */

function FeatureCard({
  icon: Icon,
  title,
  description,
  highlighted = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className="reveal-card flex h-full flex-col rounded-2xl border p-6 text-left transition-transform duration-200 hover:-translate-y-1"
      style={
        highlighted
          ? { backgroundColor: ACCENT, borderColor: ACCENT }
          : { backgroundColor: "white", borderColor: "#e5e5e5" }
      }
    >
      <span
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: highlighted ? "rgba(255,255,255,0.2)" : `${ACCENT}15` }}
      >
        <Icon className="h-5 w-5" style={{ color: highlighted ? "white" : ACCENT }} />
      </span>
      <h3
        className={`mb-1 text-lg font-bold ${highlighted ? "text-white" : "text-neutral-900"}`}
        style={{ fontFamily: FONT_DISPLAY }}
      >
        {title}
      </h3>
      <p className={`text-sm leading-6 ${highlighted ? "text-white/85" : "text-neutral-500"}`}>
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   VARIANT RENDERERS
============================================================ */

function HeroSection({ s }: { s: Section }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-14 text-center sm:px-8 sm:py-20 lg:px-10">
      {s.kicker && <Kicker text={s.kicker} />}
      {s.heading && (
        <h1
          className="reveal-item mx-auto mb-5 max-w-3xl text-[30px] font-bold leading-[1.15] tracking-tight text-neutral-900 sm:text-[42px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {s.heading}
        </h1>
      )}
      {s.paragraphs?.map((p, i) => (
        <p
          key={i}
          className="reveal-item mx-auto mb-4 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-[15px] sm:leading-7"
        >
          <RichText text={p} />
        </p>
      ))}

      {s.lists?.map((list, li) => (
        <div key={li} className="mx-auto mt-10 max-w-3xl text-left">
          {list.heading && (
            <h4 className="reveal-item mb-4 text-center text-lg font-bold text-neutral-900 sm:text-xl">
              {list.heading}
            </h4>
          )}
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-6 sm:grid-cols-2 sm:p-8">
            {list.items.map((item, ii) => (
              <CheckRow key={ii} text={item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DomainSection({ s }: { s: Section }) {
  const [modules, projects, careers] = s.lists ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 lg:px-10">
      <div
        className="reveal-card overflow-hidden rounded-3xl border shadow-sm"
        style={{ borderColor: `${ACCENT}26` }}
      >
        {/* header strip */}
        <div className="px-6 pb-2 pt-8 sm:px-10 sm:pt-10" style={{ backgroundColor: `${ACCENT}0A` }}>
          {s.kicker && <Kicker text={s.kicker} />}
          {s.heading && (
            <h2
              className="reveal-item mb-1 text-[26px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-[32px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {s.heading}
            </h2>
          )}
          {s.subheading && (
            <h3 className="reveal-item mb-4 text-sm font-semibold sm:text-base" style={{ color: ACCENT }}>
              {s.subheading}
            </h3>
          )}
          {s.paragraphs?.map((p, i) => (
            <p key={i} className="reveal-item pb-6 text-sm leading-6 text-neutral-500 sm:text-[15px] sm:leading-7">
              <RichText text={p} />
            </p>
          ))}
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {/* modules as a chip cloud */}
          {modules && (
            <div className="mb-8">
              <h4 className="reveal-item mb-3 text-sm font-bold uppercase tracking-wide text-neutral-800">
                {modules.heading}
              </h4>
              <div className="flex flex-wrap gap-2">
                {modules.items.map((item, ii) => (
                  <Chip key={ii} text={item} />
                ))}
              </div>
            </div>
          )}

          {/* live projects + careers as two side-by-side cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {projects && (
              <div className="reveal-card rounded-2xl bg-neutral-50/70 p-5 sm:p-6">
                <h4 className="reveal-item mb-1 text-sm font-bold text-neutral-900">{projects.heading}</h4>
                {projects.intro && (
                  <p className="reveal-item mb-3 text-xs text-neutral-500 sm:text-sm">{projects.intro}</p>
                )}
                <ul className="space-y-2">
                  {projects.items.map((item, ii) => (
                    <CheckRow key={ii} text={item} />
                  ))}
                </ul>
              </div>
            )}
            {careers && (
              <div className="reveal-card rounded-2xl bg-neutral-50/70 p-5 sm:p-6">
                <h4 className="reveal-item mb-3 text-sm font-bold text-neutral-900">{careers.heading}</h4>
                <ul className="space-y-2">
                  {careers.items.map((item, ii) => (
                    <CheckRow key={ii} text={item} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons for the two Training Mode cards, matched by label so the
// data stays plain text and the icon mapping lives in one place.
const TRAINING_ICONS: Record<string, LucideIcon> = {
  Online: Laptop,
  Offline: Building2,
};

function BenefitGridSection({ s }: { s: Section }) {
  const [benefits, training] = s.lists ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 lg:px-10">
      {s.heading && (
        <h2
          className="reveal-item mb-2 text-center text-[26px] font-bold tracking-tight text-neutral-900 sm:text-[32px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {s.heading}
        </h2>
      )}
      {s.paragraphs?.map((p, i) => (
        <p key={i} className="reveal-item mb-8 text-center text-sm text-neutral-500 sm:text-[15px]">
          <RichText text={p} />
        </p>
      ))}

      {benefits && (
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.items.map((item, ii) => (
            <div
              key={ii}
              className="reveal-card flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${ACCENT}15` }}
              >
                <Check className="h-3.5 w-3.5" style={{ color: ACCENT }} strokeWidth={3} />
              </span>
              <span className="text-sm leading-6 text-neutral-700">
                <RichText text={item} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Training Mode — same FeatureCard theme as the 3-box Duration grid */}
      {training && (
        <div>
          {training.heading && (
            <h4 className="reveal-item mb-1 text-center text-lg font-bold text-neutral-900">
              {training.heading}
            </h4>
          )}
          {training.intro && (
            <p className="reveal-item mb-4 text-center text-sm text-neutral-500">{training.intro}</p>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {training.items.map((item, ii) => {
              const [label, desc] = splitLabelDesc(item);
              const iconKey = Object.keys(TRAINING_ICONS).find((k) => label.startsWith(k));
              const Icon = iconKey ? TRAINING_ICONS[iconKey] : Laptop;
              return <FeatureCard key={ii} icon={Icon} title={label} description={desc} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ChipCloudSection({ s }: { s: Section }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-14 text-center sm:px-8 lg:px-10">
      {s.heading && (
        <h2
          className="reveal-item mb-2 text-[26px] font-bold tracking-tight text-neutral-900 sm:text-[32px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {s.heading}
        </h2>
      )}
      {s.paragraphs?.map((p, i) => (
        <p key={i} className="reveal-item mb-6 text-sm text-neutral-500 sm:text-[15px]">
          <RichText text={p} />
        </p>
      ))}
      {s.lists?.map((list, li) => (
        <div key={li} className="flex flex-wrap justify-center gap-2.5">
          {list.items.map((item, ii) => (
            <Chip key={ii} text={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

function DurationCardsSection({ s }: { s: Section }) {
  const list = s.lists?.[0];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 text-center sm:px-8 lg:px-10">
      {s.heading && (
        <h2
          className="reveal-item mb-2 text-[26px] font-bold tracking-tight text-neutral-900 sm:text-[32px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {s.heading}
        </h2>
      )}
      {list?.intro && (
        <p className="reveal-item mb-8 text-sm text-neutral-500 sm:text-[15px]">{list.intro}</p>
      )}

      {/* Same FeatureCard theme as the 2-box Training Mode grid;
          the most advanced tier is the highlighted variant. */}
      <div className="grid grid-cols-1 gap-5 text-left sm:grid-cols-3">
        {list?.items.map((item, ii) => {
          const [label, desc] = splitLabelDesc(item);
          return (
            <FeatureCard key={ii} icon={Clock} title={label} description={desc} highlighted={ii === 2} />
          );
        })}
      </div>

      {s.paragraphs?.map((p, i) => (
        <p key={i} className="reveal-item mt-6 text-xs italic text-neutral-400 sm:text-sm">
          <RichText text={p} />
        </p>
      ))}
    </div>
  );
}

function StatsSection({ s }: { s: Section }) {
  const [support, why] = s.lists ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 lg:px-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          {s.heading && (
            <h2
              className="reveal-item mb-2 text-[26px] font-bold tracking-tight text-neutral-900 sm:text-[32px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {s.heading}
            </h2>
          )}
          {s.paragraphs?.map((p, i) => (
            <p key={i} className="reveal-item mb-4 text-sm leading-6 text-neutral-500 sm:text-[15px]">
              <RichText text={p} />
            </p>
          ))}
          {support && (
            <ul className="space-y-2.5">
              {support.items.map((item, ii) => (
                <CheckRow key={ii} text={item} />
              ))}
            </ul>
          )}
        </div>

        {why && (
          <div>
            {why.heading && (
              <h4 className="reveal-item mb-4 text-lg font-bold text-neutral-900">{why.heading}</h4>
            )}
            <div className="grid grid-cols-2 gap-3">
              {why.items.map((item, ii) => {
                const [stat, label] = splitStat(item);
                return (
                  <div
                    key={ii}
                    className="reveal-card rounded-2xl p-4 text-center"
                    style={{ backgroundColor: `${ACCENT}0D`, border: `1px solid ${ACCENT}26` }}
                  >
                    {stat ? (
                      <div className="mb-1 text-xl font-extrabold" style={{ color: ACCENT }}>
                        {stat}
                      </div>
                    ) : (
                      <div
                        className="mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${ACCENT}20` }}
                      >
                        <Check className="h-3.5 w-3.5" style={{ color: ACCENT }} strokeWidth={3} />
                      </div>
                    )}
                    <div className="text-xs font-semibold leading-snug text-neutral-700">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CtaBannerSection({ s }: { s: Section }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 lg:px-10">
      <div
        className="reveal-card overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16"
        style={{
          background: `linear-gradient(135deg, ${ACCENT} 0%, #8A7DFF 100%)`,
        }}
      >
        {s.heading && (
          <h2
            className="reveal-item mx-auto mb-4 max-w-xl text-[26px] font-bold leading-tight text-white sm:text-[34px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {s.heading}
          </h2>
        )}
        {s.paragraphs?.map((p, i) => (
          <p
            key={i}
            className="reveal-item mx-auto mb-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-[15px]"
          >
            <RichText text={p} boldClassName="font-bold text-white" />
          </p>
        ))}
         <a
          href="/contact-us"
          className="reveal-item mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
          style={{ color: ACCENT }}
        >
          Enroll Now
          <ArrowRight className="h-4 w-4" style={{ color: ACCENT }} />
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   REUSABLE SECTION WRAPPER — wires up scroll animation once,
   scoped to its own subtree, then delegates to the right variant.
============================================================ */

function InternshipSection({ section, index }: { section: Section; index: number }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // text — fade up from the bottom
      gsap.utils.toArray<HTMLElement>(".reveal-item", rootRef.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            delay: (i % 6) * 0.04,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      // cards / chips — fade up + slight scale for a punchier reveal
      gsap.utils.toArray<HTMLElement>(".reveal-card", rootRef.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "power3.out",
            delay: (i % 8) * 0.05,
            scrollTrigger: {
              trigger: el,
              start: "top 94%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const zebra = index % 2 === 1;

  return (
    <section
      ref={rootRef}
      id={section.id}
      className={zebra ? "bg-neutral-50/50" : "bg-white"}
    >
      {section.variant === "hero" && <HeroSection s={section} />}
      {section.variant === "domain" && <DomainSection s={section} />}
      {section.variant === "benefit-grid" && <BenefitGridSection s={section} />}
      {section.variant === "chip-cloud" && <ChipCloudSection s={section} />}
      {section.variant === "duration-cards" && <DurationCardsSection s={section} />}
      {section.variant === "stats" && <StatsSection s={section} />}
      {section.variant === "cta-banner" && <CtaBannerSection s={section} />}
    </section>
  );
}

/* ============================================================
   PAGE — maps SECTIONS in order, nothing reordered.
============================================================ */

export default function InternshipProgramPage() {
  return (
    <main className="w-full bg-white">
      {SECTIONS.map((section, i) => (
        <InternshipSection key={section.id} section={section} index={i} />
      ))}
    </main>
  );
}