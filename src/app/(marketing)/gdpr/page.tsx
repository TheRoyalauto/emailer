import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "GDPR Compliance — E-mailer",
    description:
        "Learn how E-mailer complies with the EU General Data Protection Regulation. Covers data processing, legal bases, international transfers, subject rights, and DPA availability.",
    alternates: { canonical: "https://e-mailer.io/gdpr" },
    openGraph: {
        title: "GDPR Compliance — E-mailer",
        description: "How E-mailer complies with GDPR — data processing, legal bases, transfers, and your rights.",
        url: "https://e-mailer.io/gdpr",
        type: "website",
    },
};

const commitments = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: "Data Processing Agreement",
        description: "We offer a GDPR-compliant DPA to all customers. It covers our obligations as a data processor, sub-processors, data breach notification procedures, and data deletion commitments.",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
        ),
        title: "Encryption & Security",
        description: "AES-256 encryption at rest, TLS 1.3 in transit. SOC 2 Type II certified infrastructure. Regular penetration testing and security audits by independent third parties.",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M6.157 7.582A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253" />
            </svg>
        ),
        title: "EU Data Processing",
        description: "E-mailer offers EU-based data processing through AWS eu-west-1 (Ireland) for customers who require data residency within the European Economic Area.",
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
        title: "Sub-Processor Transparency",
        description: "We maintain a public list of sub-processors and notify customers at least 30 days before adding new ones, giving you the right to object.",
    },
];

const legalBases = [
    { basis: "Contract Performance (Art. 6(1)(b))", description: "Processing necessary to provide the E-mailer service you've signed up for — account management, email sending, analytics." },
    { basis: "Legitimate Interests (Art. 6(1)(f))", description: "Product improvement through anonymized usage analytics, security monitoring, and fraud prevention. We conduct balancing tests to ensure our interests don't override your rights." },
    { basis: "Consent (Art. 6(1)(a))", description: "Marketing communications, optional analytics cookies, and optional tracking. You can withdraw consent at any time." },
    { basis: "Legal Obligation (Art. 6(1)(c))", description: "Tax records, billing data retention, and responding to lawful data requests from authorities." },
];

const rights = [
    { right: "Right of Access (Art. 15)", description: "Request a copy of all personal data we process about you." },
    { right: "Right to Rectification (Art. 16)", description: "Request correction of inaccurate personal data." },
    { right: "Right to Erasure (Art. 17)", description: "Request deletion of your personal data (\"right to be forgotten\")." },
    { right: "Right to Restrict Processing (Art. 18)", description: "Request that we limit how we use your data." },
    { right: "Right to Data Portability (Art. 20)", description: "Receive your data in a structured, machine-readable format." },
    { right: "Right to Object (Art. 21)", description: "Object to processing based on legitimate interests." },
    { right: "Right re: Automated Decisions (Art. 22)", description: "Right not to be subject to decisions based solely on automated processing." },
];

const subProcessors = [
    { name: "Amazon Web Services", purpose: "Cloud infrastructure & hosting", location: "US / EU (Ireland)" },
    { name: "Stripe", purpose: "Payment processing", location: "US" },
    { name: "PostHog", purpose: "Product analytics", location: "EU (Germany)" },
    { name: "OpenAI", purpose: "AI-powered email personalization", location: "US" },
    { name: "Cloudflare", purpose: "CDN, DDoS protection, DNS", location: "Global" },
    { name: "Intercom", purpose: "Customer support chat", location: "US" },
];

