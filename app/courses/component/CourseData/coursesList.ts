export interface CourseSection {
  heading: string;
  points: string[];
}

export interface CourseDescription {
  about: string;
  sections: CourseSection[];
}

export interface CourseContentItem {
  id?: string;
  type: "video" | "pdf";
  name: string;
  duration?: string;
  fileSize?: string;
  url: string;
  description?: string;
}

export interface CourseListItem {
  slug: string;
  title: string;
  image: string;
  tags: string[];
  price: number;
  originalPrice?: number;
  badge?: string;
  href: string;
  category: "live" | "test-series" | "recorded";
  popularity: number;
  dateAdded: string;
  description?: CourseDescription;
  content?: CourseContentItem[];
}

export const DEFAULT_COURSE_CONTENT: CourseContentItem[] = [
  {
    id: "video-1",
    type: "video",
    name: "SalesForce Video - Architecture & Overview",
    duration: "12:30",
    url: "https://www.youtube.com/watch?v=EfK0SURQ8X0",
    description:
      "Comprehensive introduction to the Salesforce ecosystem, multi-tenant cloud architecture, and core enterprise capabilities.",
  },
  {
    id: "video-2",
    type: "video",
    name: "SalesForce Video - Live Hands-on Training",
    duration: "18:45",
    url: "https://www.youtube.com/watch?v=bDfOdFg5G1U&t=6s",
    description:
      "Live class session, hands-on tool navigation, data setup, and step-by-step practical implementation techniques.",
  },
  {
    id: "pdf-1",
    type: "pdf",
    name: "SalesForce PDF - Complete Course Syllabus & Roadmap",
    fileSize: "2.4 MB",
    url: "/courses/docs/salesforce-course-syllabus.pdf",
    description:
      "Detailed topic-wise syllabus, module breakdowns, interview preparation roadmap, and certification guidance.",
  },
  {
    id: "pdf-2",
    type: "pdf",
    name: "SalesForce PDF - Hands-On Guide & Study Notes",
    fileSize: "1.8 MB",
    url: "/courses/docs/salesforce-study-notes.pdf",
    description:
      "Essential study notes, architecture cheat-sheets, key shortcuts, formula references, and practice project scenarios.",
  },
];

const marketingCloudEngagementFullDesc: CourseDescription = {
  about:
    "Master the complete Salesforce Marketing Cloud ecosystem — Engagement, Data Cloud, Agentforce and Marketing Cloud Next — from beginner to advanced level with a practical, real-world and job-oriented training program.",
  sections: [
    {
      heading: "1. Marketing Cloud Engagement",
      points: [
        "Data Extensions & Contact Builder",
        "Email Studio & Content Builder",
        "HTML, CSS, Responsive Email",
        "AMPscript",
        "SQL & Data Views",
        "Automation Studio",
        "Journey Builder",
        "CloudPages",
        "SMS & Push",
        "SSJS, REST & SOAP API",
      ],
    },
    {
      heading: "2. Data Cloud / Data 360",
      points: [
        "Data Sources & Data Streams",
        "DLO & DMO",
        "Data Mapping",
        "Identity Resolution",
        "Match & Reconciliation Rules",
        "Unified Customer Profile",
        "Calculated Insights",
        "Segmentation",
        "Activation",
        "Data Graphs & Data Actions",
      ],
    },
    {
      heading: "3. Agentforce",
      points: [
        "Agentforce Fundamentals",
        "Agent Builder",
        "Topics & Instructions",
        "Actions",
        "Prompt Builder",
        "Grounding",
        "Data Cloud Integration",
        "Flow Integration",
        "Agent Testing & Deployment",
        "Marketing Use Cases",
      ],
    },
    {
      heading: "4. Marketing Cloud Next",
      points: [
        "Marketing Cloud Next Architecture",
        "Setup, Users & Permissions",
        "Audiences & Segments",
        "Email & Content Creation",
        "Personalization",
        "Campaigns",
        "Flow Builder",
        "Marketing Flows",
        "Email, SMS & WhatsApp",
        "Campaign Creation Agent",
        "Journey Decisioning",
        "AI Content Generation",
        "Analytics & Reporting",
      ],
    },
  ],
};

