"use client";

import { api } from "@/../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery } from "../../hooks/useAuthConvex";

function AnalyticsPage() {
    const emailAnalytics = useAuthQuery(api.analytics.getEmailAnalytics);
    const topContacts = useAuthQuery(api.analytics.getTopContacts, { limit: 10 });

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Email Analytics
                        </span>
                    </h1>
                    <p className="text-slate-500">Track your email campaign performance</p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 rounded-xl border border-indigo-500/20">
                        <div className="text-3xl font-bold text-indigo-400">
                            {emailAnalytics?.total.sent || 0}
                        </div>
                        <div className="text-sm text-slate-500">Emails Sent</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20">
                        <div className="text-3xl font-bold text-green-400">
                            {emailAnalytics?.total.opened || 0}
                        </div>
                        <div className="text-sm text-slate-500">Opens</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20">
                        <div className="text-3xl font-bold text-blue-400">
                            {emailAnalytics?.total.clicked || 0}
                        </div>
                        <div className="text-sm text-slate-500">Clicks</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20">
                        <div className="text-3xl font-bold text-purple-400">
                            {emailAnalytics?.total.openRate || 0}%
                        </div>
                        <div className="text-sm text-slate-500">Open Rate</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-xl border border-pink-500/20">
                        <div className="text-3xl font-bold text-pink-400">
                            {emailAnalytics?.total.clickRate || 0}%
                        </div>
                        <div className="text-sm text-slate-500">Click Rate</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Today's Performance */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">Today</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white rounded-lg">
                                <div className="text-2xl font-bold">{emailAnalytics?.today.sent || 0}</div>
                                <div className="text-sm text-slate-500">Sent</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg">
                                <div className="text-2xl font-bold">{emailAnalytics?.today.opened || 0}</div>
                                <div className="text-sm text-slate-500">Opened</div>
                            </div>
                        </div>
                    </div>

                    {/* This Week */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">This Week</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white rounded-lg">
                                <div className="text-2xl font-bold">{emailAnalytics?.week.sent || 0}</div>
                                <div className="text-sm text-slate-500">Sent</div>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg">
                                <div className="text-2xl font-bold">{emailAnalytics?.week.opened || 0}</div>
                                <div className="text-sm text-slate-500">Opened</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Engaged Contacts */}
                <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Most Engaged Contacts</h2>

                    {topContacts === undefined ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                        </div>
                    ) : topContacts.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p>No engagement data yet</p>
                            <p className="text-sm mt-1">Start sending emails with tracking enabled!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {topContacts.map((contact: any, i: number) => (
                                <div key={contact._id} className="py-3 flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                                            i === 1 ? "bg-gray-400/20 text-gray-300" :
                                                i === 2 ? "bg-amber-600/20 text-amber-500" :
                                                    "bg-slate-50 text-slate-400"
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                            {contact.name || contact.email.split("@")[0]}
                                        </div>
                                        <div className="text-sm text-slate-400 truncate">
                                            {contact.email}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-indigo-400">
                                            {contact.engagementScore}
                                        </div>
                                        <div className="text-xs text-slate-400">score</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tracking Pixel Info */}
                <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <h3 className="font-medium text-indigo-400 mb-2">📊 How to Enable Tracking</h3>
                    <p className="text-sm text-slate-500 mb-3">
                        Add tracking pixels to your email templates to monitor opens and clicks:
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 text-xs font-mono text-slate-700 overflow-x-auto">
                        {`<img src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/track?id={{contactId}}" width="1" height="1" />`}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function AnalyticsPageWrapper() {
    return (
        <AuthGuard>
            <AnalyticsPage />
        </AuthGuard>
    );
}
