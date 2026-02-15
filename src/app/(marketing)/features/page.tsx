import { Metadata } from "next";
import FeaturesShowcase from "@/components/marketing/FeaturesShowcase";

export const metadata: Metadata = {
    title: "Features — E-mailer | AI Cold Email Platform",
    description:
        "Explore every E-mailer feature: AI-powered email writing, smart multi-step sequences, 98.7% deliverability, real-time analytics, CRM sync, reply classification, and unlimited accounts.",
    alternates: { canonical: "https://e-mailer.io/features" },
    openGraph: {
        title: "Features — E-mailer | AI Cold Email Platform",
        description:
            "AI writing, smart sequences, 98.7% deliverability, real-time analytics, CRM sync, and more. See every feature.",
        url: "https://e-mailer.io/features",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "E-mailer Features — AI Cold Email That Gets Replies",
        description:
            "AI writing, smart sequences, 98.7% deliverability, real-time analytics. See every feature.",
    },
};

/* ─── JSON-LD Structured Data ─── */
const featuresSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "E-mailer Platform Features",
    description: "Complete list of E-mailer's cold email platform capabilities.",
    numberOfItems: 8,
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "AI-Powered Writing", description: "AI researches each prospect and writes personalized emails that feel hand-crafted." },
        { "@type": "ListItem", position: 2, name: "Smart Sequences", description: "Multi-step campaigns with conditional branching and auto-pause on reply." },
        { "@type": "ListItem", position: 3, name: "Email Warm-up", description: "Automatically build sender reputation with intelligent warm-up network." },
        { "@type": "ListItem", position: 4, name: "Spam Testing", description: "Test against major spam filters before sending with actionable fix suggestions." },
        { "@type": "ListItem", position: 5, name: "Real-time Analytics", description: "Track opens, clicks, and replies as they happen with live dashboards." },
        { "@type": "ListItem", position: 6, name: "CRM Integrations", description: "Two-way sync with Salesforce, HubSpot, and Pipedrive." },
        { "@type": "ListItem", position: 7, name: "Reply Classification", description: "AI classifies replies as positive, objection, or OoO and routes automatically." },
        { "@type": "ListItem", position: 8, name: "Multi-Account Support", description: "Connect unlimited email accounts with smart sender rotation." },
    ],
};

export default function FeaturesPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(featuresSchema) }}
            />
            <FeaturesShowcase />
        </>
    );
}
