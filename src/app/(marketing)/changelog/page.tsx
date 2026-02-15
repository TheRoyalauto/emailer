import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Changelog — What's New in E-mailer",
    description:
        "Stay up to date with the latest product updates, new features, improvements, and fixes in E-mailer. See what we've shipped recently.",
    alternates: { canonical: "https://e-mailer.io/changelog" },
    openGraph: {
        title: "E-mailer Changelog — Latest Updates",
        description: "Product updates, new features, and improvements to E-mailer.",
        url: "https://e-mailer.io/changelog",
        type: "website",
    },
};

const releases = [
    {
        version: "2.8.0",
        date: "February 12, 2026",
        tag: "Major",
        tagColor: "bg-cyan-50 text-cyan-600",
        title: "AI Sequence Generation & Smart Scheduling",
        description: "Generate entire multi-step email sequences with AI. Our new smart scheduler automatically picks the optimal send time for each prospect based on their engagement history and timezone.",
        features: [
            "AI-powered sequence generation from a single prompt",
            "Smart send-time optimization per recipient",
            "Timezone-aware scheduling for global campaigns",
            "Sequence performance analytics dashboard",
        ],
    },
    {
        version: "2.7.2",
        date: "February 5, 2026",
        tag: "Improvement",
        tagColor: "bg-emerald-50 text-emerald-600",
        title: "Enhanced Deliverability Dashboard",
        description: "Complete overhaul of the deliverability monitoring experience. Real-time reputation tracking, DNS health checks, and proactive alerts before issues impact your campaigns.",
        features: [
            "Real-time domain reputation monitoring",
            "Automated SPF/DKIM/DMARC health checks",
            "Proactive deliverability alerts",
            "Inbox placement testing across Gmail, Outlook, Yahoo",
        ],
    },
    {
        version: "2.7.0",
        date: "January 28, 2026",
        tag: "Major",
        tagColor: "bg-cyan-50 text-cyan-600",
        title: "AI Contact Enrichment & Lead Scoring",
        description: "Automatically enrich contacts with company data, LinkedIn profiles, tech stack, and funding information. New AI-powered lead scoring predicts which prospects are most likely to respond.",
        features: [
            "Automatic contact enrichment from 50+ data sources",
            "AI lead scoring based on engagement probability",
            "Company technographic data",
            "LinkedIn profile matching and activity tracking",
        ],
    },
    {
        version: "2.6.1",
        date: "January 15, 2026",
        tag: "Fix",
        tagColor: "bg-amber-50 text-amber-600",
        title: "Performance & Stability Improvements",
        description: "Significant performance improvements across the platform, including faster campaign loading, reduced memory usage, and improved error handling.",
        features: [
            "50% faster campaign list loading",
            "Reduced memory usage for large contact lists",
            "Improved error messages and retry logic",
            "Fixed edge case in email threading",
        ],
    },
    {
        version: "2.6.0",
        date: "January 5, 2026",
        tag: "Major",
        tagColor: "bg-cyan-50 text-cyan-600",
        title: "A/B Testing for Subject Lines & Email Body",
        description: "Test up to 5 variants of subject lines or email body simultaneously. E-mailer automatically identifies winners and sends the best-performing variant to the remaining contacts.",
        features: [
            "Multi-variant A/B testing (up to 5 variants)",
            "Automatic winner detection with statistical significance",
            "Test subject lines, body copy, CTAs, and send times",
            "Detailed variant comparison analytics",
        ],
    },
    {
        version: "2.5.0",
        date: "December 18, 2025",
        tag: "Major",
        tagColor: "bg-cyan-50 text-cyan-600",
        title: "Unified Inbox & Reply Management",
        description: "All replies from your cold email campaigns are now unified in a single inbox. AI automatically categorizes responses as interested, meeting booked, not interested, or out of office.",
        features: [
            "Unified reply inbox across all campaigns",
            "AI-powered reply categorization",
            "One-click meeting scheduling from replies",
            "Automatic sequence pausing on reply",
        ],
    },
];

export default function ChangelogPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">Changelog</p>
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        What's new in E-mailer
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        The latest product updates, features, and improvements. We ship weekly.
                    </p>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="space-y-0">
                        {releases.map((release, i) => (
                            <div key={release.version} className="relative pl-8 pb-12 last:pb-0">
                                {/* Timeline line */}
                                {i < releases.length - 1 && (
                                    <div className="absolute left-[7px] top-3 bottom-0 w-px bg-slate-200" />
                                )}
                                {/* Timeline dot */}
                                <div className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-2 border-slate-300 bg-white" />

                                <div className="p-7 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 bg-white">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${release.tagColor}`}>
                                            {release.tag}
                                        </span>
                                        <span className="text-sm font-mono text-slate-400">v{release.version}</span>
                                        <span className="text-sm text-slate-400">·</span>
                                        <span className="text-sm text-slate-400">{release.date}</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="font-heading text-xl font-semibold text-slate-900 tracking-[-0.02em] mb-3">
                                        {release.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                        {release.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-2">
                                        {release.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                                                <svg className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] mb-4">
                        Try the latest features free
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Every new feature is available on all plans. Start free and get access to everything we ship.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-100 active:scale-[0.98] transition-all"
                    >
                        Start Free Trial →
                    </Link>
                </div>
            </section>
        </>
    );
}
