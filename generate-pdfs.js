const fs = require("fs");
const path = require("path");

function createSimplePdf(title, subtitle, sections) {
  // Construct minimal valid PDF-1.4 format
  const streamLines = [
    "BT",
    "/F1 22 Tf",
    "50 750 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 12 Tf",
    "0 -25 Td",
    `(${escapePdfText(subtitle)}) Tj`,
    "0 -30 Td",
    "/F1 10 Tf",
  ];

  let yOffset = 0;
  for (const sec of sections) {
    streamLines.push(`/F1 14 Tf`);
    streamLines.push(`0 -20 Td`);
    streamLines.push(`(${escapePdfText(sec.heading)}) Tj`);
    streamLines.push(`/F1 10 Tf`);
    for (const pt of sec.points) {
      streamLines.push(`0 -15 Td`);
      streamLines.push(`(${escapePdfText("• " + pt)}) Tj`);
    }
    streamLines.push(`0 -10 Td`);
  }
  streamLines.push("ET");

  const streamContent = streamLines.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000307 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

const docsDir = path.join(__dirname, "public", "courses", "docs");

// PDF 1: Syllabus
const syllabusPdf = createSimplePdf(
  "Ceptra Infotech - Salesforce Master Course Syllabus",
  "Instructor: Dr. Sarita Chandan Sakure | Ceptra Infotech Pvt Ltd",
  [
    {
      heading: "Module 1: Salesforce Core Architecture & Fundamentals",
      points: [
        "Cloud Computing & Salesforce Multi-Tenant Architecture",
        "Standard Objects, Custom Objects, Record Types & Fields",
        "Security Model: Org-wide Defaults, Profiles, Roles, Permission Sets",
        "Automation: Flow Builder, Process Automation, Validation Rules",
      ],
    },
    {
      heading: "Module 2: Salesforce Marketing Cloud & Data Cloud",
      points: [
        "Email Studio, Content Builder, Contact Builder & Data Extensions",
        "Journey Builder, Automation Studio & Multi-channel Campaigns",
        "Data Streams, DLO & DMO Mapping, Unified Customer Profiles",
        "Calculated Insights, Segmentation & Activation Workflows",
      ],
    },
    {
      heading: "Module 3: Agentforce & AI-Powered Workflows",
      points: [
        "Agent Builder, Topics, Custom Instructions & Action Triggers",
        "Prompt Builder, Grounding with Data Cloud & Trust Layer",
        "Real-time Enterprise Marketing and Service Agent Use Cases",
      ],
    },
  ]
);

// PDF 2: Study Notes
const notesPdf = createSimplePdf(
  "Ceptra Infotech - Salesforce Hands-On Notes & Guide",
  "Comprehensive Study Guide & Real-Time Project Notes",
  [
    {
      heading: "Key Concept 1: Data Cloud Ingestion & Identity Resolution",
      points: [
        "Connectors: CRM Connector, S3 Connector, Ingestion API",
        "Match Rules: Exact Match vs Fuzzy Match rules",
        "Data Graphs: Sub-second unified query performance",
      ],
    },
    {
      heading: "Key Concept 2: Agentforce Architecture & Execution Engine",
      points: [
        "Reasoning Engine: Large Language Model planning loop",
        "Action Schema: Apex, Flow, MuleSoft, and External REST APIs",
        "Guardrails: Hallucination mitigation, masking sensitive PII",
      ],
    },
    {
      heading: "Key Concept 3: Best Practices & Certification Tips",
      points: [
        "Trailhead Superbadges & Hands-On Practice Projects",
        "Interview Q&A: Governor Limits, Trigger Frameworks, Data Modeling",
        "Capstone Project Submission & Live Assessment Guidelines",
      ],
    },
  ]
);

fs.writeFileSync(path.join(docsDir, "salesforce-course-syllabus.pdf"), syllabusPdf);
fs.writeFileSync(path.join(docsDir, "salesforce-study-notes.pdf"), notesPdf);

console.log("PDF files generated successfully in public/courses/docs!");
