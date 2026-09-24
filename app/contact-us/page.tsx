

import type { Metadata } from "next";
import ContactSection from "@/components/Layout/ContactForm";
import ContactHero from "@/components/Layout/ContactHero";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Ceptra Infotech for Salesforce and IT course enquiries, batch details, admissions, and career counseling.",
  openGraph: {
    title: "Contact Us | Ceptra Infotech",
    description: "Get in touch with Ceptra Infotech for Salesforce and IT course enquiries, batch details, admissions, and career counseling.",
    url: "https://ceptrainfotech.com/contact-us/",
  },
};

const ContactUsPage = () => {
  return (
    <main>
      <ContactHero />
      <ContactSection/>
    </main>
  );
};

export default ContactUsPage;