import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "E-mailer — AI-Powered Cold Email Outreach Platform",
        template: "%s | E-mailer",
    },
    description: "E-mailer is the AI-powered cold email platform trusted by hundreds of sales teams. Personalize emails at scale, automate follow-ups, and land in the inbox — not spam. 98.7% deliverability. Start free.",
    keywords: ["cold email software", "AI email outreach", "email automation platform", "sales email tool", "cold email deliverability", "email sequences", "lead generation software", "outbound sales platform"],
    openGraph: {
        title: "E-mailer — AI-Powered Cold Email Outreach Platform",
        description: "Send personalized cold emails that actually get replies. AI-powered writing, smart sequences, 98.7% deliverability. Trusted by hundreds of sales teams.",
        type: "website",
        url: "https://e-mailer.io",
        siteName: "E-mailer",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "E-mailer — AI Cold Email That Gets Replies",
        description: "Personalize emails at scale, automate follow-ups, and land in the inbox. 98.7% deliverability. Start free.",
        creator: "@emailerio",
    },
    metadataBase: new URL("https://e-mailer.io"),
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

