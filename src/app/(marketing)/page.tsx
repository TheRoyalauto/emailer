import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "E-mailer — #1 AI Cold Email Platform | Send Emails That Get Replies",
    description:
        "E-mailer is the AI-powered cold email platform trusted by hundreds of sales teams. Automate personalized outreach, smart follow-ups, and land in the inbox — not spam. Start free.",
    alternates: { canonical: "https://e-mailer.io" },
    openGraph: {
        title: "E-mailer — #1 AI Cold Email Platform",
        description: "Automate personalized outreach at scale. 98.7% deliverability. Trusted by hundreds of sales teams.",
        url: "https://e-mailer.io",
        siteName: "E-mailer",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "E-mailer — AI Cold Email That Actually Works",
        description: "Automate personalized outreach at scale. 98.7% deliverability. Start free, no credit card.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
};

/* ─── JSON-LD Structured Data ─── */
const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "E-mailer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "AI-powered cold email outreach platform for sales teams. Personalized emails, smart sequences, and 98.7% deliverability.",
    url: "https://e-mailer.io",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free 14-day trial",
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "127",
        bestRating: "5",
    },
};

const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "E-mailer",
    url: "https://e-mailer.io",
    logo: "https://e-mailer.io/logo.png",
    sameAs: [
        "https://twitter.com/emailerio",
        "https://linkedin.com/company/emailerio",
        "https://github.com/emailerio",
    ],
};

/* ─── Feature Data ─── */
const features = [
    {
        title: "AI-Powered Personalization",
        description: "Our AI reads your prospect's LinkedIn, company site, and recent news — then writes emails that feel hand-crafted. Not templates. Real personalization at scale.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
        ),
    },
    {
        title: "Multi-Step Smart Sequences",
        description: "Automate follow-ups with conditional logic. Trigger next steps based on opens, clicks, or replies. Stop manually chasing prospects forever.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
        ),
    },
    {
        title: "98.7% Inbox Deliverability",
        description: "Built-in warm-up, spam testing, and domain reputation monitoring. We don't just send emails — we make sure they land where they should.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
    {
        title: "Real-Time Campaign Analytics",
        description: "Track opens, clicks, replies, and conversions as they happen. Know exactly what's working so you can double down on winning messages.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
    },
    {
        title: "Native CRM Integration",
        description: "Two-way sync with Salesforce, HubSpot, and Pipedrive. Every reply, open, and meeting auto-logs to your CRM. Zero manual entry.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
        ),
    },
    {
        title: "Unlimited Team Seats",
        description: "Share templates, track team performance, enforce brand voice. Built for teams of 2 or 200 — with role-based access and shared analytics.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
        ),
    },
];

const stats = [
    { value: "1M+", label: "Emails delivered", detail: "and counting" },
    { value: "98.7%", label: "Inbox placement", detail: "industry-leading" },
    { value: "3.2×", label: "More replies", detail: "vs. manual outreach" },
    { value: "500+", label: "Sales teams", detail: "since Jan 2025 · growing fast" },
];

const testimonials = [
    {
        quote: "We went from 2% to 18% reply rates in 30 days. Our SDR team basically doubled their pipeline overnight. The AI personalization is genuinely better than what our reps write manually.",
        author: "Sarah Chen",
        role: "VP of Sales",
        company: "Meridian Cloud",
        avatar: "SC",
        metric: "9× reply rate increase",
    },
    {
        quote: "We replaced Outreach, Apollo, and Warmbox with E-mailer. One tool, less cost, better results. The deliverability suite alone pays for itself — we went from 72% to 99% inbox placement.",
        author: "Marcus Rodriguez",
        role: "Revenue Operations",
        company: "Prism Analytics",
        avatar: "MR",
        metric: "3 tools consolidated",
    },
    {
        quote: "I was skeptical of another AI email tool. Then I saw the sequences it built. The conditional logic and timing optimization generated 47 qualified meetings in our first month.",
        author: "Emily Watson",
        role: "Head of Growth",
        company: "Flux Dynamics",
        avatar: "EW",
        metric: "47 meetings in month 1",
    },
];

const integrations = [
    "Salesforce", "HubSpot", "Pipedrive", "Slack", "Zapier", "Calendly", "Gmail", "Outlook",
];

