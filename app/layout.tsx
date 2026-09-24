import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Home/Navbar";
import ScrollProgress from "../components/Layout/Scrollprogress";
import Footer from "@/components/Home/Footer";
import Preloader from "@/components/Home/Preloader";
import CeptraAIChatbot from "@/components/Home/CeptraAIChatbot";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ceptrainfotech.com"),
  title: {
    default: "Ceptra Infotech | Salesforce, Marketing Cloud & Web Development Training",
    template: "%s | Ceptra Infotech",
  },
  description: "Ceptra Infotech is a premier IT training institute offering live mentor-led courses in Salesforce Admin & Developer, Marketing Cloud, LWC, Agentforce, Data Cloud, and Web Development with placement assistance.",
  keywords: [
    "Salesforce Training",
    "Salesforce Marketing Cloud",
    "LWC Course",
    "Data Cloud Training",
    "Agentforce",
    "IT Training Institute Nagpur",
    "Salesforce Certification",
    "Full Stack Web Development",
    "IT Internship Program",
    "Ceptra Infotech"
  ],
  authors: [{ name: "Ceptra Infotech Pvt. Ltd." }],
  creator: "Ceptra Infotech",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ceptrainfotech.com",
    title: "Ceptra Infotech | Salesforce & IT Training Institute",
    description: "Transform your career with live mentor-led IT training, hands-on projects, and placement assistance.",
    siteName: "Ceptra Infotech",
    images: [
      {
        url: "/navbar/ceptra-logo.png",
        width: 1200,
        height: 630,
        alt: "Ceptra Infotech Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceptra Infotech | Salesforce & IT Training Institute",
    description: "Transform your career with live mentor-led IT training, hands-on projects, and placement assistance.",
    images: ["/navbar/ceptra-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/navbar/ceptra-logo.png",
    shortcut: "/navbar/ceptra-logo.png",
    apple: "/navbar/ceptra-logo.png",
  },
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Preloader />
        <ScrollProgress />
        <Navbar />
        {children}
        <Footer />
        <CeptraAIChatbot />
      </body>
    </html>
  );
}