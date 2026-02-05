"use client";

import { useState } from "react";
import Link from "next/link";

const faqCategories = [
    {
        name: "All",
        questions: [], // Will be computed dynamically
    },
    {
        name: "General",
        questions: [
            {
                q: "What is E-mailer and how does it work?",
                a: "E-mailer is an AI-powered cold email outreach platform that helps businesses send personalized emails at scale. It works by connecting your email accounts, importing leads, using AI to generate personalized messages, and automating follow-up sequences. The platform handles deliverability, tracking, and analytics—so you can focus on closing deals.",
            },
            {
                q: "How is E-mailer different from Mailchimp, HubSpot, or other email tools?",
                a: "Unlike marketing platforms like Mailchimp (built for newsletters) or complex CRMs like HubSpot, E-mailer is purpose-built for cold outreach. Our AI writes contextually-aware emails that sound human, not templated. We include built-in warm-up, deliverability monitoring, and smart sequences—features that usually require multiple expensive tools.",
            },
            {
                q: "Who should use E-mailer? What industries is it best for?",
                a: "E-mailer is ideal for B2B sales teams, SDRs, founders doing outbound, recruiters, agencies, and anyone who needs to send personalized cold outreach at scale. It works across all industries: SaaS, consulting, real estate, financial services, recruiting, and more. Whether you're sending 50 or 50,000 emails per month, E-mailer scales with you.",
            },
            {
                q: "Is E-mailer suitable for beginners with no cold email experience?",
                a: "Absolutely. E-mailer is designed to be dead simple. Our AI writes your emails, smart defaults handle deliverability settings, and guided onboarding gets you sending in under 10 minutes. No technical expertise required—if you can write an email, you can use E-mailer.",
            },
            {
                q: "Can E-mailer replace my current sales engagement tool?",
                a: "Yes. E-mailer combines email writing, sequencing, warm-up, tracking, and analytics into one platform. Most users replace 2-4 tools (like Lemlist + Instantly + ChatGPT + spreadsheets) with just E-mailer, saving hundreds per month.",
            },
        ],
    },
    {
        name: "Features",
        questions: [
            {
                q: "How does E-mailer's AI email writing work?",
                a: "Our AI analyzes your offer, target audience, and tone preferences to generate personalized cold emails. It doesn't just fill in {{firstName}}—it researches context and writes compelling, human-sounding copy. You can generate emails individually or in bulk, then edit and refine before sending.",
            },
            {
                q: "What are smart sequences and automated follow-ups?",
                a: "Smart sequences are multi-step email campaigns that trigger based on recipient behavior. For example: send Email 1, wait 3 days, if no reply send Email 2, if they click a link skip to Email 3. The AI optimizes timing and content to maximize reply rates.",
            },
            {
                q: "Can I connect Gmail, Outlook, and other email accounts?",
                a: "Yes! E-mailer supports Gmail, Google Workspace, Outlook/Office 365, and any email provider via IMAP/SMTP. You can connect multiple accounts and rotate between them automatically for better deliverability and higher sending volumes.",
            },
            {
                q: "Does E-mailer integrate with Salesforce, HubSpot, and other CRMs?",
                a: "Yes. We offer native integrations with Salesforce, HubSpot, Pipedrive, Zoho, and more. Contacts sync bidirectionally, email activity is logged automatically, and you can trigger sequences based on CRM events.",
            },
            {
                q: "What analytics and tracking does E-mailer provide?",
                a: "E-mailer tracks opens, clicks, replies, bounces, and unsubscribes in real-time. Our dashboard shows campaign performance, A/B test results, best send times, and engagement trends. You'll know exactly who's interested and when to follow up.",
            },
            {
                q: "Can I import leads from CSV, LinkedIn, or other sources?",
                a: "Yes. Import leads via CSV upload, LinkedIn Sales Navigator, Apollo, ZoomInfo, or paste directly from spreadsheets. Our AI can also parse unstructured text (like copied business listings) into organized contacts.",
            },
            {
                q: "Does E-mailer support A/B testing for email campaigns?",
                a: "Yes. Test different subject lines, email copy, send times, and sequences. E-mailer automatically determines winning variations and can shift traffic to top performers. Split test up to 5 variations per campaign.",
            },
        ],
    },
    {
        name: "Deliverability",
        questions: [
            {
                q: "How does E-mailer ensure my emails don't go to spam?",
                a: "We use multiple techniques: automated email warm-up for new accounts, reputation monitoring, spam content checking, human-like sending patterns, dedicated IP options, and deliverability scoring. Our average inbox placement rate is 98.7%.",
            },
            {
                q: "What is email warm-up and why is it important?",
                a: "Email warm-up gradually builds your sender reputation by exchanging emails with established accounts. This signals to Gmail/Outlook that you're legitimate, not a spammer. E-mailer's built-in warm-up runs automatically—just connect your account and we handle the rest.",
            },
            {
                q: "Do I need my own domain for cold email? How do I set it up?",
                a: "Yes, using your own domain with proper authentication (SPF, DKIM, DMARC) dramatically improves deliverability. E-mailer provides step-by-step guides and automatic verification. We recommend using a secondary domain (like yourbrand.io) to protect your main domain's reputation.",
            },
            {
                q: "What sending limits does E-mailer enforce?",
                a: "Sending limits depend on your email provider and account age. New accounts start at 50-100 emails/day and gradually increase. E-mailer automatically manages these limits and distributes sends across connected accounts to maximize volume while maintaining deliverability.",
            },
            {
                q: "How does E-mailer handle bounces and invalid emails?",
                a: "E-mailer validates email addresses before sending and automatically removes hard bounces from your lists. High bounce rates hurt deliverability, so we proactively catch invalid emails. You can also use our email verification API to clean lists before import.",
            },
        ],
    },
    {
        name: "Billing",
        questions: [
            {
                q: "Is there a free plan? What's included?",
                a: "Yes! Our Starter plan is completely free forever and includes 500 emails per month, 1 connected email account, AI email writing, and basic analytics. No credit card required to start.",
            },
            {
                q: "How much does E-mailer cost? What are the pricing tiers?",
                a: "E-mailer offers three tiers: Starter (free, 500 emails/mo), Growth ($49/mo, 5,000 emails, 5 accounts, advanced features), and Scale ($149/mo, 25,000 emails, unlimited accounts, priority support). Annual plans save 20%. See our pricing page for full details.",
            },
            {
                q: "Can I cancel my E-mailer subscription at any time?",
                a: "Yes. No contracts, no cancellation fees. Cancel anytime from your account settings. You'll retain access until the end of your billing period.",
            },
            {
                q: "Does E-mailer offer refunds?",
                a: "Yes. We offer a 30-day money-back guarantee on all paid plans. If E-mailer isn't right for you, contact support within 30 days for a full refund, no questions asked.",
            },
            {
                q: "What payment methods does E-mailer accept?",
                a: "We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, and Google Pay. Enterprise customers can pay via invoice with NET-30 terms.",
            },
            {
                q: "Do you offer discounts for startups or nonprofits?",
                a: "Yes! We offer 50% off for early-stage startups (under $1M raised) and registered nonprofits. Contact support with verification to apply the discount.",
            },
        ],
    },
    {
        name: "Security",
        questions: [
            {
                q: "Is my data secure with E-mailer?",
                a: "Absolutely. We use AES-256 encryption for data at rest, TLS 1.3 for data in transit, and follow security best practices. E-mailer is SOC 2 Type II compliant, and we conduct regular third-party security audits.",
            },
            {
                q: "Is E-mailer GDPR and CCPA compliant?",
                a: "Yes. We're fully GDPR and CCPA compliant. E-mailer provides tools for consent management, easy unsubscribe handling, data export, and deletion requests. We also offer a Data Processing Agreement (DPA) for enterprise customers.",
            },
            {
                q: "Where is E-mailer data stored?",
                a: "Data is stored in secure AWS data centers with SOC 2 certification. US customers' data resides in US-East. EU customers can request EU data residency for GDPR compliance.",
            },
            {
                q: "Do you sell or share my contact data?",
                a: "Never. Your data is yours. We don't sell, share, or use your contacts for any purpose other than powering E-mailer for you. See our Privacy Policy for details.",
            },
            {
                q: "What happens to my data if I cancel?",
                a: "Upon cancellation, you can export all your data. After 30 days, data is permanently deleted from our servers. Enterprise customers can request immediate deletion.",
            },
        ],
    },
    {
        name: "Support",
        questions: [
            {
                q: "How do I contact E-mailer support?",
                a: "Email us at support@e-mailer.app or use the chat widget in-app. Growth and Scale plans include priority support with responses within 4 hours during business hours.",
            },
            {
                q: "Does E-mailer offer onboarding or training?",
                a: "Yes! All users get access to our video tutorials and knowledge base. Growth plans include a 30-minute onboarding call. Scale plans include dedicated account management and custom training.",
            },
            {
                q: "Is there a community or forum for E-mailer users?",
                a: "Yes! Join our Slack community with 5,000+ cold email practitioners. Share templates, get feedback, and learn from power users. Link available in your dashboard.",
            },
            {
                q: "What are E-mailer's support hours?",
                a: "Our support team is available Monday-Friday, 9am-6pm EST. Scale plan customers get 24/7 emergency support. Self-service resources are available anytime.",
            },
        ],
    },
];

// Compute "All" category by combining all questions from other categories
const allQuestions = faqCategories.slice(1).flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.name }))
);
faqCategories[0].questions = allQuestions;

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState("All");
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
                        <a href="mailto:support@e-mailer.app" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Contact our support team
                        </a>
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
                    <a
                        href="mailto:support@e-mailer.app"
                        className="inline-block px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        Contact Support →
                    </a>
                </div>
            </section>
        </>
    );
}
