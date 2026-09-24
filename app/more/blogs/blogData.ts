export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  author: string;
  featured?: boolean;
  content: string[];
}

export const CATEGORIES = [
  "All",
  "Salesforce",
  "Digital Marketing",
  "Web Development",
  "Career Tips",
  "Placement",
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "salesforce-career-2026",
    title: "Why Salesforce Is Still the Smartest Career Bet in 2026",
    excerpt:
      "The CRM market keeps growing and so does demand for skilled admins and developers. Here's what makes Salesforce careers resilient and how to break in without prior experience.",
    category: "Salesforce",
    date: "Aug 12, 2026",
    readTime: "6 min read",
    author: "Chandan Sakure",
    image: "/blogs/still-sales-force.webp",
    featured: true,
    content: [
      "The CRM market has grown every single year for over a decade, and Salesforce continues to hold the largest share of it. That growth translates directly into demand for people who can configure, customize, and build on the platform — a demand that has consistently outpaced the supply of trained professionals.",
      "What makes a Salesforce career different from most other tech paths is the breadth of entry points. You don't need a computer science degree to start as an Administrator, and once you're in, the platform's own certification ladder gives you a clear, structured way to specialize whether that's development, marketing automation, or industry specific clouds.",
      "At Ceptra Infotech, we see this pattern play out every cohort: students with no prior IT background go from zero to job ready in a matter of months, because the learning curve is steep but well mapped. The real differentiator isn't raw coding ability — it's hands on project experience, which is exactly what a structured internship is built to provide.",
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
    author: "Ceptra Technical Team",
    image: "/blogs/11.webp",
    content: [
      "Lightning Web Components (LWC) is Salesforce's modern, standards-based framework built on native Web Components rather than a proprietary abstraction. It's faster, easier to test, and it's what Salesforce recommends for all new development going forward.",
      "Aura, on the other hand, predates LWC and still powers a huge amount of production code across existing Salesforce orgs. You won't necessarily write new Aura components, but you will absolutely encounter it in legacy components, in Aura-LWC interop scenarios, and in maintenance work.",
      "Our recommendation for beginners: learn LWC first and learn it deeply, since it's what you'll be building with day to day. But don't skip Aura entirely — a working knowledge of how it structures components, handles events, and communicates with Apex will make you far more effective the moment you touch an existing org.",
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
    author: "Ceptra Marketing Team",
    image: "/blogs/2.webp",
    content: [
      "SEO (Search Engine Optimization) is about earning visibility organically through content, site structure, and technical health with results that compound over months. SEM (Search Engine Marketing) is about buying visibility directly, typically through Google Ads, with results that appear the moment your campaign goes live and disappear the moment your budget runs out.",
      "New interns often treat these as competing skills. In practice, the strongest marketers use them together: SEM to generate quick data on which keywords and messaging actually convert, and SEO to build durable, long term traffic around what that data proves works.",
      "If you're just starting out, get comfortable with the fundamentals of both before specializing — most junior digital marketing roles expect at least working familiarity with each.",
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
    author: "Ceptra Mentorship Team",
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
    author: "Ceptra Placement Team",
    image: "/blogs/4.webp",
    content: [
      "1. Listing responsibilities instead of outcomes. 'Worked on customer records module' says nothing. 'Built a customer records module that reduced manual data entry by 40%' says everything.",
      "2. Burying your strongest project. Recruiters scan top to bottom — your best work should be the first thing they see, not the last.",
      "3. Generic objective statements. 'Seeking a challenging role to utilize my skills' wastes prime resume real estate that could instead show a specific, relevant achievement.",
      "4. No quantifiable detail anywhere. Numbers — percentages, timeframes, team sizes — make claims verifiable and memorable.",
      "5. One resume for every application. A resume tailored to the specific role, even with small changes, consistently outperforms a one-size-fits-all version.",
    ],
  },
  {
    slug: "mock-interview-guide",
    title: "How Mock Interviews Actually Improve Your Chances",
    excerpt:
      "It's not just practice — it's about learning to think out loud. Here's how we run mock interviews at Ceptra and why it works.",
    category: "Placement",
    date: "Jul 8, 2026",
    readTime: "4 min read",
    author: "Chandan Sakure",
    image: "/blogs/5.webp",
    content: [
      "The most common reason candidates freeze in real interviews isn't lack of knowledge — it's lack of practice articulating that knowledge under pressure. Mock interviews close exactly that gap.",
      "At Ceptra, our mock interviews are run by mentors who've actually sat on hiring panels, not just fellow students. That matters — the feedback you get is calibrated to what real interviewers are actually listening for.",
      "The single biggest improvement we see across repeat mock sessions isn't technical knowledge — it's candidates learning to narrate their thinking instead of jumping straight to an answer. That habit alone changes how interviewers perceive your competence.",
    ],
  },
  {
    slug: "google-ads-for-beginners",
    title: "Google Ads for Beginners: Your First Campaign, Step by Step",
    excerpt:
      "From keyword research to your first live campaign — a walkthrough built for students, not agencies.",
    category: "Digital Marketing",
    date: "Jun 30, 2026",
    readTime: "8 min read",
    author: "Ceptra Marketing Team",
    image: "/blogs/6.webp",
    content: [
      "Before opening Google Ads, do your keyword research. Understanding what your audience is actually searching for and how competitive those terms are should shape your campaign, not come as an afterthought once it's live.",
      "Start with a single, narrow campaign rather than trying to cover every product or service at once. A focused campaign is easier to measure, easier to optimize, and gives you cleaner data to learn from.",
      "Set a modest daily budget for your first two weeks and treat that period as a learning phase, not a results phase. Your early data — click-through rate, cost per click, conversion rate — is what tells you whether to scale up or rework your approach.",
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
