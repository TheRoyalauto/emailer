"use client";

import Link from "next/link";
import { useState } from "react";

const categories = ["All", "Getting Started", "Billing", "Features", "Security", "Support"];

const faqs = [
    {
        category: "Getting Started",
        question: "How do I get started with E-mailer?",
        answer: "Sign up for a free account, connect your email, and you can start sending campaigns immediately. Our onboarding wizard walks you through everything in about 5 minutes.",
    },
    {
        category: "Getting Started",
        question: "Can I import my existing contacts?",
        answer: "Yes. Upload a CSV, connect your CRM (Salesforce, HubSpot, Pipedrive), or use our AI to parse contact lists from any text format.",
    },
    {
        category: "Getting Started",
        question: "Is there a free trial?",
        answer: "Yes — 14 days, full access to all features, no credit card required. If you need more time, just reach out and we'll extend it.",
    },
    {
        category: "Billing",
        question: "What happens if I exceed my email limit?",
        answer: "We'll notify you when you hit 80% of your monthly limit. You can upgrade mid-cycle and the price difference is prorated.",
    },
    {
        category: "Billing",
        question: "Can I cancel anytime?",
        answer: "Absolutely. No long-term contracts. Cancel from your dashboard settings in two clicks. Your data stays available for 30 days after cancellation.",
    },
    {
        category: "Billing",
        question: "Do you offer refunds?",
        answer: "We offer a 30-day money-back guarantee on all plans. If E-mailer isn't working for you, email support and we'll process a full refund.",
    },
    {
        category: "Features",
        question: "How does the AI writing work?",
        answer: "Our AI analyzes your prospect's profile, company, and industry to generate personalized emails. It learns from your writing style and adapts over time to match your tone.",
    },
    {
        category: "Features",
        question: "What integrations are available?",
        answer: "We integrate with Salesforce, HubSpot, Pipedrive, Slack, Zapier, and more. Our API and webhooks also allow custom integrations with any tool.",
    },
    {
        category: "Features",
        question: "Can I automate follow-ups?",
        answer: "Yes. Smart Sequences let you build multi-step campaigns with conditional logic. Set triggers based on opens, clicks, replies, or time delays.",
    },
    {
        category: "Security",
        question: "Is my data secure?",
        answer: "We use AES-256 encryption at rest, TLS 1.3 in transit, and are SOC 2 Type II certified. We never sell or share your data.",
    },
    {
        category: "Security",
        question: "Are you GDPR compliant?",
        answer: "Yes. We provide tools for data export, deletion requests, and consent management. Our DPA is available on request.",
    },
    {
        category: "Support",
        question: "What kind of support do you offer?",
        answer: "Starter plans get email support (24hr response). Professional gets priority chat support (1hr response). Enterprise gets a dedicated account manager and phone support.",
    },
    {
        category: "Support",
        question: "Do you offer onboarding help?",
        answer: "All plans include access to our knowledge base and video tutorials. Professional and Enterprise plans include live onboarding sessions with our team.",
    },
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const filtered = activeCategory === "All"
        ? faqs
        : faqs.filter((f) => f.category === activeCategory);

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Find answers to common questions about E-mailer. Can&apos;t find what you&apos;re looking for?{" "}
                        <Link href="/contact" className="text-cyan-500 hover:text-cyan-600 transition-colors">
                            Contact us
                        </Link>.
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 mb-12 justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveCategory(cat);
                                    setOpenIndex(null);
                                }}
                                className={`px-4 py-2 text-sm tracking-[-0.01em] rounded-lg transition-colors ${activeCategory === cat
                                    ? "bg-slate-900 text-white font-semibold"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-3">
                        {filtered.map((faq, i) => {
                            const isOpen = openIndex === i;
                            return (
                                <div
                                    key={i}
                                    className={`border rounded-xl transition-colors ${isOpen ? "border-slate-300 bg-slate-50" : "border-slate-200"
                                        }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-heading font-semibold text-slate-900 tracking-[-0.02em] pr-4">
                                            {faq.question}
                                        </span>
                                        <svg
                                            className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6">
                                            <p className="text-slate-500 leading-relaxed text-[15px]">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Still Have Questions CTA */}
            <section className="py-16 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Our team is here to help. Reach out and we&apos;ll get back to you within hours.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-100 active:scale-[0.98] transition-all"
                    >
                        Contact Support →
                    </Link>
                </div>
            </section>
        </>
    );
}
