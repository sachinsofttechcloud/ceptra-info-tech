import type { Metadata } from "next";
import { AboutHero } from "@/components/Layout/AboutHero";
import AboutUs from "@/components/Layout/AboutUs";
import { AboutMission } from "@/components/Layout/AboutMission";
import { AboutVision } from "@/components/Layout/AboutVision";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Ceptra Infotech's mission, vision, industry expert trainers, and our commitment to building career-ready tech professionals.",
  openGraph: {
    title: "About Us | Ceptra Infotech",
    description: "Learn about Ceptra Infotech's mission, vision, industry expert trainers, and our commitment to building career-ready tech professionals.",
    url: "https://ceptrainfotech.com/about-us/",
  },
};

export default function AboutUS() {
    return (
        <>
            <AboutHero />
            <AboutUs />
            <AboutVision />
            <AboutMission />
        </>
    );
}