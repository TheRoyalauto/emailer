import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sendly - AI-Powered Email Outreach Platform",
    description: "The intelligent email outreach platform for modern sales teams. Send personalized cold emails at scale with AI-powered writing, smart sequences, and advanced analytics.",
    keywords: ["email outreach", "cold email", "sales automation", "email marketing", "lead generation", "AI email"],
    openGraph: {
        title: "Sendly - AI-Powered Email Outreach Platform",
        description: "Send personalized cold emails at scale with AI-powered writing and smart sequences.",
        type: "website",
        url: "https://sendly.io",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sendly - AI-Powered Email Outreach Platform",
        description: "Send personalized cold emails at scale with AI-powered writing and smart sequences.",
    },
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
