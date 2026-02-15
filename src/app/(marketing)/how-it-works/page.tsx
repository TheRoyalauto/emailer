import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How E-mailer Works — From List to Reply in 3 Steps",
    description:
        "See exactly how E-mailer turns a contact list into booked meetings. Import contacts, let AI write personalized emails, and launch smart sequences — all in under 10 minutes.",
    alternates: { canonical: "https://e-mailer.io/how-it-works" },
    openGraph: {
        title: "How E-mailer Works — From List to Reply in 3 Steps",
        description:
            "Import contacts, let AI personalize every email, and launch smart sequences. See the full workflow.",
        url: "https://e-mailer.io/how-it-works",
        type: "website",
    },
};

const steps = [
    {
        number: "01",
        title: "Import & organize your contacts",
        description:
            "Upload a CSV, connect your CRM, or paste raw text — our AI parses everything into clean, de-duplicated contact records with company, role, and email verified automatically.",
        details: [
            "CSV, HubSpot, Salesforce, and Pipedrive imports",
            "AI-powered text parsing for unstructured data",
            "Automatic email verification & bounce prediction",
            "Smart de-duplication across all your lists",
            "Custom fields and tagging for segmentation",
        ],
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
    },
    {
        number: "02",
        title: "AI writes personalized emails",
        description:
            "E-mailer's AI researches each prospect — their company, role, recent activity, and industry — then writes a unique email that sounds like you spent 20 minutes on it. Not a template. Not a merge field. A real, context-aware message.",
        details: [
            "Prospect-level research and personalization",
            "Adapts to your writing style and tone of voice",
            "Subject line optimization with A/B testing",
            "Multi-variant generation — pick the best version",
            "Compliance checks for CAN-SPAM, GDPR, CASL",
        ],
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
        ),
    },
    {
        number: "03",
        title: "Launch smart sequences",
        description:
            "Set up multi-step campaigns with intelligent follow-ups. E-mailer automatically pauses when a prospect replies, adjusts send times for optimal open rates, and routes positive replies to your inbox instantly.",
        details: [
            "Multi-step sequences with conditional branching",
            "Auto-pause on reply, bounce, or out-of-office",
            "AI-optimized send times per recipient timezone",
            "Deliverability monitoring with reputation scoring",
            "Real-time analytics — opens, clicks, and replies",
        ],
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
        ),
    },
];

const metrics = [
    { value: "23%", label: "Avg. reply rate", note: "vs 2-5% industry average" },
    { value: "98.7%", label: "Deliverability", note: "inbox, not spam" },
    { value: "< 5 min", label: "Setup time", note: "first campaign live" },
    { value: "3.2×", label: "Pipeline increase", note: "within 30 days" },
];

const howItWorksSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Send AI-Personalized Cold Emails with E-mailer",
    description: "A 3-step guide to launching personalized cold email campaigns that book meetings.",
    totalTime: "PT10M",
    step: steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.title,
        text: s.description,
    })),
};

export default function HowItWorksPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }}
            />

            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">
                        How It Works
                    </p>
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        From contact list to booked meeting
                        <br />
                        <span className="text-cyan-600">in 3 steps</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
                        No templates. No manual research. Import your contacts, let AI write
                        truly personalized emails, and launch smart sequences — all in under
                        10 minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-800 active:scale-[0.98] transition-all"
                        >
                            Try It Free →
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                        >
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Metrics Bar */}
            <section className="py-10 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {metrics.map((m) => (
                            <div key={m.label} className="text-center">
                                <div className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.04em]">
                                    {m.value}
                                </div>
                                <div className="text-sm font-medium text-slate-700 mt-1">{m.label}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{m.note}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="space-y-20">
                        {steps.map((step, i) => (
                            <div key={step.number} className="relative">
                                {/* Connector Line */}
                                {i < steps.length - 1 && (
                                    <div className="absolute left-6 top-20 bottom-0 w-px bg-gradient-to-b from-cyan-200 to-transparent hidden lg:block" />
                                )}

                                <div className="flex items-start gap-6 lg:gap-10">
                                    {/* Step Number */}
                                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                                        {step.icon}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest">
                                                Step {step.number}
                                            </span>
                                        </div>
                                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                                            {step.title}
                                        </h2>
                                        <p className="text-slate-500 leading-relaxed mb-6 max-w-2xl">
                                            {step.description}
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                                            {step.details.map((d) => (
                                                <div key={d} className="flex items-start gap-2.5">
                                                    <svg className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    <span className="text-sm text-slate-600">{d}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* After the 3 steps */}
            <section className="py-20 lg:py-28 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">
                        Then What Happens?
                    </p>
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        Your inbox fills up with warm replies
                    </h2>
                    <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
                        E-mailer's AI classifies every response — positive, objection, out-of-office,
                        or not interested — and routes them accordingly. Positive replies surface
                        instantly. Everything else is handled automatically.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { label: "Positive replies", desc: "Surfaced to your inbox immediately with context", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                            { label: "Objections", desc: "AI drafts a response for your review", color: "bg-amber-50 text-amber-600 border-amber-100" },
                            { label: "Out of office", desc: "Sequence paused, auto-resumed when they return", color: "bg-slate-50 text-slate-500 border-slate-200" },
                        ].map((item) => (
                            <div key={item.label} className={`p-5 rounded-xl border ${item.color}`}>
                                <div className="font-heading text-sm font-semibold mb-1">{item.label}</div>
                                <p className="text-xs opacity-80">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] mb-4">
                        Ready to see it in action?
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Start your free 14-day trial. No credit card required. Launch your first
                        campaign in under 10 minutes.
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
