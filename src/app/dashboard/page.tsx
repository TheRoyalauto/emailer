"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

function DashboardPage() {
    // Core queries only
    const contacts = useQuery(api.contacts.list, {});
    const templates = useQuery(api.templates.list, {});
    const batches = useQuery(api.batches.list);
    const campaigns = useQuery(api.campaigns.list);
    const recentActivity = useQuery(api.activities.getRecentActivity, { limit: 5 });

    // Simple stats
    const totalContacts = contacts?.length || 0;
    const totalTemplates = templates?.length || 0;
    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === "sending" || c.status === "scheduled")?.length || 0;

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="relative mb-10 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-pink-600/20" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2),transparent_50%)]" />

                    <div className="relative p-8 md:p-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Welcome back
                            </span>
                        </h1>
                        <p className="text-white/60 text-lg">Ready to grow your business?</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <Link href="/contacts" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-indigo-400 group-hover:scale-105 transition-transform">
                                {totalContacts}
                            </div>
                            <div className="text-sm text-white/50">Contacts</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-green-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-green-400 group-hover:scale-105 transition-transform">
                                {activeCampaigns}
                            </div>
                            <div className="text-sm text-white/50">Active Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/campaigns" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-amber-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-amber-400 group-hover:scale-105 transition-transform">
                                {totalCampaigns}
                            </div>
                            <div className="text-sm text-white/50">Total Campaigns</div>
                        </div>
                    </Link>
                    <Link href="/templates" className="group">
                        <div className="p-5 bg-gradient-to-br from-[#12121f] to-[#16162a] rounded-xl border border-white/10 hover:border-purple-500/30 transition-all hover:-translate-y-1">
                            <div className="text-3xl font-bold text-purple-400 group-hover:scale-105 transition-transform">
                                {totalTemplates}
                            </div>
                            <div className="text-sm text-white/50">Templates</div>
                        </div>
                    </Link>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-[#12121f] rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-semibold mb-5">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link
                                href="/campaigns"
                                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    🚀
                                </div>
                                <div>
                                    <div className="font-medium">New Campaign</div>
                                    <div className="text-sm text-white/40">Send emails to your contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/scraper"
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    🔎
                                </div>
                                <div>
                                    <div className="font-medium">Find Leads</div>
                                    <div className="text-sm text-white/40">Discover new business contacts</div>
                                </div>
                            </Link>
                            <Link
                                href="/contacts"
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    ➕
                                </div>
                                <div>
                                    <div className="font-medium">Add Contacts</div>
                                    <div className="text-sm text-white/40">Import or add contacts manually</div>
                                </div>
                            </Link>
                            <Link
                                href="/templates"
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    📝
                                </div>
                                <div>
                                    <div className="font-medium">Create Template</div>
                                    <div className="text-sm text-white/40">Design reusable email templates</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-[#12121f] rounded-xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-semibold">Recent Activity</h2>
                            <Link href="/replies" className="text-sm text-indigo-400 hover:text-indigo-300">
                                View All →
                            </Link>
                        </div>

                        {recentActivity === undefined ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-3xl">
                                    📭
                                </div>
                                <p className="text-white/40">No activity yet</p>
                                <p className="text-sm text-white/30 mt-1">Start a campaign to see activity here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity._id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                                            {activity.type === "email_sent" ? "📧" :
                                                activity.type === "status_changed" ? "🔄" : "📌"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">
                                                <span className="font-medium">
                                                    {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                {activity.contact && (
                                                    <span className="text-white/50 ml-2">
                                                        • {activity.contact.name || activity.contact.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-white/30">
                                            {formatRelativeTime(activity.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPageWrapper() {
    return (
        <AuthGuard>
            <DashboardPage />
        </AuthGuard>
    );
}
