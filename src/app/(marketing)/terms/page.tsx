import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service — E-mailer",
    description:
        "Read the terms governing your use of the E-mailer platform, including acceptable use, billing, data ownership, liability, and termination policies.",
    alternates: { canonical: "https://e-mailer.io/terms" },
    openGraph: {
        title: "Terms of Service — E-mailer",
        description: "Terms governing your use of the E-mailer platform.",
        url: "https://e-mailer.io/terms",
        type: "website",
    },
};

const sections = [
    {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        paragraphs: [
            "By accessing or using E-mailer (\"the Service\"), operated by E-mailer Inc. (\"we\", \"us\", or \"our\"), you agree to be bound by these Terms of Service (\"Terms\"). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.",
            "If you do not agree to these Terms, you may not access or use the Service. We reserve the right to modify these Terms at any time, with at least 30 days' notice for material changes.",
        ],
    },
    {
        id: "service-description",
        title: "2. Service Description",
        paragraphs: [
            "E-mailer is a cloud-based platform for creating, managing, and optimizing cold email outreach campaigns. The Service includes AI-powered email personalization, deliverability monitoring, contact management, analytics, and integrations with third-party tools.",
            "We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will provide reasonable notice of any material changes that affect your use of the Service.",
        ],
    },
    {
        id: "accounts",
        title: "3. Accounts & Registration",
        paragraphs: [
            "You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use.",
            "You must provide accurate, complete, and current registration information. You may not create an account using false or misleading information, or on behalf of someone other than yourself without their permission.",
            "We reserve the right to suspend or terminate accounts that violate these Terms or that have been inactive for more than 12 months.",
        ],
    },
    {
        id: "acceptable-use",
        title: "4. Acceptable Use Policy",
        paragraphs: [
            "You agree to use E-mailer only for lawful business-to-business email outreach. You must comply with all applicable laws, including CAN-SPAM, GDPR, CASL, and any other applicable anti-spam and data protection regulations.",
        ],
        prohibitions: [
            "Sending unsolicited bulk email (spam) to purchased or scraped lists without proper consent basis",
            "Sending emails containing malware, phishing links, or deceptive content",
            "Impersonating another person or entity in your email communications",
            "Using the Service to harass, threaten, or intimidate any individual",
            "Attempting to circumvent our deliverability safeguards, rate limits, or warm-up protocols",
            "Reverse engineering, decompiling, or attempting to extract the source code of the Service",
            "Using the Service to compete with E-mailer or to build a competing product",
            "Sharing your account credentials or API keys with unauthorized third parties",
            "Sending emails related to illegal products, services, or activities",
        ],
    },
    {
        id: "billing",
        title: "5. Billing & Payments",
        paragraphs: [
            "Paid plans are billed monthly or annually, as selected during signup. All fees are quoted in USD and are non-refundable except as required by law or as described in our refund policy. We offer a 14-day money-back guarantee on all new subscriptions.",
            "You authorize us to charge your payment method for the applicable fees. If payment fails, we will attempt to charge again and may suspend your account after 7 days of failed payment. We may change pricing with 30 days' notice.",
            "Free trial periods, if offered, automatically convert to paid subscriptions at the end of the trial unless you cancel. We will remind you 3 days before the trial ends.",
        ],
    },
    {
        id: "data-ownership",
        title: "6. Data Ownership & Licensing",
        paragraphs: [
            "You retain full ownership of all data you upload to or create within E-mailer, including contact lists, email content, templates, and campaign data. We do not claim ownership of your data.",
            "You grant us a limited license to use, process, and store your data solely for the purpose of providing the Service. This license terminates when you delete your data or close your account.",
            "We may use anonymized, aggregated data derived from your use of the Service for product improvement, benchmarking, and research. This data cannot be used to identify you or your contacts.",
        ],
    },
    {
        id: "ai-usage",
        title: "7. AI Features & Generated Content",
        paragraphs: [
            "E-mailer uses artificial intelligence to generate email content, personalization, lead scores, and other outputs (\"AI-Generated Content\"). You own all rights to AI-Generated Content created for your account.",
            "AI-Generated Content is provided \"as is\" and may not always be accurate, appropriate, or complete. You are solely responsible for reviewing, approving, and sending any AI-Generated Content. E-mailer is not liable for any consequences arising from your use of AI-Generated Content.",
            "We do not use your proprietary data — including email content, contact data, or campaign data — to train general-purpose AI models or models used by other customers.",
        ],
    },
    {
        id: "sla",
        title: "8. Service Level & Support",
        paragraphs: [
            "We target 99.9% uptime for the Service, excluding scheduled maintenance. We will provide at least 48 hours' notice for planned maintenance that may affect availability.",
            "Support is available via email and in-app chat during business hours (9am–6pm EST, Monday–Friday). Enterprise customers receive priority support with guaranteed 4-hour response times and a dedicated account manager.",
        ],
    },
    {
        id: "liability",
        title: "9. Limitation of Liability",
        paragraphs: [
            "To the maximum extent permitted by law, E-mailer's total liability to you for any claims arising from your use of the Service is limited to the amount you paid us in the 12 months preceding the claim.",
            "We are not liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, lost revenue, lost data, or business interruption, regardless of the theory of liability.",
            "We are not liable for any damages resulting from: (a) your failure to comply with email regulations, (b) email delivery failures caused by recipient mail servers or third-party infrastructure, (c) inaccuracies in AI-Generated Content, or (d) unauthorized access to your account caused by your failure to maintain credential security.",
        ],
    },
    {
        id: "termination",
        title: "10. Termination",
        paragraphs: [
            "You may cancel your account at any time through your account settings or by contacting us. Cancellation takes effect at the end of your current billing period. You will retain access until then.",
            "We may suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activity, or pose a risk to our platform, other users, or third parties. We will provide notice and an opportunity to export your data unless immediate action is required to prevent harm.",
            "Upon termination, your right to use the Service ceases. We will retain your data for 30 days after termination to allow for data export, after which it will be permanently deleted.",
        ],
    },
    {
        id: "governing-law",
        title: "11. Governing Law & Disputes",
        paragraphs: [
            "These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in Delaware, except that either party may seek injunctive relief in any court of competent jurisdiction.",
            "You agree to resolve disputes individually and waive any right to participate in class action lawsuits or class-wide arbitration.",
        ],
    },
];