export default function GDPRPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">Compliance</p>
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        GDPR Compliance
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        E-mailer is committed to protecting data privacy and complying with the EU General Data Protection Regulation. Here's how we do it.
                    </p>
                </div>
            </section>

            {/* Commitments */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-slate-900 tracking-[-0.03em]">
                            Our GDPR Commitments
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {commitments.map((c) => (
                            <div
                                key={c.title}
                                className="p-7 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 bg-white"
                            >
                                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4">
                                    {c.icon}
                                </div>
                                <h3 className="font-heading text-lg font-semibold text-slate-900 tracking-[-0.02em] mb-2">
                                    {c.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{c.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Legal Bases */}
            <section className="py-16 lg:py-24 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 tracking-[-0.03em] mb-8">
                        Legal Bases for Processing
                    </h2>
                    <div className="space-y-6">
                        {legalBases.map((lb) => (
                            <div key={lb.basis} className="p-5 bg-white rounded-xl border border-slate-200/80">
                                <h3 className="font-heading text-[15px] font-semibold text-slate-900 tracking-[-0.01em] mb-1.5">
                                    {lb.basis}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{lb.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data Subject Rights */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 tracking-[-0.03em] mb-3">
                        Your Rights Under GDPR
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8">
                        If you are located in the EEA, UK, or Switzerland, you have the following rights. We respond to all requests within 30 days.
                    </p>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        {rights.map((r, i) => (
                            <div
                                key={r.right}
                                className={`flex flex-col sm:flex-row gap-3 p-5 ${i < rights.length - 1 ? "border-b border-slate-100" : ""
                                    }`}
                            >
                                <div className="sm:w-[260px] flex-shrink-0">
                                    <span className="text-sm font-semibold text-slate-700">{r.right}</span>
                                </div>
                                <p className="text-sm text-slate-500">{r.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* International Transfers */}
            <section className="py-16 lg:py-24 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        International Data Transfers
                    </h2>
                    <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                        <p>
                            E-mailer is headquartered in the United States. When data is transferred from the EEA/UK to the US,
                            we rely on the <strong className="text-slate-700">EU-US Data Privacy Framework</strong> (DPF) and,
                            where applicable, <strong className="text-slate-700">Standard Contractual Clauses</strong> (SCCs) approved
                            by the European Commission.
                        </p>
                        <p>
                            For customers who require EU data residency, we offer data processing within AWS eu-west-1 (Ireland)
                            on our Enterprise plan. Contact sales for details.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sub-Processors */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 tracking-[-0.03em] mb-8">
                        Sub-Processors
                    </h2>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            <span>Provider</span>
                            <span>Purpose</span>
                            <span>Location</span>
                        </div>
                        {subProcessors.map((sp, i) => (
                            <div
                                key={sp.name}
                                className={`grid grid-cols-3 gap-4 px-5 py-4 ${i < subProcessors.length - 1 ? "border-b border-slate-100" : ""
                                    }`}
                            >
                                <span className="text-sm font-semibold text-slate-700">{sp.name}</span>
                                <span className="text-sm text-slate-500">{sp.purpose}</span>
                                <span className="text-sm text-slate-400">{sp.location}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data Breach */}
            <section className="py-16 bg-[#FAFBFC] border-y border-slate-100">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="font-heading text-2xl font-semibold text-slate-900 tracking-[-0.03em] mb-6">
                        Data Breach Response
                    </h2>
                    <div className="space-y-4 text-sm text-slate-500 leading-relaxed">
                        <p>
                            In the event of a personal data breach, we will notify affected customers within
                            <strong className="text-slate-700"> 72 hours</strong> of becoming aware of the breach, as required by
                            GDPR Article 33. Our notification will include the nature of the breach, the data affected, the measures
                            taken to address it, and the steps you should take.
                        </p>
                        <p>
                            We maintain a dedicated incident response team and conduct annual breach simulation exercises
                            to ensure our response process is effective and timely.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="p-7 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-heading text-lg font-semibold text-slate-900 tracking-[-0.02em] mb-2">
                            GDPR questions or data subject requests?
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Contact our Data Protection Officer at{" "}
                            <a href="mailto:dpo@e-mailer.io" className="text-cyan-600 hover:text-cyan-700 font-medium">
                                dpo@e-mailer.io
                            </a>
                            {" "}or request a copy of our DPA.
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <Link href="/privacy" className="text-cyan-600 hover:text-cyan-700 font-medium">Privacy Policy →</Link>
                            <Link href="/terms" className="text-cyan-600 hover:text-cyan-700 font-medium">Terms of Service →</Link>
                            <Link href="/cookies" className="text-cyan-600 hover:text-cyan-700 font-medium">Cookie Policy →</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
