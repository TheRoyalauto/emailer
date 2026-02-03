"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageTransition, FadeInContainer, StaggeredList, StaggeredItem } from "@/components/PageTransition";
import Link from "next/link";

type SettingsTab = "overview" | "smtp" | "senders" | "templates" | "unsubscribes" | "scraper";

function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
    const smtpConfigs = useQuery(api.smtpConfigs.list);
    const senders = useQuery(api.senders.list);
    const templates = useQuery(api.templates.list, {});
    const unsubscribes = useQuery(api.unsubscribes.list);

    const tabs: { id: SettingsTab; label: string; icon: string }[] = [
        { id: "overview", label: "Overview", icon: "⚙️" },
        { id: "smtp", label: "Email Config", icon: "🔧" },
        { id: "senders", label: "Sender IDs", icon: "✉️" },
        { id: "templates", label: "Templates", icon: "📝" },
        { id: "scraper", label: "AI Scraper", icon: "🤖" },
        { id: "unsubscribes", label: "Unsubs", icon: "🚫" },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20 md:pb-0">
            <AppHeader />

            <PageTransition>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <FadeInContainer>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Settings
                            </h1>
                            <p className="text-white/50 mt-1">Configure your email infrastructure and preferences</p>
                        </div>
                    </FadeInContainer>

                    {/* Tab Navigation */}
                    <FadeInContainer delay={0.1}>
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </FadeInContainer>

                    {/* Tab Content */}
                    {activeTab === "overview" && (
                        <FadeInContainer delay={0.15}>
                            <StaggeredList>
                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <StaggeredItem>
                                        <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-2xl border border-indigo-500/20">
                                            <div className="text-3xl font-bold text-indigo-400">
                                                {smtpConfigs?.length || 0}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Email Configs</div>
                                        </div>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/20">
                                            <div className="text-3xl font-bold text-emerald-400">
                                                {senders?.length || 0}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Sender IDs</div>
                                        </div>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20">
                                            <div className="text-3xl font-bold text-purple-400">
                                                {templates?.length || 0}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Templates</div>
                                        </div>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <div className="p-5 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-2xl border border-red-500/20">
                                            <div className="text-3xl font-bold text-red-400">
                                                {unsubscribes?.length || 0}
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">Unsubscribed</div>
                                        </div>
                                    </StaggeredItem>
                                </div>

                                {/* Quick Links Grid */}
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StaggeredItem>
                                        <Link
                                            href="/smtp-settings"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">🔧</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-indigo-400 transition-colors">SMTP & API Keys</h3>
                                                    <p className="text-white/50 text-sm">Configure email providers</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/senders"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">✉️</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">Sender Identities</h3>
                                                    <p className="text-white/50 text-sm">Manage from addresses</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/templates"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">📝</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">Email Templates</h3>
                                                    <p className="text-white/50 text-sm">Create and edit templates</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/scraper"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">🤖</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-cyan-400 transition-colors">AI Lead Scraper</h3>
                                                    <p className="text-white/50 text-sm">Find leads with AI</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/unsubscribes"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-red-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">🚫</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-red-400 transition-colors">Unsubscribes</h3>
                                                    <p className="text-white/50 text-sm">Manage opt-outs</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                    <StaggeredItem>
                                        <Link
                                            href="/lists"
                                            className="block p-6 bg-[#12121f] rounded-2xl border border-white/10 hover:border-amber-500/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">📋</span>
                                                <div>
                                                    <h3 className="font-semibold text-lg group-hover:text-amber-400 transition-colors">Mailing Lists</h3>
                                                    <p className="text-white/50 text-sm">Organize contact lists</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </StaggeredItem>
                                </div>
                            </StaggeredList>
                        </FadeInContainer>
                    )}

                    {activeTab === "smtp" && (
                        <FadeInContainer delay={0.15}>
                            <div className="bg-[#12121f] rounded-2xl border border-white/10 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Email Configurations</h3>
                                    <Link
                                        href="/smtp-settings"
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        + Add Config
                                    </Link>
                                </div>

                                {smtpConfigs === undefined ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : smtpConfigs.length === 0 ? (
                                    <div className="text-center py-12 text-white/40">
                                        <span className="text-4xl block mb-3">📭</span>
                                        <p>No email configurations yet</p>
                                        <Link href="/smtp-settings" className="text-indigo-400 hover:underline mt-2 inline-block">
                                            Add your first config →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {smtpConfigs.map((config) => (
                                            <div key={config._id} className="p-4 bg-black/30 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">
                                                        {config.provider === "resend" ? "📮" :
                                                            config.provider === "sendgrid" ? "📬" :
                                                                config.provider === "mailgun" ? "📨" : "📧"}
                                                    </span>
                                                    <div>
                                                        <div className="font-medium">{config.name}</div>
                                                        <div className="text-sm text-white/50">{config.fromEmail}</div>
                                                    </div>
                                                </div>
                                                {config.isDefault && (
                                                    <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-medium">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </FadeInContainer>
                    )}

                    {activeTab === "senders" && (
                        <FadeInContainer delay={0.15}>
                            <div className="bg-[#12121f] rounded-2xl border border-white/10 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Sender Identities</h3>
                                    <Link
                                        href="/senders"
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        + Add Sender
                                    </Link>
                                </div>

                                {senders === undefined ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : senders.length === 0 ? (
                                    <div className="text-center py-12 text-white/40">
                                        <span className="text-4xl block mb-3">✉️</span>
                                        <p>No senders configured</p>
                                        <Link href="/senders" className="text-indigo-400 hover:underline mt-2 inline-block">
                                            Add your first sender →
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {senders.map((sender) => (
                                            <div key={sender._id} className="p-4 bg-black/30 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{sender.name}</div>
                                                    <div className="text-sm text-white/50">{sender.email}</div>
                                                </div>
                                                {sender.isDefault && (
                                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-medium">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </FadeInContainer>
                    )}

                    {activeTab === "templates" && (
                        <FadeInContainer delay={0.15}>
                            <div className="text-center py-16 text-white/40">
                                <span className="text-5xl mb-4 block">📝</span>
                                <p>Template management</p>
                                <Link href="/templates" className="text-indigo-400 hover:underline mt-2 inline-block">
                                    Open Template Editor →
                                </Link>
                            </div>
                        </FadeInContainer>
                    )}

                    {activeTab === "scraper" && (
                        <FadeInContainer delay={0.15}>
                            <div className="text-center py-16 text-white/40">
                                <span className="text-5xl mb-4 block">🤖</span>
                                <p>AI Lead Scraper</p>
                                <Link href="/scraper" className="text-indigo-400 hover:underline mt-2 inline-block">
                                    Open AI Scraper →
                                </Link>
                            </div>
                        </FadeInContainer>
                    )}

                    {activeTab === "unsubscribes" && (
                        <FadeInContainer delay={0.15}>
                            <div className="bg-[#12121f] rounded-2xl border border-white/10 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold">Unsubscribed Contacts</h3>
                                    <span className="text-white/50 text-sm">{unsubscribes?.length || 0} total</span>
                                </div>

                                {unsubscribes === undefined ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : unsubscribes.length === 0 ? (
                                    <div className="text-center py-12 text-white/40">
                                        <span className="text-4xl block mb-3">✅</span>
                                        <p>No unsubscribes yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {unsubscribes.slice(0, 10).map((unsub) => (
                                            <div key={unsub._id} className="p-3 bg-black/30 rounded-lg flex items-center justify-between">
                                                <span className="text-white/70">{unsub.email}</span>
                                                <span className="text-xs text-white/40">
                                                    {new Date(unsub.unsubscribedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                        {unsubscribes.length > 10 && (
                                            <Link href="/unsubscribes" className="block text-center text-indigo-400 hover:underline py-2">
                                                View all {unsubscribes.length} →
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </FadeInContainer>
                    )}
                </main>
            </PageTransition>
        </div>
    );
}

export default function SettingsPageWrapper() {
    return (
        <AuthGuard>
            <SettingsPage />
        </AuthGuard>
    );
}
