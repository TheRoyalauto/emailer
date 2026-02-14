"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // Check if user has an active session
        try {
            const token = localStorage.getItem("claimory_session_token");
            setIsLoggedIn(!!token);
        } catch { }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="E-mailer"
                            className="w-20 h-20 object-contain drop-shadow-sm"
                        />
                        <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            E-mailer
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link href="/features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            Features
                        </Link>
                        <Link href="/pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            Pricing
                        </Link>
                        <Link href="/faq" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            FAQ
                        </Link>
                    </div>

                    {/* Desktop CTA — Auth-Aware */}
                    <div className="hidden lg:flex items-center gap-4">
                        {isLoggedIn ? (
                            <Link
                                href="/dashboard"
                                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <span>Go to Dashboard</span>
                                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Start Free →
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="lg:hidden py-4 border-t border-slate-200/50">
                        <div className="flex flex-col gap-3">
                            <Link href="/features" className="py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                Features
                            </Link>
                            <Link href="/pricing" className="py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                Pricing
                            </Link>
                            <Link href="/faq" className="py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                FAQ
                            </Link>
                            <hr className="my-2 border-slate-200" />

                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    className="py-3 text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2"
                                >
                                    <span>Go to Dashboard</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="py-3 text-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl shadow-lg"
                                    >
                                        Start Free →
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
