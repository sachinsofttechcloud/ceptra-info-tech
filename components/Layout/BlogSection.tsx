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

import Link from "next/link";
import { BLOG_POSTS, CATEGORIES, type BlogPost } from "@/app/more/blogs/blogData";

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/more/blogs/${post.slug}`}
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
    </Link>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState("All");

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

  /* ---------------- ONE-TIME REVEALS: hero, featured, cta ---------------- */
  useEffect(() => {
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
  }, []);

  /* ---------------- GRID REVEAL: replays whenever the filter changes ---------------- */
  useEffect(() => {
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
  }, [activeCategory]);

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
            <Link
              href={`/more/blogs/${featuredPost.slug}`}
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
            </Link>
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
                <BlogCard key={post.slug} post={post} />
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