import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Careers at E-mailer — Join the Future of Outbound Sales",
    description:
        "We're building the AI platform that's changing how B2B teams sell. See open roles in engineering, product, sales, and marketing at E-mailer.",
    alternates: { canonical: "https://e-mailer.io/careers" },
    openGraph: {
        title: "Careers at E-mailer — Join Us",
        description: "We're building the AI platform that's changing how B2B teams sell. See open roles.",
        url: "https://e-mailer.io/careers",
        type: "website",
    },
};

const perks = [
    { emoji: "💰", title: "Competitive equity", description: "Meaningful ownership in a high-growth company. Every team member holds equity." },
    { emoji: "🌍", title: "Remote-first", description: "Work from anywhere. Async by default. We care about output, not hours logged." },
    { emoji: "🏥", title: "Full benefits", description: "Health, dental, vision for you and your family. Mental health support included." },
    { emoji: "📚", title: "$3K learning budget", description: "Annual budget for courses, books, conferences. Keep growing." },
    { emoji: "🏖️", title: "Unlimited PTO", description: "We mean it. Minimum 3 weeks enforced. Rest is a competitive advantage." },
    { emoji: "💻", title: "Top-tier equipment", description: "MacBook Pro, 4K display, and $1K for your home office setup." },
];

const openings = [
    {
        department: "Engineering",
        roles: [
            { title: "Senior Full-Stack Engineer", location: "Remote (US/EU)", type: "Full-time" },
            { title: "ML Engineer — NLP & Personalization", location: "Remote (US/EU)", type: "Full-time" },
            { title: "Infrastructure Engineer", location: "Remote (US)", type: "Full-time" },
            { title: "Senior Frontend Engineer (React)", location: "Remote (US/EU)", type: "Full-time" },
        ],
    },
    {
        department: "Product & Design",
        roles: [
            { title: "Senior Product Designer", location: "Remote (US/EU)", type: "Full-time" },
            { title: "Product Manager — AI Features", location: "Remote (US)", type: "Full-time" },
        ],
    },
    {
        department: "Go-to-Market",
        roles: [
            { title: "Account Executive (Mid-Market)", location: "Remote (US)", type: "Full-time" },
            { title: "SDR Team Lead", location: "Remote (US)", type: "Full-time" },
            { title: "Content Marketing Manager", location: "Remote (US/EU)", type: "Full-time" },
        ],
    },
    {
        department: "Customer Success",
        roles: [
            { title: "Customer Success Manager", location: "Remote (US)", type: "Full-time" },
            { title: "Deliverability Specialist", location: "Remote (US/EU)", type: "Full-time" },
        ],
    },
];

export default function CareersPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">Careers</p>
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        Help us reinvent outbound sales
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        We're a small, fast-moving team building the platform that hundreds of sales teams rely on every day.
                        If you're passionate about AI, sales, and shipping great products — we'd love to meet you.
                    </p>
                    <div className="mt-8">
                        <a
                            href="#openings"
                            className="inline-flex px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-800 active:scale-[0.98] transition-all"
                        >
                            View Open Roles →
                        </a>
                    </div>
                </div>
            </section>

            {/* Why E-mailer */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-3">Why E-mailer</p>
                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em]">
                            Built for people who want to do their best work
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {perks.map((p) => (
                            <div
                                key={p.title}
                                className="p-7 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 bg-white"
                            >
                                <div className="text-2xl mb-3">{p.emoji}</div>
                                <h3 className="font-heading text-[17px] font-semibold text-slate-900 tracking-[-0.01em] mb-2">
                                    {p.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{p.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Roles */}
            <section id="openings" className="py-20 lg:py-28 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-3">Open Roles</p>
                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em]">
                            Find your next role
                        </h2>
                    </div>

                    <div className="space-y-10">
                        {openings.map((dept) => (
                            <div key={dept.department}>
                                <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                                    {dept.department}
                                </h3>
                                <div className="space-y-3">
                                    {dept.roles.map((role) => (
                                        <div
                                            key={role.title}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer group"
                                        >
                                            <div>
                                                <h4 className="font-heading text-[16px] font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors tracking-[-0.01em]">
                                                    {role.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                                                    <span>{role.location}</span>
                                                    <span>·</span>
                                                    <span>{role.type}</span>
                                                </div>
                                            </div>
                                            <span className="text-sm text-cyan-600 font-semibold group-hover:translate-x-1 transition-transform">
                                                Apply →
                                            </span>
                                        </div>
                                    ))}
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
                        Don't see your role?
                    </h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        We're always looking for exceptional people. Send us your resume and tell us what you'd build — we'll find a way to work together.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-100 active:scale-[0.98] transition-all"
                    >
                        Get In Touch →
                    </Link>
                </div>
            </section>
        </>
    );
}