export default function LandingPage() {
    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
            />

            {/* ═══════════════════════════════════════════════════
                 HERO — Above the fold. Single focus. One CTA.
                 ═══════════════════════════════════════════════════ */}
            <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
                {/* Background — refined, not gradient soup */}
                <div className="absolute inset-0 bg-[#FAFBFC]" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-50/60 rounded-full blur-[150px] translate-x-1/4 -translate-y-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100/80 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Social Proof Micro-Badge */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-slate-200/80 bg-white/60 backdrop-blur-sm text-slate-500 rounded-lg text-sm mb-8 shadow-sm">
                            <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <span className="font-medium text-slate-700">2,847 emails sent</span>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>in the last hour</span>
                        </div>

                        {/* H1 — The single most important SEO element on the page */}
                        <h1 className="font-heading text-[2.75rem] sm:text-6xl lg:text-[5rem] font-semibold text-slate-900 leading-[1.05] tracking-[-0.04em] mb-6">
                            Cold emails that
                            <span className="block text-cyan-500">
                                actually get replies
                            </span>
                        </h1>

                        {/* Value proposition — keyword-rich, benefit-first */}
                        <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                            E-mailer uses AI to write, personalize, and send cold email campaigns
                            that land in the inbox — not spam. Automate follow-ups, track every open
                            and reply, and close deals 3× faster.
                        </p>

                        {/* Primary CTA — single clear action */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                            <Link
                                href="/register"
                                id="hero-cta-primary"
                                className="group w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-800 active:scale-[0.98] transition-all text-lg inline-flex items-center justify-center gap-2"
                            >
                                Start Free — No Card Required
                                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                href="/demo"
                                id="hero-cta-secondary"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-lg inline-flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Watch 2-Min Demo
                            </Link>
                        </div>

                        {/* Trust Signals — reduce friction immediately */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Free 14-day trial
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                No credit card required
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Cancel anytime
                            </span>
                        </div>
                    </div>

                    {/* Product Screenshot / Preview */}
                    <div className="mt-16 lg:mt-24 relative" aria-hidden="true">
                        <div className="relative mx-auto max-w-5xl">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFBFC] via-transparent to-transparent z-10 pointer-events-none" />
                            <div className="bg-slate-900 rounded-xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-800">
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                                    <span className="ml-4 text-[13px] text-slate-500 font-mono">app.e-mailer.io/campaigns</span>
                                </div>
                                <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
                                    <div className="w-full max-w-3xl mx-auto grid grid-cols-3 gap-4">
                                        {/* Fake dashboard cards */}
                                        <div className="col-span-2 bg-white/5 rounded-lg p-5 border border-white/10">
                                            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-3">Campaign Performance</div>
                                            <div className="flex items-end gap-1.5 h-16">
                                                {[35, 42, 38, 55, 48, 62, 58, 72, 65, 78, 82, 75].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-cyan-500/30 rounded-sm" style={{ height: `${h}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-5 border border-white/10 flex flex-col justify-between">
                                            <div className="text-[11px] text-slate-500 uppercase tracking-wider">Reply Rate</div>
                                            <div className="font-heading text-3xl font-semibold text-cyan-400 tracking-[-0.04em]">18.4%</div>
                                            <div className="text-[11px] text-emerald-400">↑ 340% vs avg</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Active Sequences</div>
                                            <div className="font-heading text-2xl font-semibold text-white tracking-[-0.03em]">12</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Emails Today</div>
                                            <div className="font-heading text-2xl font-semibold text-white tracking-[-0.03em]">1,847</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Deliverability</div>
                                            <div className="font-heading text-2xl font-semibold text-emerald-400 tracking-[-0.03em]">99.1%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 SOCIAL PROOF BAR — Logos / integration badges
                 ═══════════════════════════════════════════════════ */}
            <section className="py-12 bg-white border-y border-slate-100" aria-label="Integrations">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <p className="text-center text-sm text-slate-400 mb-8 tracking-wide uppercase font-medium">
                        Works with the tools you already use
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                        {integrations.map((name) => (
                            <span key={name} className="text-slate-300 font-heading font-semibold text-lg tracking-[-0.02em] hover:text-slate-500 transition-colors cursor-default">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 STATS — Hard numbers build trust
                 ═══════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-28 bg-white" aria-label="Platform statistics">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="font-heading text-4xl lg:text-[3.5rem] font-semibold tracking-[-0.04em] text-slate-900 mb-1 leading-none">
                                    {stat.value}
                                </div>
                                <div className="text-slate-900 font-medium text-sm mb-0.5">{stat.label}</div>
                                <div className="text-slate-400 text-sm">{stat.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 FEATURES — Benefit-driven, not feature-listing
                 ═══════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-32 bg-[#FAFBFC]" id="features" aria-label="Features">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="font-heading text-3xl lg:text-[2.75rem] font-semibold text-slate-900 tracking-[-0.03em] mb-5 leading-tight">
                            Everything you need to turn cold prospects into warm conversations
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            Six core capabilities. Zero bloat. Every feature exists because it directly
                            impacts your reply rates, deliverability, or team efficiency.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, i) => (
                            <article
                                key={i}
                                className="group p-7 lg:p-8 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-5 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="font-heading text-[17px] font-semibold text-slate-900 tracking-[-0.02em] mb-2.5">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-[15px]">
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 SOCIAL PROOF — Testimonials with metrics
                 ═══════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-32 bg-slate-900 text-white" aria-label="Customer testimonials">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="font-heading text-3xl lg:text-[2.75rem] font-semibold tracking-[-0.03em] mb-5 leading-tight">
                            Sales teams ship more pipeline with E-mailer
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            Don&apos;t take our word for it. Here&apos;s what revenue leaders say after switching.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {testimonials.map((t, i) => (
                            <article
                                key={i}
                                className="flex flex-col p-7 lg:p-8 bg-white/[0.04] rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                            >
                                {/* Result metric — the most persuasive element */}
                                <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-semibold mb-6 tracking-[-0.01em]">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                                    </svg>
                                    {t.metric}
                                </div>

                                {/* Quote */}
                                <blockquote className="flex-1 mb-6">
                                    <p className="font-heading text-[16px] text-slate-200 leading-relaxed tracking-[-0.01em]">
                                        &ldquo;{t.quote}&rdquo;
                                    </p>
                                </blockquote>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-semibold text-slate-300 tracking-wide">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white text-sm">{t.author}</div>
                                        <div className="text-sm text-slate-500">{t.role}, {t.company}</div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 HOW IT WORKS — Reduce perceived complexity
                 ═══════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-32 bg-white" id="how-it-works" aria-label="How it works">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="font-heading text-3xl lg:text-[2.75rem] font-semibold text-slate-900 tracking-[-0.03em] mb-5 leading-tight">
                            From zero to booked meetings in under 10 minutes
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            No implementation calls. No onboarding queues. Three steps and you&apos;re live.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 lg:gap-16">
                        {[
                            {
                                step: "01",
                                title: "Import your leads",
                                description: "Upload a CSV, paste a list, or connect your CRM. E-mailer auto-verifies emails and enriches contacts with company data, job titles, and recent activity.",
                            },
                            {
                                step: "02",
                                title: "Let AI write your campaign",
                                description: "Describe your offer in one sentence. Our AI generates a full multi-step sequence — subject lines, body copy, and follow-ups — personalized for each prospect.",
                            },
                            {
                                step: "03",
                                title: "Launch and watch replies roll in",
                                description: "Hit send. E-mailer handles delivery timing, follow-ups, and warm-up. You get real-time notifications when prospects reply, open, or click.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="text-center lg:text-left">
                                <div className="font-heading text-6xl lg:text-7xl font-semibold tracking-[-0.05em] text-slate-100 mb-4 select-none">
                                    {item.step}
                                </div>
                                <h3 className="font-heading text-xl font-semibold text-slate-900 tracking-[-0.02em] mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-[15px]">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 BOTTOM CTA — Last chance conversion
                 ═══════════════════════════════════════════════════ */}
            <section className="py-20 lg:py-32 bg-slate-900 text-white" aria-label="Get started">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-3xl lg:text-5xl font-semibold tracking-[-0.04em] mb-6 leading-tight">
                        Your competitors are already using AI to book more meetings.
                    </h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Hundreds of sales teams send smarter with E-mailer.
                        Start your free trial and see results in your first week.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            id="bottom-cta-primary"
                            className="group w-full sm:w-auto px-10 py-5 bg-white text-slate-900 font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-100 active:scale-[0.98] transition-all text-lg inline-flex items-center justify-center gap-2"
                        >
                            Start Your Free Trial
                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link
                            href="/pricing"
                            id="bottom-cta-secondary"
                            className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            View pricing →
                        </Link>
                    </div>
                    <p className="mt-8 text-slate-500 text-sm">
                        Free 14-day trial · No credit card · Setup in under 5 minutes
                    </p>
                </div>
            </section>
        </>
    );
}
