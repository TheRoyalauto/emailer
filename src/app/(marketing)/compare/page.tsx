import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "E-mailer vs Competitors — Cold Email Tool Comparison 2026",
    description:
        "See how E-mailer compares to Lemlist, Instantly, Smartlead, Woodpecker, and Apollo. Feature-by-feature comparison of pricing, AI, deliverability, and integrations.",
    alternates: { canonical: "https://e-mailer.io/compare" },
    openGraph: {
        title: "E-mailer vs Competitors — Cold Email Tool Comparison 2026",
        description: "Feature-by-feature comparison of the top cold email platforms.",
        url: "https://e-mailer.io/compare",
        type: "website",
    },
};

const competitors = [
    { name: "E-mailer", highlight: true },
    { name: "Lemlist", highlight: false },
    { name: "Instantly", highlight: false },
    { name: "Smartlead", highlight: false },
    { name: "Apollo", highlight: false },
];

type FeatureValue = boolean | string;

interface FeatureRow {
    feature: string;
    values: FeatureValue[];
}

interface FeatureCategory {
    category: string;
    features: FeatureRow[];
}

const comparisonData: FeatureCategory[] = [
    {
        category: "AI & Personalization",
        features: [
            { feature: "AI email writing", values: [true, true, false, false, true] },
            { feature: "Per-prospect research", values: [true, false, false, false, false] },
            { feature: "Writing style adaptation", values: [true, false, false, false, false] },
            { feature: "AI subject line A/B testing", values: [true, true, false, false, true] },
            { feature: "AI reply classification", values: [true, false, false, false, true] },
            { feature: "AI follow-up drafting", values: [true, false, false, false, false] },
        ],
    },
    {
        category: "Deliverability",
        features: [
            { feature: "Email warm-up", values: [true, true, true, true, false] },
            { feature: "Deliverability monitoring", values: [true, true, true, true, false] },
            { feature: "Domain reputation scoring", values: [true, false, false, true, false] },
            { feature: "Auto-throttling", values: [true, true, true, true, false] },
            { feature: "Bounce prediction", values: [true, false, false, false, false] },
            { feature: "Avg. inbox rate", values: ["98.7%", "~92%", "~94%", "~93%", "~88%"] },
        ],
    },
    {
        category: "Sequences & Automation",
        features: [
            { feature: "Multi-step sequences", values: [true, true, true, true, true] },
            { feature: "Conditional branching", values: [true, true, false, false, true] },
            { feature: "Auto-pause on reply", values: [true, true, true, true, true] },
            { feature: "Timezone-aware sending", values: [true, true, true, true, false] },
            { feature: "A/B testing (body)", values: [true, true, true, true, true] },
            { feature: "Smart send-time optimization", values: [true, false, false, false, false] },
        ],
    },
    {
        category: "Contacts & CRM",
        features: [
            { feature: "CSV import", values: [true, true, true, true, true] },
            { feature: "CRM integrations", values: ["3+", "3+", "Limited", "Limited", "Native"] },
            { feature: "AI text parsing import", values: [true, false, false, false, false] },
            { feature: "Email verification", values: [true, true, true, true, true] },
            { feature: "Contact enrichment", values: [true, true, false, false, true] },
            { feature: "Lead scoring", values: [true, false, false, false, true] },
        ],
    },
    {
        category: "Pricing & Value",
        features: [
            { feature: "Free trial", values: ["14 days", "14 days", "14 days", "14 days", "Freemium"] },
            { feature: "Starting price", values: ["$39/mo", "$59/mo", "$30/mo", "$39/mo", "$49/mo"] },
            { feature: "Unlimited email accounts", values: [true, false, true, true, false] },
            { feature: "Money-back guarantee", values: ["30 days", "No", "No", "No", "No"] },
        ],
    },
];

function CellValue({ value }: { value: FeatureValue }) {
    if (typeof value === "boolean") {
        return value ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        ) : (
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        );
    }
    return <span className="text-sm font-medium text-slate-700">{value}</span>;
}

