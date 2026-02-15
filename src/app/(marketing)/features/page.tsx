import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Features - E-mailer | AI Email Outreach Platform",
    description: "Explore E-mailer's powerful features: AI-powered writing, smart sequences, advanced analytics, deliverability tools, CRM integrations, and team collaboration.",
};

const features = [
    {
        category: "AI & Automation",
        items: [
            {
                icon: "🤖",
                title: "AI-Powered Writing",
                description: "Generate personalized, compelling emails in seconds. Our AI understands context, tone, and industry-specific language to write emails that sound authentically human.",
                highlights: ["Context-aware personalization", "Tone matching", "A/B test suggestions"],
            },
            {
                icon: "⚡",
                title: "Smart Sequences",
                description: "Build automated follow-up campaigns with conditional logic. Trigger messages based on opens, clicks, replies, or custom time delays.",
                highlights: ["Multi-step workflows", "Behavioral triggers", "Time-zone optimization"],
            },
            {
                icon: "🎯",
                title: "Lead Scoring",
                description: "Automatically prioritize your hottest prospects. Our AI analyzes engagement patterns to surface leads most likely to convert.",
                highlights: ["Engagement scoring", "Intent signals", "Reply prediction"],
            },
        ],
    },
    {
        category: "Deliverability",
        items: [
            {
                icon: "📨",
                title: "Email Warm-up",
                description: "Automatically build your sender reputation with our warm-up network. New accounts are production-ready in just 2-3 weeks.",
                highlights: ["Automated warm-up", "Reputation monitoring", "Gradual volume scaling"],
            },
            {
                icon: "🛡️",
                title: "Spam Testing",
                description: "Test your emails against major spam filters before sending. Get actionable suggestions to improve deliverability.",
                highlights: ["Pre-send testing", "Content analysis", "Blocklist monitoring"],
            },
            {
                icon: "📊",
                title: "Reputation Dashboard",
                description: "Monitor your domain and IP reputation in real-time. Get alerts before issues impact your campaigns.",
                highlights: ["Domain health score", "IP reputation", "Proactive alerts"],
            },
        ],
    },
    {
        category: "Analytics & Insights",
        items: [
            {
                icon: "📈",
                title: "Real-time Analytics",
                description: "Track opens, clicks, and replies as they happen. See exactly which messages resonate with your audience.",
                highlights: ["Live tracking", "Engagement heatmaps", "Reply analysis"],
            },
            {
                icon: "🔬",
                title: "A/B Testing",
                description: "Test subject lines, content, and send times to optimize performance. Let data drive your outreach strategy.",
                highlights: ["Statistical significance", "Multi-variant tests", "Auto-winner selection"],
            },
            {
                icon: "📋",
                title: "Custom Reports",
                description: "Build and share reports that matter to your team. Export to PDF or schedule automated delivery.",
                highlights: ["Drag-and-drop builder", "Scheduled exports", "Team sharing"],
            },
        ],
    },
    {
        category: "Integrations & Tools",
        items: [
            {
                icon: "🔗",
                title: "CRM Sync",
                description: "Two-way sync with Salesforce, HubSpot, Pipedrive, and more. Keep your pipeline updated without manual work.",
                highlights: ["Real-time sync", "Custom field mapping", "Activity logging"],
            },
            {
                icon: "📧",
                title: "Multi-Account Support",
                description: "Connect unlimited email accounts and rotate between them for better deliverability and higher volume.",
                highlights: ["Gmail & Outlook", "IMAP/SMTP support", "Rotation rules"],
            },
            {
                icon: "🔌",
                title: "API Access",
                description: "Build custom integrations with our REST API. Automate workflows and connect E-mailer to your existing stack.",
                highlights: ["RESTful API", "Webhooks", "SDKs available"],
            },
        ],
    },
];

export default function FeaturesPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                        Everything you need to scale outreach
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        From AI-powered writing to enterprise-grade deliverability, E-mailer gives you
                        all the tools to run successful email campaigns.
                    </p>
                </div>
            </section>

            {/* Feature Sections */}
            {features.map((section, i) => (
                <section
                    key={i}
                    className={`py-16 lg:py-24 ${i % 2 === 1 ? "bg-slate-50" : "bg-white"}`}
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-12 text-center">
                            {section.category}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {section.items.map((feature, j) => (
                                <div
                                    key={j}
                                    className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        {feature.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {feature.highlights.map((h, k) => (
                                            <li key={k} className="flex items-center gap-2 text-sm text-slate-500">
                                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* CTA */}
            <section className="py-20 lg:py-32 bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                        Ready to supercharge your outreach?
                    </h2>
                    <p className="text-xl text-sky-100 mb-10">
                        Start your free trial today. No credit card required.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex px-10 py-5 bg-white text-sky-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
                    >
                        Start Free Trial →
                    </Link>
                </div>
            </section>
        </>
    );
}

