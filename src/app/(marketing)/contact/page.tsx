"use client";

import { useState } from "react";

export default function ContactPage() {
    const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-[#FAFBFC]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h1 className="font-heading text-4xl lg:text-5xl font-semibold text-slate-900 tracking-[-0.03em] mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Have a question, need a demo, or want to chat about pricing?
                        We&apos;re here to help.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                        {/* Form */}
                        <div className="lg:col-span-3">
                            {submitted ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="font-heading text-xl font-semibold text-slate-900 tracking-[-0.02em] mb-2">
                                        Message sent
                                    </h3>
                                    <p className="text-slate-500 text-[15px]">
                                        Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formState.name}
                                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none transition-colors"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formState.email}
                                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none transition-colors"
                                                placeholder="you@company.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formState.subject}
                                            onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none transition-colors"
                                            placeholder="What's this about?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formState.message}
                                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none transition-colors resize-none"
                                            placeholder="Tell us more..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg tracking-[-0.01em] hover:bg-slate-800 active:scale-[0.98] transition-all"
                                    >
                                        Send Message →
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="lg:col-span-2">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                                        Email Us
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                            </svg>
                                            <a href="mailto:hello@e-mailer.io" className="text-slate-600 hover:text-slate-900 transition-colors text-[15px]">
                                                hello@e-mailer.io
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 3.03.96-5.59L3.3 8.48l5.62-.81L11.42 2.5l2.51 5.17 5.62.81-4.07 4.13.96 5.59z" />
                                            </svg>
                                            <a href="mailto:sales@e-mailer.io" className="text-slate-600 hover:text-slate-900 transition-colors text-[15px]">
                                                sales@e-mailer.io
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                                        Office
                                    </h3>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        <p className="text-slate-600 text-[15px] leading-relaxed">
                                            123 Innovation Drive<br />
                                            San Francisco, CA 94105
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-heading text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                                        Response Times
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[15px]">
                                            <span className="text-slate-500">General inquiries</span>
                                            <span className="text-slate-900 font-medium">Within 24 hours</span>
                                        </div>
                                        <div className="flex justify-between text-[15px]">
                                            <span className="text-slate-500">Sales</span>
                                            <span className="text-slate-900 font-medium">Within 4 hours</span>
                                        </div>
                                        <div className="flex justify-between text-[15px]">
                                            <span className="text-slate-500">Priority support</span>
                                            <span className="text-slate-900 font-medium">Within 1 hour</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
