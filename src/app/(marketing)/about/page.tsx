import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About E-mailer — The Team Behind AI-Powered Cold Email",
    description:
        "E-mailer was built by a team of sales engineers, deliverability experts, and AI researchers who got tired of generic outreach tools. Learn our story and mission.",
    alternates: { canonical: "https://e-mailer.io/about" },
    openGraph: {
        title: "About E-mailer — The Team Behind AI Cold Email",
        description: "Built by people who got tired of generic outreach tools.",
        url: "https://e-mailer.io/about",
        type: "website",
    },
};

const stats = [
    { value: "500+", label: "Sales teams" },
    { value: "98.7%", label: "Avg. deliverability" },
    { value: "3.2×", label: "More replies" },
    { value: "2025", label: "Founded" },
];

const values = [
    {
        title: "Deliverability is sacred",
        description:
            "Every feature we build is filtered through one question: does this help or hurt inbox placement? We will never ship a feature that compromises deliverability for convenience.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
    },
    {
        title: "Personalization at machine scale",
        description:
            "We believe every cold email should feel hand-written. Our AI doesn't just fill in merge fields — it researches, understands context, and writes like a human who's done their homework.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
        ),
    },
    {
        title: "Data over opinions",
        description:
            "We A/B test everything. Every subject line recommendation, every send-time optimization, every piece of advice in our blog is backed by real data from millions of emails.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
        ),
    },
    {
        title: "Transparency by default",
        description:
            "No hidden fees, no fake scarcity, no dark patterns. We publish our pricing, explain how our AI works, and give you full control over your data. Always.",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

const team = [
    { name: "Artur A.", role: "Founder & CEO", avatar: "AA", bio: "Sales-obsessed builder from Los Angeles. Got tired of every cold email tool feeling broken, so he built one that works." },
    { name: "Daniel R.", role: "Head of Engineering", avatar: "DR", bio: "Full-stack engineer with a background in scalable systems. Keeps the platform fast and the infrastructure tight." },
    { name: "Chris H.", role: "Head of Product", avatar: "CH", bio: "Former product lead at two SaaS startups. Obsessed with simplicity and making features that people actually use." },
    { name: "Maya L.", role: "Head of Deliverability", avatar: "ML", bio: "Email infrastructure specialist. Makes sure every message lands in the inbox, not spam." },
    { name: "Sofia N.", role: "Head of Growth", avatar: "SN", bio: "Data-driven marketer who's built acquisition channels from zero. Runs content, partnerships, and outbound." },
];

export default function AboutPage() {
    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "E-mailer",
        url: "https://e-mailer.io",
        logo: "https://e-mailer.io/logo.png",
        description: "AI-powered cold email outreach platform for modern sales teams. Personalization at machine scale with industry-leading deliverability.",
        foundingDate: "2025",
        founders: [
            { "@type": "Person", name: "Artur A.", jobTitle: "Founder & CEO" },
        ],
        address: {
            "@type": "PostalAddress",
            addressLocality: "Los Angeles",
            addressRegion: "CA",
            addressCountry: "US",
        },
        sameAs: [
            "https://twitter.com/emailer_io",
            "https://linkedin.com/company/e-mailer",
            "https://github.com/e-mailer",
        ],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            url: "https://e-mailer.io/contact",
            email: "hello@e-mailer.io",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />

            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">About E-mailer</p>
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        We're building the future of
                        <br />
                        outbound sales
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        E-mailer started with a simple frustration: cold email tools hadn't evolved in a decade.
                        Sales teams were still manually writing repetitive emails, guessing at personalization,
                        and watching their messages land in spam. We knew AI could fix all of it.
                    </p>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.04em]">
                                    {s.value}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em] mb-8">
                        How it started
                    </h2>
                    <div className="space-y-5 text-slate-600 leading-relaxed">
                        <p>
                            I'm Artur, and I'm from Los Angeles. Before E-mailer, I spent years doing B2B sales — grinding
                            through cold outreach with every tool on the market. And they all had the same problem: they
                            treated cold email like marketing email. Blast a template to a list. Hope for the best.
                        </p>
                        <p>
                            But cold email isn't marketing. It's a conversation starter. Every recipient is a real person with
                            a specific context, specific challenges, and zero tolerance for generic pitches. The best salespeople
                            know this — they spend 20 minutes researching each prospect before writing a single email.
                        </p>
                        <p>
                            The question was: could AI do that research and personalization automatically, at scale, without
                            losing the human touch? I started building a prototype in late 2024. The first test campaign
                            got a 23% reply rate — 4× what I'd ever achieved manually. I knew this was the product.
                        </p>
                        <p>
                            E-mailer launched on January 1, 2025, and the response was immediate. Sales teams were tired of
                            the same broken tools and wanted something that actually worked. We're still early, still growing
                            fast, and still obsessed with making cold email feel human — no matter the scale.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 lg:py-28 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-3">Our Values</p>
                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em]">
                            What we believe
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {values.map((v) => (
                            <div
                                key={v.title}
                                className="p-7 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4">
                                    {v.icon}
                                </div>
                                <h3 className="font-heading text-lg font-semibold text-slate-900 tracking-[-0.02em] mb-2">
                                    {v.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{v.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-3">Leadership</p>
                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em]">
                            Meet the team
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {team.map((t) => (
                            <div
                                key={t.name}
                                className="p-7 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-300"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-500 mb-4 tracking-wide mx-auto">
                                    {t.avatar}
                                </div>
                                <h3 className="font-heading text-[17px] font-semibold text-slate-900 tracking-[-0.01em]">{t.name}</h3>
                                <p className="text-sm text-cyan-600 font-medium mb-3">{t.role}</p>
                                <p className="text-sm text-slate-500 leading-relaxed">{t.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-heading text-2xl lg:text-3xl font-semibold tracking-[-0.03em] mb-4">
                        Join hundreds of teams sending smarter outreach
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Start your free trial — no credit card required. See what AI-powered cold email can do for your pipeline.
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
