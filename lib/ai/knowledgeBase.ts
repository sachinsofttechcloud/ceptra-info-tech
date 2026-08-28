/**
 * ============================================================================
 * CEPTRA INFOTECH AI KNOWLEDGE BASE & INTENT ENGINE
 * ============================================================================
 * Contains comprehensive facts, course details, FAQs, trainer info, and
 * semantic response generators for Ceptra Infotech website inquiries.
 */

export interface AIResponse {
  answer: string;
  suggestions?: string[];
  links?: Array<{ label: string; href: string }>;
}

export const CEPTRA_FACTS = {
  name: "Ceptra Infotech",
  tagline: "Premier Salesforce, Cloud & IT Training Institute",
  mentor: "Dr. Sarita Chandan Sakure",
  mentorQualifications:
    "BE, M.Tech, PhD in Computer Science, 16+ Years Experience, All Star Ranger on Trailhead",
  location: "Nagpur, Maharashtra, India (Live Interactive Online & Offline Batches)",
  contactPhone: "+91 8862082481 / 7276782674",
  whatsappNumber: "+91 8862082481",
  email: "chandan@ceptrainfotech.com",
  adminWhatsappLink: "https://wa.me/918862082481",
  placementRate: "94% verified placement rate",
  highestPackage: "12 LPA (Average: 6.5 LPA)",
  hiringPartners: "50+ top MNCs and IT service companies",
  validity: "1 Full Year Access (365 days) for all course videos and downloadable PDF notes",
};

export const COURSES_DATABASE = [
  {
    title: "Marketing Cloud Engagement",
    slug: "marketing-cloud-engagement",
    price: 32000,
    originalPrice: 40000,
    tags: ["LIVE CLASS", "FREE CONTENT", "TESTS"],
    category: "Live Classes",
    description:
      "Complete hands-on journey from Email Studio to Journey Builder, Automation Studio, Cloud Pages, Contact Builder, and real-world campaigns.",
    features: ["Email Studio & Journey Builder", "Automation Studio & SQL", "Real Client Case Studies", "1 Year Full Access"],
  },
  {
    title: "LWC (Lightning Web Components)",
    slug: "lwc-recorded",
    price: 1,
    originalPrice: 1,
    tags: ["VIDEOS", "FILES"],
    category: "Recorded Modules",
    description:
      "Deep dive into modern Salesforce frontend development with modern JavaScript ES6+, Wire adapters, Apex integration, LMS, and Component architecture.",
    features: ["Lightning Web Components Core", "Apex & Wire Integration", "LMS (Lightning Message Service)", "1 Year Full Access"],
  },
  {
    title: "Data Cloud + Agentforce + Marketing Cloud Next",
    slug: "data-cloud-agentforce-marketing-cloud-next-recorded",
    price: 40000,
    originalPrice: 50000,
    tags: ["LIVE CLASS", "FREE CONTENT", "VIDEOS"],
    category: "Specialized Next-Gen",
    description:
      "Master Salesforce Data Cloud (CDP), Agentforce AI autonomous agents, prompt engineering, and unified customer data architectures.",
    features: ["Salesforce Data Cloud / CDP", "Agentforce Autonomous AI", "Prompt Engineering & Data Modeling", "1 Year Full Access"],
  },
  {
    title: "SFMC Next Live Class",
    slug: "sfmc-next-live-class-recorded",
    price: 22500,
    originalPrice: 30000,
    tags: ["LIVE CLASS", "VIDEOS"],
    category: "Live Batch",
    description:
      "Interactive live weekend batch for Salesforce Marketing Cloud with live project implementation and certification roadmap.",
    features: ["Live Interactive Sessions", "Doubt Clearing with Mentors", "Certification Exam Prep", "1 Year Full Access"],
  },
  {
    title: "Salesforce Admin & Developer Combo",
    slug: "marketing-cloud-engagement-data-cloud-agentforce-marketing-cloud-next-recorded",
    price: 40000,
    originalPrice: 50000,
    tags: ["LIVE CLASS", "TESTS", "VIDEOS"],
    category: "Full Career Track",
    description:
      "From zero to Salesforce certified professional covering Configuration, SOQL, Apex Triggers, Asynchronous Apex, REST API Integrations, and LWC.",
    features: ["Admin (Objects, Flow, Security)", "Apex & Triggers", "REST API Integrations", "1 Year Full Access"],
  },
  {
    title: "Master Professional English with Industry Experts",
    slug: "english-spoken-industry-recorded",
    price: 15000,
    originalPrice: 20000,
    tags: ["LIVE CLASS", "FILES"],
    category: "Career Skills",
    description:
      "Spoken English, corporate communication, business email writing, and client presentation skills designed for IT professionals and job seekers.",
    features: ["Accent & Fluency Training", "Interview Communication", "Email & Presentation Etiquette", "1 Year Full Access"],
  },
];