export default function ComparePage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">
                        Comparisons
                    </p>
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        How E-mailer stacks up against
                        <br />
                        <span className="text-cyan-600">the competition</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        We built E-mailer because existing tools weren't good enough. Here's an honest,
                        feature-by-feature comparison so you can decide for yourself.
                    </p>
                </div>
            </section>

            {/* TLDR */}
            <section className="py-10 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Best AI personalization",
                                desc: "Only tool that researches each prospect individually and adapts to your writing style.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Highest deliverability",
                                desc: "98.7% average inbox rate with built-in warm-up, reputation scoring, and bounce prediction.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                ),
                            },
                            {
                                title: "Best value for money",
                                desc: "Unlimited email accounts, 30-day money-back guarantee, and features that cost extra elsewhere.",
                                icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                            },
                        ].map((advantage) => (
                            <div key={advantage.title} className="flex items-start gap-3 p-5 rounded-xl bg-cyan-50/50 border border-cyan-100/60">
                                <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-600 flex-shrink-0">
                                    {advantage.icon}
                                </div>
                                <div>
                                    <h3 className="font-heading text-sm font-semibold text-slate-900 mb-0.5">{advantage.title}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{advantage.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Tables */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="space-y-16">
                        {comparisonData.map((cat) => (
                            <div key={cat.category}>
                                <h2 className="font-heading text-xl lg:text-2xl font-semibold text-slate-900 tracking-[-0.02em] mb-6">
                                    {cat.category}
                                </h2>
                                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                                    {/* Header */}
                                    <div className="grid grid-cols-6 min-w-[700px]">
                                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                            Feature
                                        </div>
                                        {competitors.map((c) => (
                                            <div
                                                key={c.name}
                                                className={`px-4 py-3 border-b text-center text-xs font-semibold uppercase tracking-widest ${c.highlight
                                                        ? "bg-cyan-50 text-cyan-700 border-cyan-100"
                                                        : "bg-slate-50 text-slate-500 border-slate-200"
                                                    }`}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Rows */}
                                    {cat.features.map((row, i) => (
                                        <div
                                            key={row.feature}
                                            className={`grid grid-cols-6 min-w-[700px] ${i < cat.features.length - 1 ? "border-b border-slate-100" : ""
                                                }`}
                                        >
                                            <div className="px-5 py-4 text-sm text-slate-700 font-medium">
                                                {row.feature}
                                            </div>
                                            {row.values.map((val, vi) => (
                                                <div
                                                    key={vi}
                                                    className={`px-4 py-4 flex items-center justify-center ${vi === 0 ? "bg-cyan-50/30" : ""
                                                        }`}
                                                >
                                                    <CellValue value={val} />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why teams switch */}
            <section className="py-20 lg:py-28 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                            Why teams switch to E-mailer
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">
                            We hear the same reasons over and over from teams who've tried other tools first.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                quote: "Other tools generated generic templates. E-mailer actually researches each prospect and writes something I'd be proud to send.",
                                reason: "AI personalization that actually works",
                            },
                            {
                                quote: "Our deliverability went from 87% to 98% within the first week. We stopped landing in spam overnight.",
                                reason: "Deliverability is a core feature, not an afterthought",
                            },
                            {
                                quote: "We were paying $200/mo for Lemlist + a separate warm-up tool. E-mailer replaced both for less.",
                                reason: "Everything included at a lower price",
                            },
                            {
                                quote: "The reply classification changed our workflow. Positive replies are instant — everything else is triaged automatically.",
                                reason: "AI-powered inbox management",
                            },
                        ].map((item) => (
                            <div
                                key={item.reason}
                                className="p-7 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <p className="text-sm text-slate-500 leading-relaxed italic mb-4">"{item.quote}"</p>
                                <p className="text-sm font-semibold text-cyan-600">{item.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] mb-4">
                        See the difference yourself
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Start your free 14-day trial and compare the results. No credit card required.
                        30-day money-back guarantee if you upgrade.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-100 active:scale-[0.98] transition-all"
                        >
                            Start Free Trial →
                        </Link>
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                        >
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
