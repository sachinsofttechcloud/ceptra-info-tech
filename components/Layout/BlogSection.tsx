"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, Clock, ArrowRight, Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const FONT_BODY = "'Inter', var(--font-body, 'Inter'), system-ui, sans-serif";

const ACCENT = "#5B4FE0";
const ACCENT_SOFT = "#8A7DFF";

/* ============================================================
   DATA
============================================================ */

const CATEGORIES = [
  "All",
  "Salesforce",
  "Digital Marketing",
  "Web Development",
  "Career Tips",
  "Placement",
];

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  content: string[]; // full article body, one paragraph per entry
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: "salesforce-career-2026",
    title: "Why Salesforce Is Still the Smartest Career Bet in 2026",
    excerpt:
      "The CRM market keeps growing and so does demand for skilled admins and developers. Here's what makes Salesforce careers resilient and how to break in without prior experience.",
    category: "Salesforce",
    date: "Aug 12, 2026",
    readTime: "6 min read",
    image: "/blogs/still-sales-force.webp",
    featured: true,
    content: [
      "The CRM market has grown every single year for over a decade, and Salesforce continues to hold the largest share of it. That growth translates directly into demand for people who can configure, customize, and build on the platform a demand that has consistently outpaced the supply of trained professionals.",
      "What makes a Salesforce career different from most other tech paths is the breadth of entry points. You don't need a computer science degree to start as an Administrator, and once you're in, the platform's own certification ladder gives you a clear, structured way to specialize whether that's development, marketing automation, or industry specific clouds.",
      "At Ceptra Infotech, we see this pattern play out every cohort: students with no prior IT background go from zero to job ready in a matter of months, because the learning curve is steep but well mapped. The real differentiator isn't raw coding ability it's hands on project experience, which is exactly what a structured internship is built to provide.",
      "If you're weighing Salesforce against other tech careers, the honest pitch is this: it's one of the few paths where a beginner-friendly entry point coexists with genuinely high, long-term earning potential.",
    ],
  },
  {
    slug: "lwc-vs-aura",
    title: "Lightning Web Components vs Aura: What Beginners Should Learn First",
    excerpt:
      "LWC is the modern standard, but Aura still runs in production everywhere. We break down what to prioritize as a new Salesforce developer.",
    category: "Salesforce",
    date: "Aug 5, 2026",
    readTime: "5 min read",
    image: "/blogs/11.webp",
    content: [
      "Lightning Web Components (LWC) is Salesforce's modern, standards based framework built on native Web Components rather than a proprietary abstraction. It's faster, easier to test, and it's what Salesforce recommends for all new development going forward.",
      "Aura, on the other hand, predates LWC and still powers a huge amount of production code across existing Salesforce orgs. You won't necessarily write new Aura components, but you will absolutely encounter it in legacy components, in Aura LWC interop scenarios, and in maintenance work.",
      "Our recommendation for beginners: learn LWC first and learn it deeply, since it's what you'll be building with day to day. But don't skip Aura entirely a working knowledge of how it structures components, handles events, and communicates with Apex will make you far more effective the moment you touch an existing org.",
    ],
  },
  {
    slug: "seo-vs-sem-beginners",
    title: "SEO vs SEM: What Every Digital Marketing Intern Should Know",
    excerpt:
      "They're often confused, but they solve different problems. A practical breakdown for anyone starting out in digital marketing.",
    category: "Digital Marketing",
    date: "Jul 29, 2026",
    readTime: "4 min read",
    image: "/blogs/2.webp",
    content: [
      "SEO (Search Engine Optimization) is about earning visibility organically through content, site structure, and technical health with results that compound over months. SEM (Search Engine Marketing) is about buying visibility directly, typically through Google Ads, with results that appear the moment your campaign goes live and disappear the moment your budget runs out.",
      "New interns often treat these as competing skills. In practice, the strongest marketers use them together: SEM to generate quick data on which keywords and messaging actually convert, and SEO to build durable, long term traffic around what that data proves works.",
      "If you're just starting out, get comfortable with the fundamentals of both before specializing most junior digital marketing roles expect at least working familiarity with each.",
    ],
  },
  {
    slug: "portfolio-website-2026",
    title: "Building a Portfolio Website That Actually Gets You Hired",
    excerpt:
      "Most student portfolios look the same. Here's how to structure yours so recruiters actually remember it.",
    category: "Web Development",
    date: "Jul 22, 2026",
    readTime: "7 min read",
    image: "/blogs/3.webp",
    content: [
      "The average student portfolio is a template with a headshot, a list of skills, and three unfinished-looking projects. It's forgettable because it looks like every other portfolio a recruiter has scrolled past that week.",
      "What actually works: fewer projects, shown in more depth. Pick two or three pieces of work and, for each one, explain the problem you were solving, the decisions you made, and what you'd do differently now. That context is what separates a real developer from someone who followed a tutorial.",
      "Finally, make sure the portfolio itself is a demonstration of your skills clean code, fast load times, and thoughtful UX. Recruiters notice when the site they're evaluating you on is itself well-built.",
    ],
  },
  {
    slug: "resume-tips-freshers",
    title: "5 Resume Mistakes Costing Freshers Their First Interview",
    excerpt:
      "Recruiters spend seconds on a resume before deciding. These are the fixable mistakes we see most often at placement drives.",
    category: "Career Tips",
    date: "Jul 15, 2026",
    readTime: "5 min read",
    image: "/blogs/4.webp",
    content: [
      "1. Listing responsibilities instead of outcomes. 'Worked on customer records module' says nothing. 'Built a customer records module that reduced manual data entry by 40%' says everything.",
      "2. Burying your strongest project. Recruiters scan top to bottom your best work should be the first thing they see, not the last.",
      "3. Generic objective statements. 'Seeking a challenging role to utilize my skills' wastes prime resume real estate that could instead show a specific, relevant achievement.",
      "4. No quantifiable detail anywhere. Numbers percentages, timeframes, team sizes make claims verifiable and memorable.",
      "5. One resume for every application. A resume tailored to the specific role, even with small changes, consistently outperforms a one-size-fits-all version.",
    ],
  },
  {
    slug: "mock-interview-guide",
    title: "How Mock Interviews Actually Improve Your Chances",
    excerpt:
      "It's not just practice it's about learning to think out loud. Here's how we run mock interviews at Ceptra and why it works.",
    category: "Placement",
    date: "Jul 8, 2026",
    readTime: "4 min read",
    image: "/blogs/5.webp",
    content: [
      "The most common reason candidates freeze in real interviews isn't lack of knowledge it's lack of practice articulating that knowledge under pressure. Mock interviews close exactly that gap.",
      "At Ceptra, our mock interviews are run by mentors who've actually sat on hiring panels, not just fellow students. That matters the feedback you get is calibrated to what real interviewers are actually listening for.",
      "The single biggest improvement we see across repeat mock sessions isn't technical knowledge it's candidates learning to narrate their thinking instead of jumping straight to an answer. That habit alone changes how interviewers perceive your competence.",
    ],
  },
  {
    slug: "google-ads-for-beginners",
    title: "Google Ads for Beginners: Your First Campaign, Step by Step",
    excerpt:
      "From keyword research to your first live campaign a walkthrough built for students, not agencies.",
    category: "Digital Marketing",
    date: "Jun 30, 2026",
    readTime: "8 min read",
    image: "/blogs/6.webp",
    content: [
      "Before opening Google Ads, do your keyword research. Understanding what your audience is actually searching for and how competitive those terms are should shape your campaign, not come as an afterthought once it's live.",
      "Start with a single, narrow campaign rather than trying to cover every product or service at once. A focused campaign is easier to measure, easier to optimize, and gives you cleaner data to learn from.",
      "Set a modest daily budget for your first two weeks and treat that period as a learning phase, not a results phase. Your early data click-through rate, cost per click, conversion rate is what tells you whether to scale up or rework your approach.",
    ],
  },
];

