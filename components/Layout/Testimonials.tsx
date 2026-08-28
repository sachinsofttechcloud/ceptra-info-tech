"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Font note: authored around Space Grotesk (display) + JetBrains Mono
 * (role labels) + Inter (body copy) — matching the rest of the site.
 * Load via `next/font/google` in your root layout for production; system
 * fallbacks are included so it renders correctly as-is.
 *
 * Avatar note: images below use pravatar.cc placeholders (free, no auth) —
 * swap `avatar` in TESTIMONIALS for real student photos before shipping.
 */

const PAPER = "#FAFAF8";
const INK = "#14141C";
const INK_SOFT = "#5B5B68";
const LINE = "rgba(20,20,28,0.09)";
const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";
const ACCENT_DEEP = "#3E2FBF";

const FONT_DISPLAY = "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_MONO = "'JetBrains Mono', var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

const AUTOPLAY_MS = 4500;
const CARDS_PER_PAGE = 3;

type Testimonial = {
  quoteBefore: string;
  highlight: string;
  quoteAfter: string;
  name: string;
  role: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quoteBefore: "Joined Collabera as an SFMC Developer today. Mock interviews me real confidence to succeed. Thank you so much for all the learning.",
    highlight: "well-structured.",
    quoteAfter: "",
    name: "Pratik Kukade",
    role: "SFMC Developer",
    avatar: "/home/pratik.webp",
  },
  {
    quoteBefore: "Got two offers, IQuestBee and K Cloud Technologies. Daily interviews build my confidence, never missed one. Special thanks to Sarita ma'am",
    highlight: "simple way.",
    quoteAfter: " Highly recommended!",
    name: "Rakhi Chaudhari",
    role: "Associate Saleforce Developer",
    avatar: "/home/rakhi.webp",
  },
  {
    quoteBefore: "Selected as Associate Engineer at Nagarro company. Your guidance and daily interviews made us confident. Thank you so much ma'am, you are the best.",
    highlight: "next level.",
    quoteAfter: "",
    name: "Pravin Badane",
    role: "Associate Engineer @ Nagarro",
    avatar: "/home/pravin.webp",
  },
  {
    quoteBefore: "Got two offer before even completing graduation. Daily interviews boosted my confidence and communication skills. You almost gave me a whole new life.",
    highlight: "rare to find.",
    quoteAfter: "",
    name: "Akshara Parate",
    role: "Trainee Software Developer, Mumbai",
    avatar: "/home/akshara.webp",
  },
  {
    quoteBefore: "I am excited to share that I have secured a placment at IBM after stepping out of my comfort zone. I want to sincerely thank you for your constant support and guidence which played a key role in this achievement. Thank you once again Sarita ma'am, Nehal & ceptra team for being an incredible mentor and inspiration.",
    highlight: "just a few months.",
    quoteAfter: "",
    name: "Jasbir Kaur Virdi",
    role: "Saleforce Developer",
    avatar: "/home/jasbir.webp",
  },
  {
    quoteBefore: "Ma'am i got selected in scadea solution, hyderabad. Thank you so much it is possible just because of your guidence and daily interviews that really help me to build my confidence. I would like to thanks all the ceptra team.",
    highlight: "name, not just my ID.",
    quoteAfter: "",
    name: "Shreya Meshram",
    role: "LWC Developer",
    avatar: "/home/shreya.webp",
  },
  {
    quoteBefore: "Finally cream came true this is only and only because of you. I remember that day last year on my birthday you had told you will have dream job and will complete all your dream. So this is first step of it. Before bdy i had done this gift to my parents. Thanks you ma'am",
    highlight: "three interviews in a week.",
    quoteAfter: "",
    name: "Rohini",
    role: "Marketing Cloud Specialist",
    avatar: "/home/rohini.webp",
  },
  {
    quoteBefore: "YOur Motivation helped me to overcome my fears. You belived in mme and helped me to push my limits and come forward and prove myself. The way you speak is truly amazing and motivated not only me but my parents to belive in me",
    highlight: "recorded courses",
    quoteAfter: " I'd tried before.",
    name: "Vinita Naryani",
    role: "SalesForce Developer",
    avatar: "/home/vinita.webp",
  },
  {
    quoteBefore: "Hello mam got selected at Kaseya. Thank you so much for for Motivation My offer letter comes before my degree that's only possible because you and your guidance. Thanks to you and all the ceptra team.",
    highlight: "clear, buildable path.",
    quoteAfter: "",
    name: "Chaitali Sakore",
    role: "AI Solutions Trainee",
    avatar: "/home/chaitali.webp",
  },
];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const PAGES = chunk(TESTIMONIALS, CARDS_PER_PAGE);

