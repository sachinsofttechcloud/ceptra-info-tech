import type { Metadata } from "next";
import Hero from "@/components/Layout/Hero";
import Instituteprograms from "@/components/Layout/Instituteprograms";
import Whychooseus from "@/components/Layout/Whychooseus";
import AboutMission from "@/components/Layout/AboutMission";
import Testimonials from "@/components/Layout/Testimonials";
import Placements from "@/components/Layout/Placements";
import Ctasection from "@/components/Layout/Ctasection";

export const metadata: Metadata = {
  title: "Home | Industry Leading Salesforce & IT Training",
  description: "Ceptra Infotech provides real-world mentor-led training in Salesforce, Marketing Cloud, LWC, Agentforce, and Full Stack Web Development with placement assistance.",
  openGraph: {
    title: "Ceptra Infotech | Salesforce & IT Training Institute",
    description: "Industry leading live IT & Salesforce training with real-world hands-on project experience.",
    url: "https://ceptrainfotech.com/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Instituteprograms />
      <Whychooseus />
      <AboutMission />
      <Testimonials />
      <Placements id="placement" />
      <Ctasection />
    </>
  );
}