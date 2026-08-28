"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

/**
 * Font note: authored around Space Grotesk (display / headings) +
 * JetBrains Mono (eyebrow / meta) + Inter (body copy) — matching every
 * other section on the site. Load via `next/font/google` in your root
 * layout for production; system fallbacks are included so it renders
 * correctly as-is.
 */

const PAPER = "#FAFAF8";
const INK = "#14141C";
const INK_SOFT = "#5B5B68";
const INK_FAINT = "#8B8B96";
const LINE = "rgba(20,20,28,0.10)";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO =
  "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

const COURSE_LINKS = [
  { label: "Salesforce", href: "/salesforce-training/" },
  { label: "Marketing Cloud", href: "/marketing-cloud/" },
  { label: "Salesforce + LWC", href: "/salesforce-lwc/" },
  { label: "Sales Cloud", href: "/sales-cloud/" },
  { label: "Data Cloud", href: "/data-cloud/" },
  { label: "AgentForce", href: "/agentforce/" },
];

const COMPANY_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us/" },
  { label: "Internship", href: "/internship/" },
  { label: "Projects", href: "/projects/" },
  { label: "Contact", href: "/contact-us/" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Terms of Service", href: "/terms/" },
];

type SocialIcon = "linkedin" | "instagram" | "twitter" | "youtube";

const SOCIALS: { icon: SocialIcon; href: string; label: string }[] = [
  { icon: "linkedin", href: "https://linkedin.com", label: "LinkedIn" },
  { icon: "instagram", href: "https://instagram.com", label: "Instagram" },
  { icon: "twitter", href: "https://twitter.com", label: "Twitter" },
  { icon: "youtube", href: "https://youtube.com", label: "YouTube" },
];

