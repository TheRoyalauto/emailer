import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — E-mailer",
    description:
        "Learn how E-mailer collects, uses, and protects your personal information. Our privacy policy covers data collection, storage, sharing, and your rights under GDPR and CCPA.",
    alternates: { canonical: "https://e-mailer.io/privacy" },
    openGraph: {
        title: "Privacy Policy — E-mailer",
        description: "How E-mailer collects, uses, and protects your personal information.",
        url: "https://e-mailer.io/privacy",
        type: "website",
    },
};

const sections = [
    {
        id: "information-we-collect",
        title: "1. Information We Collect",
        content: [
            {
                subtitle: "Account Information",
                text: "When you create an account, we collect your name, email address, company name, and password. If you sign up through a third-party service (Google, Microsoft), we receive your profile information from that service.",
            },
            {
                subtitle: "Usage Data",
                text: "We automatically collect information about how you use E-mailer, including pages visited, features used, campaign performance data, IP address, browser type, device type, and session duration. This data helps us improve the product and diagnose issues.",
            },
            {
                subtitle: "Email Content & Contact Data",
                text: "We process the email content you create and the contact data you import into E-mailer. This includes names, email addresses, company information, and any custom fields you configure. We do not sell this data.",
            },
            {
                subtitle: "Payment Information",
                text: "Payment processing is handled by Stripe. We do not store your full credit card number, CVV, or bank account details on our servers. Stripe's privacy policy governs payment data.",
            },
        ],
    },
    {
        id: "how-we-use",
        title: "2. How We Use Your Information",
        content: [
            {
                subtitle: "Service Delivery",
                text: "We use your information to provide, maintain, and improve E-mailer's services — including sending emails on your behalf, AI-powered personalization, deliverability monitoring, and analytics.",
            },
            {
                subtitle: "Communication",
                text: "We send transactional emails (account confirmation, password resets, billing receipts) and, with your consent, marketing communications about new features and offers. You can unsubscribe from marketing emails at any time.",
            },
            {
                subtitle: "AI Processing",
                text: "Your campaign data and contact information may be processed by our AI models to generate personalized email content, lead scoring, and send-time optimization. This processing occurs on secure, isolated infrastructure. We do not use your data to train general-purpose AI models.",
            },
            {
                subtitle: "Analytics & Improvement",
                text: "We use aggregated, anonymized usage data to analyze trends, improve our product, and develop new features. Individual user data is not shared externally for this purpose.",
            },
        ],
    },
    {
        id: "data-sharing",
        title: "3. Data Sharing & Third Parties",
        content: [
            {
                subtitle: "Service Providers",
                text: "We share data with trusted service providers who assist in operating our platform: cloud hosting (AWS), email delivery infrastructure, payment processing (Stripe), analytics (PostHog), and customer support tools. These providers are bound by data processing agreements.",
            },
            {
                subtitle: "Legal Requirements",
                text: "We may disclose your information if required by law, regulation, legal process, or governmental request. We will notify you of such requests unless legally prohibited from doing so.",
            },
            {
                subtitle: "Business Transfers",
                text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. We will notify you before your data is transferred and becomes subject to a different privacy policy.",
            },
            {
                subtitle: "No Selling of Data",
                text: "We do not sell, rent, or trade your personal information or your contacts' information to third parties. Period.",
            },
        ],
    },
    {
        id: "data-security",
        title: "4. Data Security",
        content: [
            {
                subtitle: "Encryption",
                text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. API keys and sensitive credentials are stored using industry-standard secret management systems.",
            },
            {
                subtitle: "Infrastructure",
                text: "Our infrastructure is hosted on AWS with SOC 2 Type II certified data centers. We implement network isolation, intrusion detection, regular security audits, and automated vulnerability scanning.",
            },
            {
                subtitle: "Access Controls",
                text: "Access to customer data is restricted to authorized employees who require it for their job function. All access is logged and reviewed. We enforce multi-factor authentication for all internal systems.",
            },
        ],
    },
    {
        id: "your-rights",
        title: "5. Your Rights",
        content: [
            {
                subtitle: "Access & Portability",
                text: "You can request a copy of all personal data we hold about you in a machine-readable format. Contact privacy@e-mailer.io and we'll respond within 30 days.",
            },
            {
                subtitle: "Correction & Deletion",
                text: "You can update your account information at any time through Settings. You can request deletion of your account and all associated data by contacting us. We will process deletion requests within 30 days.",
            },
            {
                subtitle: "Consent Withdrawal",
                text: "You can withdraw consent for marketing communications at any time. You can also request that we stop processing your data for specific purposes while maintaining your account.",
            },
            {
                subtitle: "Complaint",
                text: "If you believe we have violated your privacy rights, you have the right to lodge a complaint with your local data protection authority.",
            },
        ],
    },
    {
        id: "data-retention",
        title: "6. Data Retention",
        content: [
            {
                subtitle: "Active Accounts",
                text: "We retain your data for as long as your account is active. Campaign analytics data is retained for 24 months after campaign completion.",
            },
            {
                subtitle: "Deleted Accounts",
                text: "When you delete your account, we remove your personal data within 30 days. Some data may be retained in encrypted backups for up to 90 days. We are legally required to retain billing records for 7 years.",
            },
        ],
    },
    {
        id: "cookies",
        title: "7. Cookies",
        content: [
            {
                subtitle: "",
                text: "We use essential cookies to maintain your session and preferences, and optional analytics cookies to understand how you use our product. See our Cookie Policy for details on specific cookies and how to manage your preferences.",
            },
        ],
    },
    {
        id: "changes",
        title: "8. Changes to This Policy",
        content: [
            {
                subtitle: "",
                text: "We may update this privacy policy from time to time. We will notify you of material changes via email or through a prominent notice in the product at least 30 days before the changes take effect. Your continued use of E-mailer after the effective date constitutes acceptance of the updated policy.",
            },
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-[#FAFBFC]">
                <div className="max-w-3xl mx-auto px-6 lg:px-8">
                    <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-4">Legal</p>
                    <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        Privacy Policy
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
                                <h2 className="font-heading text-xl font-semibold text-slate-900 tracking-[-0.02em] mb-6">
                                    {section.title}
                                </h2>
                                <div className="space-y-5">
                                    {section.content.map((item, i) => (
                                        <div key={i}>
                                            {item.subtitle && (
                                                <h3 className="font-heading text-[15px] font-semibold text-slate-700 mb-1.5">
                                                    {item.subtitle}
                                                </h3>
                                            )}
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div className="mt-16 p-7 bg-slate-50 rounded-xl border border-slate-200">
                        <h3 className="font-heading text-lg font-semibold text-slate-900 tracking-[-0.02em] mb-2">
                            Questions about privacy?
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Contact our Data Protection Officer at{" "}
                            <a href="mailto:privacy@e-mailer.io" className="text-cyan-600 hover:text-cyan-700 font-medium">
                                privacy@e-mailer.io
                            </a>
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <Link href="/terms" className="text-cyan-600 hover:text-cyan-700 font-medium">Terms of Service →</Link>
                            <Link href="/cookies" className="text-cyan-600 hover:text-cyan-700 font-medium">Cookie Policy →</Link>
                            <Link href="/gdpr" className="text-cyan-600 hover:text-cyan-700 font-medium">GDPR →</Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
