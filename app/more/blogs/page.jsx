import BlogSection from "@/components/Layout/BlogSection";

export const metadata = {
  title: "Blogs & Insights",
  description: "Read the latest news, Salesforce tutorials, career guides, tech updates, and insights from Ceptra Infotech experts.",
  openGraph: {
    title: "Blogs & Insights | Ceptra Infotech",
    description: "Read the latest news, Salesforce tutorials, career guides, tech updates, and insights from Ceptra Infotech experts.",
    url: "https://ceptrainfotech.com/more/blogs/",
  },
};

export default function Blogpage() {

    return (
        <>
        <BlogSection />
        </>
    )
}