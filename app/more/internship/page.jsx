import InternshipHero from "@/components/Layout/InternshipHero";
import WhyChooseSection from "@/components/Layout/WhyChooseSection";
import InternshipProgramPage from "@/components/Layout/InternshipProgramPage";

export const metadata = {
  title: "Internship Program",
  description: "Gain hands-on experience, live industry project exposure, and mentorship with Ceptra Infotech's IT internship program.",
  openGraph: {
    title: "Internship Program | Ceptra Infotech",
    description: "Gain hands-on experience, live industry project exposure, and mentorship with Ceptra Infotech's IT internship program.",
    url: "https://ceptrainfotech.com/more/internship/",
  },
};

const InternshipPage = () => {
  return (
    <>
      <InternshipHero />
      <WhyChooseSection />
      <InternshipProgramPage />
    </>
  );
};

export default InternshipPage;