function QuoteMark() {
  return (
    <svg viewBox="0 0 32 24" className="h-6 w-8" fill={ACCENT}>
      <path d="M0 24V14.4C0 6.4 4.8 1.2 12.8 0l1.6 4C9.2 5.2 6.8 8 6.4 12H12v12H0zm18.4 0V14.4c0-8 4.8-13.2 12.8-14.4l1.6 4c-5.2 1.2-7.6 4-8 8h5.6v12H18.4z" />
    </svg>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToPage = (i: number) => {
    const next = ((i % PAGES.length) + PAGES.length) % PAGES.length;
    pageRef.current = next;
    setPage(next);
    gsap.to(trackRef.current, { xPercent: -next * 100, duration: 0.7, ease: "power3.inOut" });
  };

  const startAutoplay = () => {
    stopAutoplay();
    timerRef.current = setInterval(() => {
      goToPage(pageRef.current + 1);
    }, AUTOPLAY_MS);
  };
  const stopAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Direction-aware header reveal — position only, never opacity.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 15%",
        onEnter: () => gsap.fromTo(headingRef.current, { y: 20 }, { y: 0, duration: 0.55, ease: "power3.out" }),
        onEnterBack: () => gsap.fromTo(headingRef.current, { y: -20 }, { y: 0, duration: 0.55, ease: "power3.out" }),
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      const t = setTimeout(refresh, 300);
      return () => {
        window.removeEventListener("load", refresh);
        clearTimeout(t);
      };
    }, sectionRef);

    startAutoplay();
    return () => {
      ctx.revert();
      stopAutoplay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24" style={{ background: PAPER, fontFamily: FONT_BODY, color: INK }}>
      <div className="mx-auto w-full max-w-6xl px-6">
        {/* Header */}
        <div ref={headingRef} className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <h2 className="text-[26px] font-medium tracking-tight sm:text-[32px]" style={{ fontFamily: FONT_DISPLAY }}>
              What Students Say
            </h2>
            <svg viewBox="0 0 60 12" className="hidden h-3 w-14 sm:block" fill="none">
              <path
                d="M1 6c4-6 8-6 12 0s8 6 12 0 8-6 12 0 8 6 12 0"
                stroke={ACCENT}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Slider */}
        <div
          className="relative mt-12 overflow-hidden"
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
        >
          <div ref={trackRef} className="flex">
            {PAGES.map((group, pageIndex) => (
              <div key={pageIndex} className="grid w-full shrink-0 grid-cols-1 gap-5 sm:grid-cols-3">
                {group.map((t) => (
                  <div
                    key={t.name}
                    className="flex flex-col rounded-2xl border p-6"
                    style={{ borderColor: LINE, background: "white" }}
                  >
                    <QuoteMark />
                    <p className="mt-4 flex-1 text-[13.5px] leading-6" style={{ color: INK_SOFT }}>
                      {t.quoteBefore}
                      <span style={{ color: ACCENT_DEEP, fontWeight: 600 }}>{t.highlight}</span>
                      {t.quoteAfter}
                    </p>

                    <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: LINE }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <div className="text-[13.5px] font-semibold">{t.name}</div>
                        <div className="text-[11.5px]" style={{ fontFamily: FONT_MONO, color: INK_SOFT }}>
                          {t.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {PAGES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial page ${i + 1}`}
              onClick={() => {
                goToPage(i);
                startAutoplay();
              }}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: page === i ? 20 : 8,
                background: page === i ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT_SOFT})` : LINE,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}