import Link from "next/link";

const footerLinks = {
    product: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Integrations", href: "/features#integrations" },
        { label: "Changelog", href: "/changelog" },
    ],
    company: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
    ],
    resources: [
        { label: "Documentation", href: "/docs" },
        { label: "Help Center", href: "/help" },
        { label: "FAQ", href: "/faq" },
        { label: "API Reference", href: "/docs/api" },
    ],
    legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "GDPR", href: "/gdpr" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white">
            {/* CTA Banner */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                    <div className="text-center">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                            Ready to scale your outreach?
                        </h2>
                        <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses using E-mailer to send personalized emails at scale.
                            Start free, no credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="px-8 py-4 bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Start Free Trial →
                            </Link>
                            <Link
                                href="/demo"
                                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                            >
                                Book a Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="E-Mailer"
                                className="h-10 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            The intelligent email outreach platform for modern sales teams.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider">
                                {category}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-slate-400 hover:text-white transition-colors text-sm"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-sm">
                            © {new Date().getFullYear()} E-mailer. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            {/* Social Icons */}
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