export default function TermsPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-[#FAFBFC]">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">Legal</p>
                    <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        Terms of Service
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>Last updated: February 1, 2026</span>
                        <span>·</span>
                        <span>Effective: February 1, 2026</span>
                    </div>
                </div>
            </section>

            {/* Table of Contents */}
            <section className="py-8 bg-white border-b border-slate-100">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Contents</h2>
                    <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="text-slate-500 hover:text-cyan-600 transition-colors"
                            >
                                {s.title}
                            </a>
                        ))}
                    </nav>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <div className="space-y-12">
                        {sections.map((section) => (
                            <div key={section.id} id={section.id}>
                                <h2 className="font-heading text-xl font-semibold text-slate-900 tracking-[-0.02em] mb-4">
                                    {section.title}
                                </h2>
                                <div className="space-y-4">
                                    {section.paragraphs.map((p, i) => (
                                        <p key={i} className="text-sm text-slate-500 leading-relaxed">
                                            {p}
                                        </p>
                                    ))}
                                    {"prohibitions" in section && section.prohibitions && (
                                        <div className="mt-4">
                                            <p className="text-sm font-semibold text-slate-700 mb-3">You may NOT:</p>
                                            <ul className="space-y-2">
                                                {section.prohibitions.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500">
                                                        <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div className="mt-16 p-7 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-heading text-lg font-semibold text-slate-900 tracking-[-0.02em] mb-2">
                            Questions about these terms?
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Contact our legal team at{" "}
                            <a href="mailto:legal@e-mailer.io" className="text-cyan-600 hover:text-cyan-700 font-medium">
                                legal@e-mailer.io
                            </a>
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <Link href="/privacy" className="text-cyan-600 hover:text-cyan-700 font-medium">Privacy Policy →</Link>
                            <Link href="/cookies" className="text-cyan-600 hover:text-cyan-700 font-medium">Cookie Policy →</Link>
                            <Link href="/gdpr" className="text-cyan-600 hover:text-cyan-700 font-medium">GDPR →</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