export function getAIAnswer(query: string): AIResponse {
  const q = query.toLowerCase().trim();

  // 1. GREETINGS
  if (
    q === "hi" ||
    q === "hello" ||
    q === "hey" ||
    q.startsWith("hello") ||
    q.startsWith("hi ") ||
    q.includes("namaste") ||
    q.includes("good morning") ||
    q.includes("good evening")
  ) {
    return {
      answer:
        `Hello! 👋 Welcome to **Ceptra Infotech** — your premier destination for mastering Salesforce, Cloud Technologies, and AI.\n\n` +
        `I am your **Ceptra AI Assistant**. How can I help you today? You can ask me about our courses, fees, placements, trainer profile, or how to book a free demo class!`,
      suggestions: [
        "What Salesforce courses do you offer?",
        "Tell me about your placement assistance",
        "Who is the trainer / mentor?",
        "How can I book a free demo class?",
      ],
      links: [
        { label: "Browse All Courses", href: "/courses" },
        { label: "Book Free Demo", href: "/contact-us" },
      ],
    };
  }

  // 2. COURSES / PROGRAMS / CURRICULUM
  if (
    q.includes("course") ||
    q.includes("program") ||
    q.includes("learn") ||
    q.includes("syllabus") ||
    q.includes("curriculum") ||
    q.includes("offer") ||
    q.includes("classes")
  ) {
    if (q.includes("lwc") || q.includes("lightning web component")) {
      return {
        answer:
          `⚡ **Lightning Web Components (LWC) Course**\n\n` +
          `• **Key Topics**: Modern ES6+ JavaScript, Component Lifecycle, Wire Service, Apex Controllers, Lightning Message Service (LMS), Custom Events, and Real-time Component Project.\n` +
          `• **Materials**: Video lectures + downloadable PDF study notes.\n` +
          `• **Validity**: 1 Full Year (365 days) unrestricted access.\n` +
          `• **Fee**: ₹1 (Demo Access Price available for testing!)\n\n` +
          `Would you like to enroll or view the module breakdown?`,
        suggestions: ["Enroll in LWC Course", "What other courses are available?", "Tell me about Dr. Sarita Sakure"],
        links: [{ label: "View LWC Course", href: "/courses/lwc-recorded" }],
      };
    }

    if (q.includes("marketing cloud") || q.includes("sfmc") || q.includes("engagement")) {
      return {
        answer:
          `☁️ **Salesforce Marketing Cloud Engagement (SFMC)**\n\n` +
          `• **Modules Covered**: Email Studio, Journey Builder, Automation Studio, SQL queries in SFMC, CloudPages, Contact Builder, and API Integration.\n` +
          `• **Learning Format**: Live interactive lectures + full video recordings + comprehensive study notes & assignments.\n` +
          `• **Validity**: 1 Year Full Access.\n` +
          `• **Fee**: ₹32,000 (Original ₹40,000 — 20% Discount available).\n\n` +
          `Taught directly by **Dr. Sarita Chandan Sakure** with live real-world brand campaign scenarios.`,
        suggestions: ["View SFMC Course Details", "Payment Options Available", "Placement Support for SFMC"],
        links: [{ label: "Explore SFMC Course", href: "/courses/marketing-cloud-engagement" }],
      };
    }

    if (q.includes("data cloud") || q.includes("agentforce") || q.includes("ai")) {
      return {
        answer:
          `🤖 **Data Cloud + Agentforce + Marketing Cloud Next**\n\n` +
          `• **Overview**: Learn Salesforce's flagship AI and Data engine. Build autonomous Agentforce agents, design unified customer profiles in Data Cloud (CDP), and automate end-to-end customer interactions.\n` +
          `• **Skills Acquired**: CDP Data Ingestion, Identity Resolution, Calculated Insights, Agentforce Prompt Templates & Actions.\n` +
          `• **Fee**: ₹40,000 (20% OFF — Original ₹50,000).\n` +
          `• **Validity**: 1 Full Year access.`,
        suggestions: ["View Data Cloud & Agentforce", "How to enroll in this course?", "Contact an Advisor"],
        links: [
          {
            label: "View Data Cloud & Agentforce",
            href: "/courses/data-cloud-agentforce-marketing-cloud-next-recorded",
          },
        ],
      };
    }

    return {
      answer:
        `🎓 **Top Industry-Aligned Courses at Ceptra Infotech**:\n\n` +
        `1. **Marketing Cloud Engagement** (Email Studio, Journey Builder, SQL, CloudPages) — *₹32,000*\n` +
        `2. **Lightning Web Components (LWC)** (Modern JS, Apex, Wire, LMS) — *₹1 (Special Demo Rate)*\n` +
        `3. **Data Cloud + Agentforce AI** (CDP, Autonomous AI Agents, Prompt Engineering) — *₹40,000*\n` +
        `4. **SFMC Next Live Class Batch** (Interactive live batch with real projects) — *₹22,500*\n` +
        `5. **Spoken English & Corporate Communication** (Interview prep & business fluency) — *₹15,000*\n\n` +
        `All courses include **1 Full Year validity**, live project exposure, and placement assistance!`,
      suggestions: [
        "Tell me about SFMC Course",
        "Tell me about LWC Course",
        "Tell me about Data Cloud & Agentforce",
        "How do payments & checkout work?",
      ],
      links: [{ label: "View All Courses", href: "/courses" }],
    };
  }

  // 3. PLACEMENTS & JOBS & SALARY
  if (
    q.includes("placement") ||
    q.includes("job") ||
    q.includes("salary") ||
    q.includes("package") ||
    q.includes("hiring") ||
    q.includes("interview") ||
    q.includes("career")
  ) {
    return {
      answer:
        `🚀 **Ceptra Infotech Placement & Career Assistance**\n\n` +
        `We provide end-to-end placement support to help you land your dream tech job:\n\n` +
        `• **94% Placement Success Rate** across Salesforce Admin, Dev, and Consultant roles.\n` +
        `• **Highest Package**: 12 LPA | **Average Package**: 6.5 LPA.\n` +
        `• **Resume & Portfolio Rebuilding**: Tailored to showcase real production projects.\n` +
        `• **1-on-1 Mock Interviews**: Technical rounds, system design, and HR behavioral sessions.\n` +
        `• **50+ Hiring Partner Network**: Direct interview pipelines with top MNCs and IT consulting firms.\n\n` +
        `Our mentors track every student individually by name, not by ticket number.`,
      suggestions: [
        "See Placement Results on Homepage",
        "What courses lead to high packages?",
        "Book a Free Career Counseling Session",
      ],
      links: [
        { label: "See Placement Results", href: "/#placement" },
        { label: "Book Free Counseling", href: "/contact-us" },
      ],
    };
  }

  // 4. TRAINER / MENTOR / DR. SARITA SAKURE
  if (
    q.includes("trainer") ||
    q.includes("mentor") ||
    q.includes("teacher") ||
    q.includes("instructor") ||
    q.includes("faculty") ||
    q.includes("sarita") ||
    q.includes("sakure") ||
    q.includes("who teaches")
  ) {
    return {
      answer:
        `👩‍🏫 **About Chief Mentor: Dr. Sarita Chandan Sakure**\n\n` +
        `• **Qualifications**: BE, M.Tech, and PhD in Computer Science.\n` +
        `• **Experience**: 16+ Years of industry leadership, corporate training, and university teaching.\n` +
        `• **Credentials**: Trailhead **All Star Ranger**, certified Salesforce Consultant & Architect Mentor.\n` +
        `• **Teaching Style**: 100% practical, zero fluff. Focuses on real architecture, hands-on code, enterprise scenarios, and debugging real-world production errors.`,
      suggestions: [
        "What courses does Dr. Sarita teach?",
        "How can I join her live batch?",
        "Read About Ceptra Infotech",
      ],
      links: [
        { label: "Explore Courses", href: "/courses" },
        { label: "About Ceptra", href: "/about-us" },
      ],
    };
  }

  // 5. FEES, DISCOUNTS, VALIDITY & PAYMENT METHODS
  if (
    q.includes("fee") ||
    q.includes("price") ||
    q.includes("cost") ||
    q.includes("discount") ||
    q.includes("payment") ||
    q.includes("pay") ||
    q.includes("validity") ||
    q.includes("upi") ||
    q.includes("qr") ||
    q.includes("razorpay") ||
    q.includes("paytm")
  ) {
    return {
      answer:
        `💳 **Transparent Pricing & Payment Methods**\n\n` +
        `• **1 Full Year Access**: Every enrolled course provides 365-day access to all video lectures and PDF resources.\n` +
        `• **Payment Gateway Options**:\n` +
        `  1. **Paytm QR & UPI**: Instant scanning with auto-filled amount via GPay, PhonePe, Paytm, or BHIM.\n` +
        `  2. **Razorpay**: All Visa / MasterCard / RuPay Debit & Credit Cards, NetBanking (HDFC, ICICI, SBI, Axis, etc.), and UPI.\n` +
        `  3. **Direct Bank Transfer (NEFT / IMPS)**: ICICI Bank official account settlement.\n` +
        `• **Instant Unlock**: Once your transaction is confirmed, your course unrolls and unlocks immediately on your student dashboard!`,
      suggestions: [
        "How do I buy a course step-by-step?",
        "What is the fee for LWC?",
        "What is the fee for Marketing Cloud?",
      ],
      links: [{ label: "View Course Catalog", href: "/courses" }],
    };
  }

  // 6. CONTACT / LOCATION / FREE DEMO / WHATSAPP
  if (
    q.includes("contact") ||
    q.includes("phone") ||
    q.includes("mobile") ||
    q.includes("email") ||
    q.includes("address") ||
    q.includes("location") ||
    q.includes("where") ||
    q.includes("demo") ||
    q.includes("whatsapp") ||
    q.includes("reach") ||
    q.includes("call")
  ) {
    return {
      answer:
        `📞 **Get in Touch with Ceptra Infotech**\n\n` +
        `• **Headquarters**: Nagpur, Maharashtra, India.\n\n` +
        `• **Phone / WhatsApp**: [+91 8862082481 / 7276782674](https://wa.me/918862082481)\n\n` +
        `• **Email**: chandan@ceptrainfotech.com\n\n` +
        `• **Free Demo Class**: You can book a free live demo session anytime through our contact form.\n\n` +
        `• **Training Modes**: Online interactive batches (worldwide) & classroom workshops.`,
      suggestions: [
        "Book a Free Demo Class",
        "Chat with Us on WhatsApp",
        "View Available Courses",
      ],
      links: [
        { label: "Book Free Demo Class", href: "/contact-us" },
        { label: "Chat on WhatsApp (+91 8862082481)", href: "https://wa.me/918862082481" },
      ],
    };
  }

  // 7. WHY CHOOSE CEPTRA / ABOUT US
  if (
    q.includes("why") ||
    q.includes("about") ||
    q.includes("review") ||
    q.includes("benefit") ||
    q.includes("different") ||
    q.includes("special")
  ) {
    return {
      answer:
        `🌟 **Why Choose Ceptra Infotech?**\n\n` +
        `• **Learn from the Best**: Led by Dr. Sarita Chandan Sakure (PhD in CS, Trailhead All Star Ranger).\n` +
        `• **Production-Grade Curriculum**: Not just Trailhead badges, but real enterprise multi-tenant architectures and client scenarios.\n` +
        `• **1-Year Unrestricted Access**: Rewatch lectures, access updated PDFs, and practice anytime.\n` +
        `• **Dedicated Placement Cell**: 94% placement rate, resume crafting, 1-on-1 mock interviews, and 50+ hiring partner connect.\n` +
        `• **Flexible Learning**: Weekend and weekday batches suitable for both working professionals and freshers.`,
      suggestions: [
        "Browse Salesforce Courses",
        "See Placement Statistics",
        "Book Free Demo Class",
      ],
      links: [
        { label: "About Us", href: "/about-us" },
        { label: "View Courses", href: "/courses" },
      ],
    };
  }

  // DEFAULT / FALLBACK RESPONSE
  return {
    answer:
      `I can help you with anything related to **Ceptra Infotech**! Here are some common topics you can ask me about:\n\n` +
      `• **Courses & Syllabus** (Marketing Cloud, LWC, Data Cloud, Agentforce AI, Spoken English)\n` +
      `• **Fees & Discounts** (Transparent pricing & 1-year access)\n` +
      `• **Placements & Salaries** (94% placement rate, mock interviews, 12 LPA highest package)\n` +
      `• **Trainer & Mentor Profile** (Dr. Sarita Chandan Sakure, 16+ yrs exp)\n` +
      `• **Enrollment & Payment Process** (Paytm QR, Razorpay, UPI, Direct Bank)\n` +
      `• **Booking a Free Demo Class**\n\n` +
      `Feel free to click any of the suggestions below or ask your question directly!`,
    suggestions: [
      "What Salesforce courses do you offer?",
      "Tell me about your placement assistance",
      "Who is the trainer / mentor?",
      "How do I buy or enroll in a course?",
      "Book a Free Demo Class",
    ],
    links: [
      { label: "View All Courses", href: "/courses" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  };
}