function SocialGlyph({ icon, color }: { icon: SocialIcon; color: string }) {
  const common = {
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  switch (icon) {
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <rect x="3" y="3" width="18" height="18" rx="3" {...common} />
          <path
            d="M8 10.5v6M8 7.5v.01M12 16.5v-3.7c0-1.5 1-2.3 2.2-2.3s2.3.8 2.3 2.3v3.7M12 12.8v3.7"
            {...common}
          />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <rect x="3" y="3" width="18" height="18" rx="5" {...common} />
          <circle cx="12" cy="12" r="4" {...common} />
          <circle cx="17.2" cy="6.8" r="1" fill={color} stroke="none" />
        </svg>
      );
    case "twitter":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path
            d="M20 5.5c-.7.4-1.5.7-2.3.8a3.9 3.9 0 0 0 1.7-2.2 8 8 0 0 1-2.5 1 4 4 0 0 0-6.8 3.6A11.3 11.3 0 0 1 2 4.8a4 4 0 0 0 1.2 5.3 3.9 3.9 0 0 1-1.8-.5v.05a4 4 0 0 0 3.2 3.9 4 4 0 0 1-1.8.07 4 4 0 0 0 3.7 2.8A8 8 0 0 1 1 18.4a11.3 11.3 0 0 0 6.1 1.8c7.3 0 11.3-6.1 11.3-11.3v-.5c.8-.6 1.4-1.3 1.9-2.1z"
            {...common}
          />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <rect x="3" y="6" width="18" height="12" rx="3" {...common} />
          <path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill={color} stroke="none" />
        </svg>
      );
  }
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        className="text-[11.5px] font-semibold uppercase tracking-wide"
        style={{ fontFamily: FONT_MONO, color: INK_FAINT }}
      >
        {title}
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13.5px] transition-colors duration-200"
              style={{ color: INK_SOFT }}
              onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScrollToTopButton() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 14,
      scale: visible ? 1 : 0.85,
      duration: 0.35,
      ease: "power3.out",
      pointerEvents: visible ? "auto" : "none",
    });
  }, [visible]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className="fixed bottom-7 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full shadow-lg opacity-0 sm:bottom-8 sm:right-8"
      style={{
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
        boxShadow: "0 8px 24px rgba(91,79,224,0.35)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-2px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const colRefs = useRef<Array<HTMLDivElement | null>>([]);
  const meshOuterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const meshInnerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const shapeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      colRefs.current.forEach((col, i) => {
        if (!col) return;
        ScrollTrigger.create({
          trigger: footerRef.current,
          start: "top 88%",
          end: "bottom 20%",
          onEnter: () =>
            gsap.fromTo(
              col,
              { y: 18 },
              { y: 0, duration: 0.5, delay: i * 0.05, ease: "power3.out" },
            ),
          onEnterBack: () =>
            gsap.fromTo(
              col,
              { y: -18 },
              { y: 0, duration: 0.5, ease: "power3.out" },
            ),
        });
      });

      // Background: ambient blob drift (inner) + independent scroll parallax
      // (outer wrapper) — split so the motions never fight each other.
      meshInnerRefs.current.forEach((blob, i) => {
        if (!blob) return;
        gsap.to(blob, {
          x: i % 2 === 0 ? 30 : -26,
          y: i % 2 === 0 ? -20 : 24,
          scale: 1.12,
          duration: 7 + i * 1.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
      meshOuterRefs.current.forEach((wrapper, i) => {
        if (!wrapper) return;
        gsap.to(wrapper, {
          yPercent: i % 2 === 0 ? 18 : -14,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1 + i * 0.3,
          },
        });
      });

      // Background: small floating shapes, continuous rotation + bob
      shapeRefs.current.forEach((shape, i) => {
        if (!shape) return;
        gsap.to(shape, {
          rotate: i % 2 === 0 ? 360 : -360,
          duration: 26 + i * 6,
          repeat: -1,
          ease: "none",
        });
        gsap.to(shape, {
          y: -10,
          duration: 3.4 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      // Background: dot grid gently pans with scroll. Always fully visible —
      // only its position animates, never opacity, so it can't get stuck
      // invisible if the scroll trigger hasn't fired yet on load.
      if (gridRef.current) {
        gsap.to(gridRef.current, {
          backgroundPosition: "32px 32px",
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "top 40%",
            scrub: 1,
          },
        });
      }

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const t = setTimeout(refresh, 300);
      return () => {
        window.removeEventListener("load", refresh);
        clearTimeout(t);
      };
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ background: PAPER, fontFamily: FONT_BODY, color: INK }}
    >
      {/* Top divider — separates the footer from whatever section sits above it */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${ACCENT}55, ${ACCENT_SOFT}55, transparent)`,
        }}
      />
      {/* Animated background layer */}
      <div className="pointer-events-none absolute inset-0">
        <div
          ref={gridRef}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${INK}1f 1.3px, transparent 1.3px)`,
            backgroundSize: "24px 24px",
            opacity: 1,
            maskImage:
              "radial-gradient(ellipse 60% 70% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 70% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        <div
          ref={(el) => {
            meshOuterRefs.current[0] = el;
          }}
          className="absolute -right-24 -top-16 h-[380px] w-[380px]"
        >
          <div
            ref={(el) => {
              meshInnerRefs.current[0] = el;
            }}
            className="h-full w-full rounded-full opacity-[0.22] blur-[90px]"
            style={{
              background: `radial-gradient(circle, ${ACCENT}, transparent 70%)`,
            }}
          />
        </div>
        <div
          ref={(el) => {
            meshOuterRefs.current[1] = el;
          }}
          className="absolute -left-16 bottom-[-70px] h-[320px] w-[320px]"
        >
          <div
            ref={(el) => {
              meshInnerRefs.current[1] = el;
            }}
            className="h-full w-full rounded-full opacity-[0.18] blur-[80px]"
            style={{
              background: `radial-gradient(circle, ${ACCENT_SOFT}, transparent 70%)`,
            }}
          />
        </div>

        <div
          ref={(el) => {
            shapeRefs.current[0] = el;
          }}
          className="absolute left-[8%] top-[16%] h-9 w-9 rounded-lg border-2"
          style={{ borderColor: `${ACCENT}55` }}
        />
        <div
          ref={(el) => {
            shapeRefs.current[1] = el;
          }}
          className="absolute right-[14%] top-[40%] h-5 w-5 rounded-full border-2"
          style={{ borderColor: `${ACCENT_SOFT}65` }}
        />
        <div
          ref={(el) => {
            shapeRefs.current[2] = el;
          }}
          className="absolute right-[30%] top-[10%] h-2.5 w-2.5 rounded-full"
          style={{ background: `${ACCENT_DEEP}70` }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand + newsletter */}
          <div
            ref={(el) => {
              colRefs.current[0] = el;
            }}
          >
            <Image
              src="/ceptra-infotech-icon.png"
              alt="Ceptra Infotech"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
            <p
              className="mt-4 max-w-xs text-[13.5px] leading-6"
              style={{ color: INK_SOFT }}
            >
              Live, mentor-led training in Salesforce, Marketing Cloud and
              modern web skills — built for real outcomes, not just
              certificates.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-6 flex max-w-xs gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full rounded-full border bg-white px-4 py-2.5 text-[13px] outline-none placeholder:text-black/30"
                style={{ borderColor: LINE, color: INK }}
              />
              <button
                type="submit"
                className="shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white transition-transform duration-200 hover:scale-[1.04]"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`,
                }}
              >
                {subscribed ? "✓" : "Join"}
              </button>
            </form>
            {subscribed && (
              <p className="mt-2 text-[12px]" style={{ color: ACCENT_DEEP }}>
                {`You're on the list — welcome aboard.`}
              </p>
            )}
          </div>

          <div
            ref={(el) => {
              colRefs.current[1] = el;
            }}
          >
            <FooterColumn title="Courses" links={COURSE_LINKS} />
          </div>
          <div
            ref={(el) => {
              colRefs.current[2] = el;
            }}
          >
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </div>

          {/* Contact + socials */}
          <div
            ref={(el) => {
              colRefs.current[3] = el;
            }}
          >
            <div
              className="text-[11.5px] font-semibold uppercase tracking-wide"
              style={{ fontFamily: FONT_MONO, color: INK_FAINT }}
            >
              Get in touch
            </div>
            <ul
              className="mt-4 flex flex-col gap-3 text-[13.5px]"
              style={{ color: INK_SOFT }}
            >
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Ceptra+Infotech+Pvt+Ltd+RH+22+Vyanktesh+Nagar+Nandanvan+Nagpur+Maharashtra+440009"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 leading-5 transition-colors duration-200"
                  onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    fill="none"
                  >
                    <path
                      d="M8 14.5s5-4.2 5-8a5 5 0 1 0-10 0c0 3.8 5 8 5 8z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="8"
                      cy="6.5"
                      r="1.8"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                  <span>
                    In Front of KDK College of Engineering Darshan Colony
                    <br />
                    Main Road, Nagpur, Maharashtra 440024
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+918806600044"
                  className="flex items-center gap-2 transition-colors duration-200"
                  onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 shrink-0"
                    fill="none"
                  >
                    <path
                      d="M3 2.5h2.5l1 3-1.5 1a8 8 0 0 0 4.5 4.5l1-1.5 3 1V13c0 .8-.7 1.5-1.5 1.4C7 14 2 9 1.6 4.5 1.5 3.7 2.2 3 3 3v-.5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  +91-88066 00044
                </a>
              </li>
              <li>
                <a
                  href="tel:+917276782674"
                  className="flex items-center gap-2 transition-colors duration-200"
                  onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 shrink-0"
                    fill="none"
                  >
                    <path
                      d="M3 2.5h2.5l1 3-1.5 1a8 8 0 0 0 4.5 4.5l1-1.5 3 1V13c0 .8-.7 1.5-1.5 1.4C7 14 2 9 1.6 4.5 1.5 3.7 2.2 3 3 3v-.5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  +91-72767 82674
                </a>
              </li>
              <li>
                <a
                  href="mailto:ceptrainfotech@gmail.com"
                  className="flex items-center gap-2 transition-colors duration-200"
                  onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5 shrink-0"
                    fill="none"
                  >
                    <rect
                      x="1.5"
                      y="3"
                      width="13"
                      height="10"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M2 4l6 5 6-5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  ceptrainfotech@gmail.com
                </a>
              </li>
              <li
                className="flex items-start gap-2 pt-1"
                style={{ color: INK_FAINT }}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M8 4.5V8l2.5 1.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[12.5px] leading-5">
                  Mon – Sat: 10:00 am – 7:00 pm
                  <br />
                  Sunday: Closed
                </span>
              </li>
            </ul>

            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-9 w-9 items-center justify-center rounded-full border bg-white transition-colors duration-200"
                  style={{ borderColor: LINE }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`;
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.borderColor = LINE;
                  }}
                >
                  <span className="text-current [&_svg_*]:transition-colors [&_svg_*]:duration-200">
                    <SocialGlyph icon={social.icon} color={INK_SOFT} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-6 text-[12px] sm:flex-row"
          style={{ borderColor: LINE, color: INK_FAINT }}
        >
          <span>
            © {new Date().getFullYear()} Ceptra Infotech. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = INK_FAINT)}
              >
                {link.label}
              </Link>
            ))}
            <span
              className="hidden h-3 w-px sm:block"
              style={{ background: LINE }}
            />
            <span>
              Built by{" "}
              <a
                href="#"
                className="font-medium transition-colors duration-200"
                style={{ color: INK_SOFT }}
                onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                onMouseLeave={(e) => (e.currentTarget.style.color = INK_SOFT)}
              >
                SoftTechCloud
              </a>
            </span>
          </div>
        </div>
      </div>

      <ScrollToTopButton />
    </footer>
  );
}
