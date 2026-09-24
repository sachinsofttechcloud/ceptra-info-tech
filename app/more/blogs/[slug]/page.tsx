import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { BLOG_POSTS, getBlogPostBySlug } from "../blogData";

const FONT_DISPLAY =
  "'Space Grotesk', var(--font-display, 'Space Grotesk'), system-ui, sans-serif";
const ACCENT = "#5B4FE0";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Ceptra Infotech",
    };
  }

  const url = `https://ceptrainfotech.com/more/blogs/${post.slug}`;

  return {
    title: `${post.title} | Ceptra Infotech Blog`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Top Banner & Navigation */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/more/blogs"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-[#5B4FE0] hover:text-[#5B4FE0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Articles
          </Link>
          <span className="text-xs font-medium text-slate-400">
            Ceptra Infotech Blog
          </span>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Article Category & Meta info */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}
          >
            {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            Published: {post.date}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Article Title */}
        <h1
          className="mb-6 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {post.title}
        </h1>

        {/* Author Info Bar */}
        <div className="mb-8 flex items-center justify-between border-y border-slate-100 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B4FE0]/10 text-[#5B4FE0]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{post.author}</p>
              <p className="text-xs text-slate-500">Ceptra Infotech Author</p>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-100 shadow-xl">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-slate max-w-none space-y-6 text-base leading-8 text-slate-700 sm:text-lg sm:leading-9">
          {post.content.map((paragraph, index) => (
            <p key={index} className="text-slate-700 font-normal">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Back Link CTA */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
          <Link
            href="/more/blogs"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5B4FE0] px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-[#4a3ec8] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore More Articles
          </Link>
        </div>
      </article>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2
              className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/more/blogs/${related.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={related.image}
                      alt={related.title}
                      fill
                      sizes="300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-2 text-[10px] font-bold uppercase text-[#5B4FE0]">
                      {related.category}
                    </span>
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-[#5B4FE0]">
                      {related.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