const marketingCloudEngagementOnlyDesc: CourseDescription = {
  about:
    "Master Salesforce Marketing Cloud Engagement (SFMC) from beginner to advanced level with a practical, real-world and job-oriented training program. Learn to design and execute complete customer engagement campaigns, build automated journeys, work with customer data, and implement real-world marketing use cases.",
  sections: [
    {
      heading: "What You Will Learn",
      points: [
        "SFMC Architecture & Business Units",
        "Data Extensions & Contact Builder",
        "Email Studio & Content Builder",
        "HTML, CSS & Responsive Email",
        "AMPscript",
        "SQL & Data Views",
        "Automation Studio",
        "Journey Builder",
        "A/B Testing & Path Optimizer",
        "CloudPages & Forms",
        "MobileConnect / SMS",
        "MobilePush",
        "SSJS",
        "REST & SOAP APIs",
        "Installed Packages",
        "Tracking, Reporting & Deliverability",
      ],
    },
  ],
};

const dataCloudAgentforceNextDesc: CourseDescription = {
  about:
    "Go deep into Data Cloud, Agentforce and Marketing Cloud Next — build unified customer profiles, deploy AI-powered agents, and run next-generation marketing campaigns with hands-on, job-oriented training.",
  sections: [
    {
      heading: "1. Data Cloud / Data 360",
      points: [
        "Data Sources & Data Streams",
        "DLO & DMO",
        "Data Mapping",
        "Identity Resolution",
        "Match & Reconciliation Rules",
        "Unified Customer Profile",
        "Calculated Insights",
        "Segmentation",
        "Activation",
        "Data Graphs & Data Actions",
      ],
    },
    {
      heading: "2. Agentforce",
      points: [
        "Agentforce Fundamentals",
        "Agent Builder",
        "Topics & Instructions",
        "Actions",
        "Prompt Builder",
        "Grounding",
        "Data Cloud Integration",
        "Flow Integration",
        "Agent Testing & Deployment",
        "Marketing Use Cases",
      ],
    },
    {
      heading: "3. Marketing Cloud Next",
      points: [
        "Marketing Cloud Next Architecture",
        "Setup, Users & Permissions",
        "Audiences & Segments",
        "Email & Content Creation",
        "Personalization",
        "Campaigns",
        "Flow Builder",
        "Email, SMS & WhatsApp",
        "Campaign Creation Agent",
        "Journey Decisioning",
        "AI Content Generation",
        "Analytics & Reporting",
      ],
    },
  ],
};

const sfmcNextLiveDesc: CourseDescription = {
  about:
    "A focused, live, hands-on program on Marketing Cloud Next — covering setup, Data Cloud integration, Agentforce for marketing, and a real-time campaign project.",
  sections: [
    {
      heading: "What You Will Learn",
      points: [
        "Marketing Cloud Next Overview & Architecture",
        "Setup, Users, Roles & Permissions",
        "Data Cloud / Data 360 Integration",
        "Audiences & Segmentation",
        "Email Content Creation",
        "Personalization & Dynamic Content",
        "Campaign Creation",
        "Flow Builder for Marketing",
        "Email, SMS & WhatsApp Channels",
        "Landing Pages",
        "Agentforce for Marketing",
        "Campaign Creation Agent",
        "AI Content Generation",
        "Journey Decisioning",
        "Send Time Optimization",
        "Engagement Scoring",
        "Analytics & Reporting",
        "Marketing Cloud Engagement + Next Integration",
        "Real-Time Campaign Project",
      ],
    },
  ],
};

const salesforceAdminDevDesc: CourseDescription = {
  about:
    "Become job-ready on both the admin and development sides of Salesforce — from org setup and security to Apex, triggers, and Lightning Web Components.",
  sections: [
    {
      heading: "Salesforce Admin",
      points: [
        "Salesforce CRM & Org Setup",
        "Users, Profiles, Roles & Permission Sets",
        "Standard & Custom Objects",
        "Fields & Relationships",
        "Page Layouts, Record Types & Lightning App Builder",
        "Validation Rules & Formula Fields",
        "Security & Sharing Rules",
        "Data Import, Export & Data Loader",
        "Reports & Dashboards",
        "Flow Builder & Approval Processes",
        "Sales Cloud & Service Cloud Basics",
      ],
    },
    {
      heading: "Salesforce Development",
      points: [
        "Apex Basics",
        "SOQL & SOSL",
        "DML Operations",
        "Triggers & Trigger Framework",
        "Apex Classes & Collections",
        "Exception Handling",
        "Batch, Queueable & Scheduled Apex",
        "Test Classes & Code Coverage",
        "Lightning Web Components (LWC)",
        "Apex + LWC Integration",
        "REST/SOAP API Basics",
        "Deployment & Debugging",
      ],
    },
  ],
};

