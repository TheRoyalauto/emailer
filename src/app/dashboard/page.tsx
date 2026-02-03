"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { FadeInContainer, StaggeredList, StaggeredItem } from "@/components/PageTransition";

function DashboardPage() {
    // Queries
    const contacts = useQuery(api.contacts.list, {});
    const templates = useQuery(api.templates.list, {});
    const senders = useQuery(api.senders.list);
    const batches = useQuery(api.batches.list);
    const callStats = useQuery(api.activities.getCallStats);
    const todayFollowUps = useQuery(api.activities.getTodayFollowUps);
    const recentActivity = useQuery(api.activities.getRecentActivity, { limit: 10 });

    // Computed stats
    const totalContacts = contacts?.length || 0;
    const totalTemplates = templates?.length || 0;
    const totalSenders = senders?.length || 0;
    const totalBatches = batches?.length || 0;
    const followUpsToday = todayFollowUps?.length || 0;

    // Pipeline breakdown
    const pipelineStats = contacts?.reduce((acc, contact) => {
        const stage = contact.salesStage || "new";
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
    }, {} as Record<string, number>) || {};

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "call_made": return "📞";
            case "voicemail_left": return "📱";
            case "email_sent": return "📧";
            case "note_added": return "📝";
            case "follow_up_scheduled": return "📅";
            case "status_changed": return "🔄";
            default: return "📌";
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Welcome Header */}
                <FadeInContainer>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Dashboard
                            </span>
                        </h1>
                        <p className="text-white/50">Your sales outreach command center</p>
                    </div>
                </FadeInContainer>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Link href="/contacts" className="group">
                        <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                            <div className="text-3xl font-bold text-indigo-400 group-hover:scale-105 transition-transform">
                                {totalContacts}
                            </div>
                            <div className="text-sm text-white/50">Contacts</div>
                        </div>
                    </Link>
                    <Link href="/calls" className="group">
                        <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all">
                            <div className="text-3xl font-bold text-green-400 group-hover:scale-105 transition-transform">
                                {callStats?.today || 0}
                            </div>
                            <div className="text-sm text-white/50">Calls Today</div>
                        </div>
                    </Link>
                    <Link href="/calls" className="group">
                        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all">
                            <div className="text-3xl font-bold text-amber-400 group-hover:scale-105 transition-transform">
                                {followUpsToday}
                            </div>
                            <div className="text-sm text-white/50">Follow-ups Due</div>
                        </div>
                    </Link>
                    <Link href="/templates" className="group">
                        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                            <div className="text-3xl font-bold text-purple-400 group-hover:scale-105 transition-transform">
                                {totalTemplates}
                            </div>
                            <div className="text-sm text-white/50">Templates</div>
                        </div>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Pipeline Overview */}
                    <div className="md:col-span-2 bg-[#12121f] rounded-xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Sales Pipeline</h2>
                            <Link href="/pipeline" className="text-sm text-indigo-400 hover:text-indigo-300">
                                View Kanban →
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {[
                                { id: "new", label: "New", color: "#6366f1" },
                                { id: "contacted", label: "Contacted", color: "#3b82f6" },
                                { id: "follow_up", label: "Follow Up", color: "#f59e0b" },
                                { id: "qualified", label: "Qualified", color: "#8b5cf6" },
                                { id: "closed_won", label: "Won", color: "#22c55e" },
                                { id: "closed_lost", label: "Lost", color: "#ef4444" },
                            ].map((stage) => (
                                <div
                                    key={stage.id}
                                    className="text-center p-3 rounded-lg"
                                    style={{ backgroundColor: `${stage.color}15` }}
                                >
                                    <div
                                        className="text-2xl font-bold"
                                        style={{ color: stage.color }}
                                    >
                                        {pipelineStats[stage.id] || 0}
                                    </div>
                                    <div className="text-xs text-white/50">{stage.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#12121f] rounded-xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link
                                href="/campaigns"
                                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 transition-all"
                            >
                                <span className="text-xl">🚀</span>
                                <span className="font-medium">New Campaign</span>
                            </Link>
                            <Link
                                href="/scraper"
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            >
                                <span className="text-xl">🤖</span>
                                <span className="font-medium">Find Leads</span>
                            </Link>
                            <Link
                                href="/contacts?action=add"
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            >
                                <span className="text-xl">➕</span>
                                <span className="font-medium">Add Contacts</span>
                            </Link>
                            <Link
                                href="/templates?action=add"
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            >
                                <span className="text-xl">📝</span>
                                <span className="font-medium">Create Template</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 bg-[#12121f] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                        <Link href="/calls" className="text-sm text-indigo-400 hover:text-indigo-300">
                            View All →
                        </Link>
                    </div>

                    {recentActivity === undefined ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                        </div>
                    ) : recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-white/30">
                            <p>No recent activity</p>
                            <p className="text-sm mt-1">Start making calls or sending emails!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {recentActivity.map((activity) => (
                                <div key={activity._id} className="py-3 flex items-center gap-3">
                                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm truncate">
                                            <span className="font-medium">
                                                {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </div>
                                        {activity.notes && (
                                            <div className="text-xs text-white/40 truncate">
                                                {activity.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-white/30">
                                        {formatRelativeTime(activity.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resources Row */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#12121f] rounded-xl border border-white/10">
                        <div className="text-2xl font-bold">{totalBatches}</div>
                        <div className="text-sm text-white/50">Contact Batches</div>
                    </div>
                    <div className="p-4 bg-[#12121f] rounded-xl border border-white/10">
                        <div className="text-2xl font-bold">{totalSenders}</div>
                        <div className="text-sm text-white/50">Email Senders</div>
                    </div>
                    <div className="p-4 bg-[#12121f] rounded-xl border border-white/10">
                        <div className="text-2xl font-bold">{callStats?.week || 0}</div>
                        <div className="text-sm text-white/50">Calls This Week</div>
                    </div>
                    <div className="p-4 bg-[#12121f] rounded-xl border border-white/10">
                        <div className="text-2xl font-bold">{callStats?.month || 0}</div>
                        <div className="text-sm text-white/50">Calls This Month</div>
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
