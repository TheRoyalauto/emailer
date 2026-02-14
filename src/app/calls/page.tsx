"use client";

import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import ContactDetail from "@/components/ContactDetail";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

const CALL_OUTCOMES = [
    { value: "answered", label: "✅ Answered", color: "#22c55e" },
    { value: "voicemail", label: "📞 Voicemail", color: "#f59e0b" },
    { value: "no_answer", label: "❌ No Answer", color: "#ef4444" },
    { value: "busy", label: "🔴 Busy", color: "#f97316" },
    { value: "wrong_number", label: "⚠️ Wrong Number", color: "#6b7280" },
    { value: "callback_requested", label: "🔄 Callback", color: "#3b82f6" },
] as const;

function CallsPage() {
    const [viewContactId, setViewContactId] = useState<Id<"contacts"> | null>(null);
    const [activeTab, setActiveTab] = useState<"today" | "all" | "followups">("today");
    const [showLogCall, setShowLogCall] = useState<Id<"contacts"> | null>(null);
    const [callOutcome, setCallOutcome] = useState<typeof CALL_OUTCOMES[number]["value"]>("answered");
    const [callNotes, setCallNotes] = useState("");
    const [callFollowUp, setCallFollowUp] = useState("");
    const [loggingCall, setLoggingCall] = useState(false);

    // Queries
    const callStats = useAuthQuery(api.activities.getCallStats);
    const todayFollowUps = useAuthQuery(api.activities.getTodayFollowUps);
    const recentActivity = useAuthQuery(api.activities.getRecentActivity, { limit: 30 });
    const allContacts = useAuthQuery(api.contacts.list, {});

    // Mutations
    const logCall = useAuthMutation(api.activities.logCall);

    // Filter contacts with phones for call queue
    const callableContacts = allContacts?.filter(c => c.phone && c.status === "active") || [];

    // Sort by: follow-up due first, then by last called (oldest first)
    const sortedCallQueue = [...callableContacts].sort((a, b) => {
        // Follow-ups due today first
        const aDue = a.nextFollowUpAt && a.nextFollowUpAt <= Date.now();
        const bDue = b.nextFollowUpAt && b.nextFollowUpAt <= Date.now();
        if (aDue && !bDue) return -1;
        if (!aDue && bDue) return 1;

        // Then sort by last called (oldest first, never called at top)
        const aLast = a.lastCallAt || 0;
        const bLast = b.lastCallAt || 0;
        return aLast - bLast;
    });

    const handleLogCall = async () => {
        if (!showLogCall) return;
        setLoggingCall(true);
        try {
            await logCall({
                contactId: showLogCall,
                outcome: callOutcome,
                notes: callNotes || undefined,
                followUpAt: callFollowUp ? new Date(callFollowUp).getTime() : undefined,
            });
            setShowLogCall(null);
            setCallNotes("");
            setCallFollowUp("");
            setCallOutcome("answered");
        } catch (err) {
            console.error(err);
        } finally {
            setLoggingCall(false);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - timestamp;

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return date.toLocaleDateString();
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "email_sent": return "📧";
            case "email_opened": return "👁️";
            case "call_made": return "📞";
            case "voicemail_left": return "📞";
            case "note_added": return "📝";
            case "status_changed": return "🔄";
            case "follow_up_scheduled": return "⏰";
            default: return "•";
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 rounded-xl p-4">
                        <div className="text-3xl font-bold text-green-400">{callStats?.today || 0}</div>
                        <div className="text-sm text-white/50">Calls Today</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="text-3xl font-bold text-blue-400">{callStats?.week || 0}</div>
                        <div className="text-sm text-white/50">This Week</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                        <div className="text-3xl font-bold text-purple-400">{callStats?.month || 0}</div>
                        <div className="text-sm text-white/50">This Month</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
                        <div className="text-3xl font-bold text-amber-400">{todayFollowUps?.length || 0}</div>
                        <div className="text-sm text-white/50">Follow-ups Due</div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("today")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "today"
                            ? "bg-indigo-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        📞 Call Queue
                    </button>
                    <button
                        onClick={() => setActiveTab("followups")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "followups"
                            ? "bg-amber-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        ⏰ Follow-ups ({todayFollowUps?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "all"
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                    >
                        📊 Activity Feed
                    </button>
                </div>

                {/* Call Queue */}
                {activeTab === "today" && (
                    <div className="bg-[#12121f] rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h2 className="font-semibold">Call Queue</h2>
                            <p className="text-sm text-white/50">Contacts with phone numbers, sorted by priority</p>
                        </div>

                        {sortedCallQueue.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {sortedCallQueue.slice(0, 20).map((contact) => (
                                    <div
                                        key={contact._id}
                                        className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4"
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold flex-shrink-0">
                                            {(contact.name || contact.email).charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{contact.name || contact.email}</div>
                                            <div className="text-sm text-white/50 truncate">{contact.company || contact.email}</div>
                                            {contact.nextFollowUpAt && contact.nextFollowUpAt <= Date.now() && (
                                                <div className="text-xs text-amber-400 mt-1">⏰ Follow-up due</div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right text-sm text-white/50 hidden md:block">
                                            <div>{contact.callCount || 0} calls</div>
                                            <div>{contact.lastCallAt ? formatDate(contact.lastCallAt) : "Never called"}</div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`tel:${contact.phone}`}
                                                onClick={() => setShowLogCall(contact._id)}
                                                className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                                            >
                                                📞 Call
                                            </a>
                                            <button
                                                onClick={() => setViewContactId(contact._id)}
                                                className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-white/40">
                                <p className="text-4xl mb-2">📞</p>
                                <p>No contacts with phone numbers</p>
                                <p className="text-sm">Add phone numbers to contacts to start calling</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Follow-ups Due */}
                {activeTab === "followups" && (
                    <div className="bg-[#12121f] rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h2 className="font-semibold">Follow-ups Due Today</h2>
                            <p className="text-sm text-white/50">Contacts that need your attention</p>
                        </div>

                        {todayFollowUps && todayFollowUps.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {todayFollowUps.map((contact) => (
                                    <div
                                        key={contact._id}
                                        className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold flex-shrink-0">
                                            {(contact.name || contact.email).charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{contact.name || contact.email}</div>
                                            <div className="text-sm text-white/50 truncate">{contact.company || contact.email}</div>
                                            <div className="text-xs text-amber-400 mt-1">
                                                Scheduled: {contact.nextFollowUpAt ? new Date(contact.nextFollowUpAt).toLocaleTimeString() : "Today"}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {contact.phone && (
                                                <a
                                                    href={`tel:${contact.phone}`}
                                                    onClick={() => setShowLogCall(contact._id)}
                                                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                                >
                                                    📞 Call
                                                </a>
                                            )}
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                            >
                                                📧
                                            </a>
                                            <button
                                                onClick={() => setViewContactId(contact._id)}
                                                className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-white/40">
                                <p className="text-4xl mb-2">✅</p>
                                <p>No follow-ups due today</p>
                                <p className="text-sm">You're all caught up!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Feed */}
                {activeTab === "all" && (
                    <div className="bg-[#12121f] rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h2 className="font-semibold">Recent Activity</h2>
                            <p className="text-sm text-white/50">Your latest interactions</p>
                        </div>

                        {recentActivity && recentActivity.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity._id}
                                        className="p-4 hover:bg-white/5 transition-colors flex items-start gap-3"
                                    >
                                        <div className="text-xl">{getActivityIcon(activity.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium capitalize">
                                                    {activity.type.replace(/_/g, " ")}
                                                </span>
                                                {activity.callOutcome && (
                                                    <span
                                                        className="px-2 py-0.5 rounded text-xs"
                                                        style={{
                                                            backgroundColor: `${CALL_OUTCOMES.find(o => o.value === activity.callOutcome)?.color}20`,
                                                            color: CALL_OUTCOMES.find(o => o.value === activity.callOutcome)?.color,
                                                        }}
                                                    >
                                                        {activity.callOutcome.replace(/_/g, " ")}
                                                    </span>
                                                )}
                                            </div>
                                            {activity.contact && (
                                                <div className="text-sm text-white/60 mt-0.5">
                                                    {activity.contact.name || activity.contact.email}
                                                    {activity.contact.company && ` • ${activity.contact.company}`}
                                                </div>
                                            )}
                                            {activity.notes && (
                                                <div className="text-sm text-white/50 mt-1">{activity.notes}</div>
                                            )}
                                        </div>
                                        <div className="text-xs text-white/40">{formatDate(activity.createdAt)}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-white/40">
                                <p className="text-4xl mb-2">📊</p>
                                <p>No activity yet</p>
                                <p className="text-sm">Start calling or emailing to see activity here</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Contact Detail Modal */}
            {viewContactId && (
                <ContactDetail
                    contactId={viewContactId}
                    onClose={() => setViewContactId(null)}
                />
            )}

            {/* Log Call Modal */}
            {showLogCall && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-xl p-6 w-full max-w-md border border-white/10">
                        <h3 className="text-lg font-bold mb-4">Log Call Outcome</h3>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {CALL_OUTCOMES.map((outcome) => (
                                <button
                                    key={outcome.value}
                                    onClick={() => setCallOutcome(outcome.value)}
                                    className={`p-3 rounded-lg text-sm font-medium transition-all ${callOutcome === outcome.value
                                        ? "ring-2 ring-offset-2 ring-offset-[#12121f]"
                                        : "opacity-60 hover:opacity-100"
                                        }`}
                                    style={{
                                        backgroundColor: `${outcome.color}20`,
                                        color: outcome.color,
                                    }}
                                >
                                    {outcome.label}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={callNotes}
                            onChange={(e) => setCallNotes(e.target.value)}
                            placeholder="Call notes (optional)"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg mb-4 resize-none h-24"
                        />

                        <div className="mb-4">
                            <label className="text-sm text-white/50 mb-1 block">Schedule follow-up</label>
                            <input
                                type="datetime-local"
                                value={callFollowUp}
                                onChange={(e) => setCallFollowUp(e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowLogCall(null);
                                    setCallNotes("");
                                    setCallFollowUp("");
                                }}
                                className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleLogCall}
                                disabled={loggingCall}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50"
                            >
                                {loggingCall ? "Saving..." : "Save & Next"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CallsPageWrapper() {
    return (
        <AuthGuard>
            <CallsPage />
        </AuthGuard>
    );
}