const lwcDesc: CourseDescription = {
  about:
    "Learn to build fast, reusable Salesforce UI components with Lightning Web Components — from component structure and data binding to Apex integration and deployment.",
  sections: [
    {
      heading: "What You Will Learn",
      points: [
        "LWC Architecture & Component Structure",
        "HTML, CSS & JavaScript Basics",
        "Data Binding & Conditional Rendering",
        "Loops: for:each and Iterators",
        "Decorators: @api, @wire",
        "Parent–Child Component Communication",
        "Custom Events",
        "Lifecycle Hooks",
        "Lightning Base Components",
        "Lightning Data Service",
        "UI Record API",
        "LWC + Apex Integration",
        "Wire vs Imperative Apex",
        "Forms & CRUD Operations",
        "Lightning Datatable",
        "Navigation & Toast Messages",
        "SLDS Styling",
        "Error Handling",
        "REST API Integration",
        "Reusable Components",
        "Deployment & Testing",
      ],
    },
  ],
};

export const ALL_COURSES: CourseListItem[] = [
  // ---- Live Courses ----

  {
    slug: "marketing-cloud-engagement-data-cloud-agentforce-marketing-cloud-next",
    title:
      "Marketing Cloud Engagement + Data Cloud + Agentforce + Marketing cloud Next",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "FREE CONTENT", "TESTS"],
    price: 40000,
    originalPrice: 50000,
    href: "/courses/marketing-cloud-engagement-data-cloud-agentforce-marketing-cloud-next",
    category: "live",
    popularity: 92,
    dateAdded: "2026-08-01",
    description: marketingCloudEngagementFullDesc,
  },
  {
    slug: "marketing-cloud-engagement",
    title: "Marketing Cloud Engagement",
    image: "/courses/new-course/2.webp",
    tags: ["FREE CONTENT", "VIDEOS", "FILES"],
    price: 32000,
    originalPrice: 40000,
    badge: "NEW COURSE",
    href: "/courses/marketing-cloud-engagement",
    category: "live",
    popularity: 74,
    dateAdded: "2026-07-15",
    description: marketingCloudEngagementOnlyDesc,
  },
  {
    slug: "data-cloud-agentforce-marketing-cloud-next",
    title: "Data Cloud + Agentforce + Marketing Cloud Next",
    image: "/courses/new-course/3.webp",
    tags: ["LIVE CLASS", "FREE CONTENT", "VIDEOS"],
    price: 32000,
    originalPrice: 40000,
    href: "/courses/data-cloud-agentforce-marketing-cloud-next",
    category: "live",
    popularity: 61,
    dateAdded: "2026-06-20",
    description: dataCloudAgentforceNextDesc,
  },
  {
    slug: "sfmc-next-live-class",
    title: "SFMC Next Live Class",
    image: "/courses/new-course/4.webp",
    tags: ["LIVE CLASS", "FREE CONTENT", "VIDEOS"],
    price: 22500,
    originalPrice: 30000,
    href: "/courses/sfmc-next-live-class",
    category: "live",
    popularity: 88,
    dateAdded: "2026-08-10",
    description: sfmcNextLiveDesc,
  },
  {
    slug: "salesforce-admin-development",
    title: "Salesforce Admin + Development",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "FREE CONTENT", "VIDEOS"],
    price: 35000,
    originalPrice: 40000,
    href: "/courses/salesforce-admin-development",
    category: "live",
    popularity: 95,
    dateAdded: "2026-08-14",
    description: salesforceAdminDevDesc,
  },
  {
    slug: "lwc",
    title: "LWC",
    image: "/courses/new-course/5.webp",
    tags: ["VIDEOS", "FILES"],
    price: 20000,
    originalPrice: 24500,
    href: "/courses/lwc",
    category: "live",
    popularity: 70,
    dateAdded: "2026-05-28",
    description: lwcDesc,
  },
  {
    slug: "english-spoken-industry",
    title: "Master Professional English with Industry Experts!",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "VIDEOS", "FILES"],
    price: 15000,
    href: "/courses/english-spoken-industry",
    category: "live",
    popularity: 55,
    dateAdded: "2026-04-10",
  },

  // ---- Recorded Courses ----

  {
    slug: "marketing-cloud-engagement-recorded",
    title: "Marketing Cloud Engagement",
    image: "/courses/new-course/2.webp",
    tags: ["FREE CONTENT", "VIDEOS", "FILES"],
    price: 32000,
    originalPrice: 40000,
    badge: "NEW COURSE",
    href: "/courses/marketing-cloud-engagement-recorded",
    category: "recorded",
    popularity: 74,
    dateAdded: "2026-07-15",
    description: marketingCloudEngagementOnlyDesc,
  },
  {
    slug: "data-cloud-agentforce-marketing-cloud-next-recorded",
    title: "Data Cloud + Agentforce + Marketing Cloud Next",
    image: "/courses/new-course/3.webp",
    tags: ["LIVE CLASS", "FREE CONTENT", "VIDEOS"],
    price: 32000,
    originalPrice: 40000,
    href: "/courses/data-cloud-agentforce-marketing-cloud-next-recorded",
    category: "recorded",
    popularity: 61,
    dateAdded: "2026-06-20",
    description: dataCloudAgentforceNextDesc,
  },
  {
    slug: "sfmc-next-live-class-recorded",
    title: "SFMC Next Live Class",
    image: "/courses/new-course/4.webp",
    tags: ["LIVE CLASS", "FREE CONTENT", "VIDEOS"],
    price: 22500,
    originalPrice: 30000,
    href: "/courses/sfmc-next-live-class-recorded",
    category: "recorded",
    popularity: 88,
    dateAdded: "2026-08-10",
    description: sfmcNextLiveDesc,
  },
  {
    slug: "lwc-recorded",
    title: "LWC",
    image: "/courses/new-course/5.webp",
    tags: ["VIDEOS", "FILES"],
    price: 1,
    originalPrice: 1,
    href: "/courses/lwc-recorded",
    category: "recorded",
    popularity: 70,
    dateAdded: "2026-05-28",
    description: lwcDesc,
  },
  {
    slug: "english-spoken-industry-recorded",
    title: "Master Professional English with Industry Experts!",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "VIDEOS", "FILES"],
    price: 15000,
    href: "/courses/english-spoken-industry-recorded",
    category: "recorded",
    popularity: 55,
    dateAdded: "2026-04-10",
  },
  {
    // FIX: this previously had the exact same slug as the first "live" course
    // (that duplicate is what caused the "two children with the same key" warning).
    slug: "marketing-cloud-engagement-data-cloud-agentforce-marketing-cloud-next-recorded",
    title:
      "Marketing Cloud Engagement + Data Cloud + Agentforce + Marketing cloud Next",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "FREE CONTENT", "TESTS"],
    price: 40000,
    originalPrice: 50000,
    href: "/courses/marketing-cloud-engagement-data-cloud-agentforce-marketing-cloud-next-recorded",
    category: "recorded",
    popularity: 55,
    dateAdded: "2026-04-10",
    description: marketingCloudEngagementFullDesc,
  },
  {
    slug: "asddeeab",
    title: "ASDDEEAB!",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "VIDEOS", "FILES"],
    price: 10,
    href: "/courses/asddeeab",
    category: "recorded",
    popularity: 15,
    dateAdded: "2026-04-10",
  },
  {
    slug: "dcbaba",
    title: "DCBABA!",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "VIDEOS", "FILES"],
    price: 1,
    href: "/courses/dcbaba",
    category: "recorded",
    popularity: 15,
    dateAdded: "2026-04-10",
  },
  {
    slug: "dcbabae",
    title: "DCBABAE!",
    image: "/courses/new-course/1.webp",
    tags: ["LIVE CLASS", "VIDEOS", "FILES"],
    price: 1,
    href: "/courses/dcbabae",
    category: "recorded",
    popularity: 15,
    dateAdded: "2026-04-10",
  },
];