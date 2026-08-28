import Hero from "@/components/Layout/Hero";
import Instituteprograms from "@/components/Layout/Instituteprograms";
import Whychooseus from "@/components/Layout/Whychooseus";
import AboutMission from "@/components/Layout/AboutMission";
import Testimonials from "@/components/Layout/Testimonials";
import Placements from "@/components/Layout/Placements";
import Ctasection from "@/components/Layout/Ctasection";

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