/* ============================================================
   SMALL BUILDING BLOCKS
============================================================ */

function Kicker({ text }: { text: string }) {
  return (
    <span className="fade-heading mb-3 inline-flex rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
      {text}
    </span>
  );
}

function CategoryTag({ category }: { category: string }) {
  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `${ACCENT}12`, color: ACCENT }}
    >
      {category}
    </span>
  );
}

function BlogCard({
  post,
  onOpen,
}: {
  post: BlogPost;
  onOpen: (post: BlogPost) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="blog-card group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">
          <CategoryTag category={post.category} />
        </div>
        <h3
          className="mb-2 text-base font-bold leading-snug text-slate-900 sm:text-lg"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {post.title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-6 text-slate-500">{post.excerpt}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   BLOG DETAIL VIEW — replaces the list when a post is selected.
   No routing: this is a plain conditional render inside the
   same component.
============================================================ */

function BlogDetail({
  post,
  onBack,
}: {
  post: BlogPost;
  onBack: () => void;
}) {
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".fade-heading, .fade-text", detailRef.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            delay: i * 0.08,
          },
        );
      });

      const cover = detailRef.current?.querySelector(".detail-cover");
      if (cover) {
        gsap.fromTo(
          cover,
          { opacity: 0, y: 20, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", delay: 0.1 },
        );
      }
    }, detailRef);

    return () => ctx.revert();
  }, [post]);

  return (
    <div ref={detailRef} className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* ================= BACK BUTTON — top left ================= */}
      <button
        type="button"
        onClick={onBack}
        className="fade-heading mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </button>

      <div className="fade-heading mb-4 flex items-center gap-3">
        <CategoryTag category={post.category} />
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {post.date}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {post.readTime}
        </span>
      </div>

      <h1
        className="fade-heading mb-6 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl"
        style={{ fontFamily: FONT_DISPLAY }}
      >
        {post.title}
      </h1>

      <div className="detail-cover relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-violet-100 shadow-[0_20px_60px_rgba(91,79,224,0.12)]">
        <Image src={post.image} alt={post.title} fill sizes="100vw" className="object-cover" priority />
      </div>

      <div className="space-y-5">
        {post.content.map((para, i) => (
          <p key={i} className="fade-text text-base leading-8 text-slate-600">
            {para}
          </p>
        ))}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="fade-heading mt-10 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
        style={{ backgroundColor: ACCENT }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Articles
      </button>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const featuredPost = BLOG_POSTS.find((p) => p.featured);
  const filteredPosts = BLOG_POSTS.filter(
    (p) => !p.featured && (activeCategory === "All" || p.category === activeCategory),
  );

  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closePost = () => {
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- ONE-TIME REVEALS: hero, featured, cta (list view only) ---------------- */
  useEffect(() => {
    if (selectedPost) return; // detail view handles its own animation

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".fade-heading, .fade-text", heroRef.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: i * 0.12,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      });

      if (featuredRef.current) {
        gsap.fromTo(
          featuredRef.current,
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: featuredRef.current,
              start: "top 85%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 88%",
              toggleActions: "play reverse play reverse",
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [selectedPost]);

  /* ---------------- GRID REVEAL: replays whenever the filter changes ---------------- */
  useEffect(() => {
    if (selectedPost) return;

    const cards = gsap.utils.toArray<HTMLElement>(".blog-card", gridRef.current);
    cards.forEach((el, i) => {
      const fromLeft = i % 2 === 0;
      gsap.fromTo(
        el,
        { opacity: 0, x: fromLeft ? -36 : 36, y: 12 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          delay: (i % 6) * 0.06,
        },
      );
    });
  }, [activeCategory, selectedPost]);

  /* ---------------- DETAIL VIEW ---------------- */
  if (selectedPost) {
    return (
      <main style={{ fontFamily: FONT_BODY }}>
        <section className="relative overflow-hidden bg-white">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet-50/60 blur-3xl" />
          <BlogDetail post={selectedPost} onBack={closePost} />
        </section>
      </main>
    );
  }

  /* ---------------- LIST VIEW ---------------- */
  return (
    <main style={{ fontFamily: FONT_BODY }}>
      <section ref={sectionRef} className="relative overflow-hidden bg-white">
        {/* Ambient background blobs */}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-violet-50/60 blur-3xl" />


        {/* ================= HERO ================= */}
        <div className="relative mx-auto max-w-6xl px-4 pb-10 sm:px-6 pt-16 text-left sm:pt-20">
          <div ref={heroRef}>
            <Kicker text="Ceptra Infotech Blog" />
            <h1
              className="fade-heading mb-4 text-[30px] max-w-2xl  font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-[42px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Insights, Tips & Updates for Your Career in Tech
            </h1>
            <p className="fade-text text-sm max-w-3xl leading-6 text-slate-500 sm:text-base">
              Practical guides on Salesforce, digital marketing, web development, and career
              growth written by trainers and mentors who work with students every day.
            </p>
          </div>

          {/* Search (visual only — wire up to real search when ready) */}
          {/* <div className="fade-text mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div> */}
        </div>

        {/* ================= FEATURED POST ================= */}
        {featuredPost && (
          <div className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => openPost(featuredPost)}
              ref={featuredRef as never}
              className="group grid w-full overflow-hidden rounded-3xl border border-violet-100 bg-white text-left shadow-[0_24px_70px_rgba(91,79,224,0.1)] md:grid-cols-2"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10">
                {/* <div className="mb-4 flex items-center gap-3">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Featured
                  </span>
                  <CategoryTag category={featuredPost.category} />
                </div> */}
                <h2
                  className="mb-3 text-xl font-bold leading-tight text-slate-900 sm:text-2xl lg:text-[28px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {featuredPost.title}
                </h2>
                <p className="mb-5 text-sm leading-6 text-slate-500 sm:text-[15px]">
                  {featuredPost.excerpt}
                </p>
                <div className="mb-6 flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <span
                  className="inline-flex w-fit items-center gap-2 text-sm font-bold"
                  style={{ color: ACCENT }}
                >
                  Read the full article
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ================= CATEGORY FILTER ================= */}
        <div className="relative mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200"
                  style={
                    active
                      ? { backgroundColor: ACCENT, borderColor: ACCENT, color: "white" }
                      : { backgroundColor: "white", borderColor: "#e5e5e5", color: "#475569" }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= BLOG GRID ================= */}
        <div ref={gridRef} className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <BlogCard key={post.slug} post={post} onOpen={openPost} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate-400">
              No articles in this category yet — check back soon.
            </p>
          )}
        </div>

        {/* ================= NEWSLETTER CTA ================= */}
        <div className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
          <div
            ref={ctaRef}
            className="overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16"
            style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_SOFT} 100%)` }}
          >
            <h2
              className="mx-auto mb-3 max-w-lg text-2xl font-bold leading-tight text-white sm:text-3xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Get new articles in your inbox
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-white/85">
              One email a month practical tips on Salesforce, digital marketing, and landing
              your first tech role. No spam.
            </p>
            <button
              onClick={() => router.push("/contact-us")}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
              style={{ color: ACCENT }}
            >
              Subscribe
              <ArrowRight className="h-4 w-4" style={{ color: ACCENT }} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}