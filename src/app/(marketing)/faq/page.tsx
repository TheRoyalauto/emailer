"use client";

import { useState } from "react";
import Link from "next/link";

const faqCategories = [
    {
        name: "General",
        questions: [
            {
                q: "What is E-mailer?",
                a: "E-mailer is an AI-powered email outreach platform designed for sales teams and businesses. It helps you send personalized cold emails at scale, automate follow-up sequences, and track engagement with advanced analytics.",
            },
            {
                q: "How is E-mailer different from other email tools?",
                a: "E-mailer combines AI-powered personalization, smart sequences, and deliverability tools in one platform. Our AI doesn't just fill in blanks—it understands context and writes compelling copy that sounds human. Plus, our built-in warm-up and reputation monitoring ensure your emails actually reach the inbox.",
            },
            {
                q: "Who is E-mailer best for?",
                a: "E-mailer is perfect for sales teams, recruiters, marketers, agencies, and anyone who needs to send personalized outreach at scale. Whether you're a solo founder or part of a large sales org, E-mailer scales with your needs.",
            },
        ],
    },
    {
        name: "Features",
        questions: [
            {
                q: "How does the AI writing work?",
                a: "Our AI analyzes successful cold emails and your provided context to generate personalized, compelling copy. Simply describe your offer, target audience, and tone—the AI handles the rest. You can edit and refine the output before sending.",
            },
            {
                q: "What are smart sequences?",
                a: "Smart sequences are automated email follow-ups that trigger based on recipient behavior. If someone opens but doesn't reply, you can automatically send a follow-up after 3 days. If they click a link, you might skip ahead to a different message. It's like having a sales assistant that never sleeps.",
            },
            {
                q: "Can I connect my existing email accounts?",
                a: "Yes! E-mailer works with Gmail, Google Workspace, Outlook, and any IMAP/SMTP email provider. You can connect multiple accounts and rotate between them for better deliverability.",
            },
            {
                q: "Do you integrate with CRMs?",
                a: "Absolutely. We integrate with Salesforce, HubSpot, Pipedrive, and more. Contacts sync automatically, and email activity is logged to your CRM in real-time.",
            },
        ],
    },
    {
        name: "Deliverability",
        questions: [
            {
                q: "How do you ensure emails don't go to spam?",
                a: "We use multiple techniques: automated email warm-up for new accounts, reputation monitoring, spam content checking, sending limits that mimic human behavior, and dedicated IP options for high-volume senders. Our average deliverability rate is 98.7%.",
            },
            {
                q: "What is email warm-up?",
                a: "Email warm-up is a process that gradually builds your email account's reputation by sending and receiving emails with established accounts. This signals to email providers that your account is legitimate, improving deliverability for your cold outreach.",
            },
            {
                q: "Can I use my own domain?",
                a: "Yes, and we highly recommend it. Using your own domain with proper SPF, DKIM, and DMARC records significantly improves deliverability. We provide step-by-step guides for setting this up.",
            },
        ],
    },
    {
        name: "Billing",
        questions: [
            {
                q: "Do you offer a free plan?",
                a: "Yes! Our Starter plan is completely free and includes 500 emails per month. It's perfect for individuals just getting started with cold outreach.",
            },
            {
                q: "Can I cancel anytime?",
                a: "Absolutely. There are no long-term contracts. You can upgrade, downgrade, or cancel your plan at any time from your account settings.",
            },
            {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 30 days of your purchase for a full refund.",
            },
            {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal. Enterprise customers can also pay via invoice.",
            },
        ],
    },
    {
        name: "Security",
        questions: [
            {
                q: "Is my data secure?",
                a: "Absolutely. We use bank-grade encryption (AES-256) for all data at rest and TLS 1.3 for data in transit. We're SOC 2 Type II compliant and regularly conduct security audits.",
            },
            {
                q: "Are you GDPR compliant?",
                a: "Yes. We're fully GDPR compliant and provide tools to help you stay compliant too, including easy unsubscribe management, consent tracking, and data export/deletion requests.",
            },
            {
                q: "Where is my data stored?",
                a: "Your data is stored in secure AWS data centers. US customers' data is stored in the US, and EU customers can request EU data residency.",
            },
        ],
    },
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState("General");
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    const currentCategory = faqCategories.find((c) => c.name === activeCategory);

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Everything you need to know about E-mailer. Can't find what you're looking for?{" "}
                        <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Contact our support team
                        </Link>
                        .
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16 lg:py-24">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 mb-12 justify-center">
                        {faqCategories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => {
                                    setActiveCategory(cat.name);
                                    setOpenQuestion(null);
                                }}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all ${activeCategory === cat.name
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                        {currentCategory?.questions.map((item, i) => (
                            <div
                                key={i}
                                className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all hover:border-slate-300"
                            >
                                <button
                                    onClick={() => setOpenQuestion(openQuestion === item.q ? null : item.q)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                                >
                                    <span className="font-semibold text-slate-900 pr-4">{item.q}</span>
                                    <svg
                                        className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${openQuestion === item.q ? "rotate-180" : ""
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openQuestion === item.q && (
                                    <div className="px-6 pb-5">
                                        <p className="text-slate-600 leading-relaxed">{item.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Still have questions CTA */}
            <section className="py-16 lg:py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Our team is here to help. Reach out and we'll get back to you within 24 hours.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Contact Support →
                        </Link>
                        <Link
                            href="/docs"
                            className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                            Browse Documentation
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

