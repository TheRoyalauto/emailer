"use client";

import { useState } from "react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

const CLASSIFICATIONS = [
    { id: "positive", label: "Positive", color: "#22c55e", icon: "😊", bg: "rgba(34, 197, 94, 0.15)" },
    { id: "not_now", label: "Not Now", color: "#f59e0b", icon: "⏰", bg: "rgba(245, 158, 11, 0.15)" },
    { id: "price_objection", label: "Price", color: "#f97316", icon: "💰", bg: "rgba(249, 115, 22, 0.15)" },
    { id: "competitor", label: "Competitor", color: "#8b5cf6", icon: "🏢", bg: "rgba(139, 92, 246, 0.15)" },
    { id: "angry", label: "Angry", color: "#ef4444", icon: "😠", bg: "rgba(239, 68, 68, 0.15)" },
    { id: "unsubscribe", label: "Unsubscribe", color: "#6b7280", icon: "🚫", bg: "rgba(107, 114, 128, 0.15)" },
    { id: "out_of_office", label: "OOO", color: "#3b82f6", icon: "✈️", bg: "rgba(59, 130, 246, 0.15)" },
    { id: "question", label: "Question", color: "#06b6d4", icon: "❓", bg: "rgba(6, 182, 212, 0.15)" },
    { id: "unknown", label: "Unknown", color: "#9ca3af", icon: "🤷", bg: "rgba(156, 163, 175, 0.15)" },
] as const;

function RepliesPage() {
    const [filter, setFilter] = useState<"all" | "unprocessed" | string>("unprocessed");
    const [selectedReply, setSelectedReply] = useState<Id<"inboundReplies"> | null>(null);
    const [isClassifying, setIsClassifying] = useState(false);

    const replies = useAuthQuery(api.replies.list, {
        isProcessed: filter === "unprocessed" ? false : undefined,
        classification: filter !== "all" && filter !== "unprocessed" ? filter : undefined,
        limit: 100,
    });

    const stats = useAuthQuery(api.replies.getStats, {});
    const updateClassification = useAuthMutation(api.replies.updateClassification);
    const saveResponses = useAuthMutation(api.replies.saveResponses);
    const markResponded = useAuthMutation(api.replies.markResponded);
    const markIgnored = useAuthMutation(api.replies.markIgnored);

    const getClassificationInfo = (id: string | undefined) => {
        return CLASSIFICATIONS.find(c => c.id === id) || CLASSIFICATIONS[CLASSIFICATIONS.length - 1];
    };

    const handleClassify = async (replyId: Id<"inboundReplies">, classification: string) => {
        setIsClassifying(true);
        try {
            await updateClassification({ id: replyId, classification });
        } finally {
            setIsClassifying(false);
        }
    };

    // AI-powered auto-classification
    const handleAIClassify = async (reply: typeof replies extends (infer T)[] | undefined ? T : never) => {
        if (!reply) return;
        setIsClassifying(true);
        try {
            const response = await fetch("/api/classify-reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: reply.subject,
                    body: reply.body,
                    fromEmail: reply.fromEmail,
                }),
            });

            const result = await response.json();
            if (result.success) {
                await saveResponses({
                    id: reply._id,
                    classification: result.classification,
                    sentiment: result.sentiment,
                    buyingSignals: result.buyingSignals,
                    suggestedResponses: result.suggestedResponses?.map((r: { subject: string; body: string; tone: string }) => ({
                        type: r.tone,
                        subject: r.subject,
                        body: r.body,
                    })) || [],
                });
            }
        } catch (error) {
            console.error("AI classification failed:", error);
        } finally {
            setIsClassifying(false);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return date.toLocaleDateString();
    };

    const selectedReplyData = replies?.find(r => r._id === selectedReply);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-4">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total || 0}</div>
                        <div className="text-xs text-slate-500">Total Replies</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-4">
                        <div className="text-2xl font-bold text-amber-400">{stats?.unprocessed || 0}</div>
                        <div className="text-xs text-slate-500">Unprocessed</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-4">
                        <div className="text-2xl font-bold text-blue-400">{stats?.pending || 0}</div>
                        <div className="text-xs text-slate-500">Pending Response</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-400">{stats?.responded || 0}</div>
                        <div className="text-xs text-slate-500">Responded</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-4">
                        <div className="text-2xl font-bold" style={{ color: stats?.averageSentiment && stats.averageSentiment > 0 ? "#22c55e" : stats?.averageSentiment && stats.averageSentiment < 0 ? "#ef4444" : "#9ca3af" }}>
                            {stats?.averageSentiment || 0}
                        </div>
                        <div className="text-xs text-slate-500">Avg Sentiment</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === "all"
                            ? "bg-slate-50 text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-900 hover:bg-white"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("unprocessed")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === "unprocessed"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "text-slate-500 hover:text-slate-900 hover:bg-white"
                            }`}
                    >
                        📥 Unprocessed ({stats?.unprocessed || 0})
                    </button>
                    {CLASSIFICATIONS.slice(0, 6).map(c => (
                        <button
                            key={c.id}
                            onClick={() => setFilter(c.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === c.id
                                ? `text-slate-900 dark:text-white border`
                                : "text-slate-500 hover:text-slate-900 hover:bg-white"
                                }`}
                            style={filter === c.id ? { backgroundColor: c.bg, borderColor: c.color + "40" } : {}}
                        >
                            {c.icon} {c.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Reply List */}
                    <div className="lg:col-span-2 space-y-2">
                        {!replies && (
                            <div className="text-center py-12 text-slate-500">Loading replies...</div>
                        )}

                        {replies?.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">📭</div>
                                <div className="text-slate-500">No replies found</div>
                            </div>
                        )}

                        {replies?.map((reply) => {
                            const classInfo = getClassificationInfo(reply.classification);
                            const isSelected = selectedReply === reply._id;

                            return (
                                <div
                                    key={reply._id}
                                    onClick={() => setSelectedReply(reply._id)}
                                    className={`bg-white dark:bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${isSelected
                                        ? "border-blue-500/50 ring-1 ring-blue-500/20"
                                        : "border-slate-200 hover:border-slate-200"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Classification Badge */}
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                                            style={{ backgroundColor: classInfo.bg }}
                                        >
                                            {classInfo.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-slate-900 dark:text-white truncate">
                                                    {reply.contact?.name || reply.contact?.company || reply.fromEmail}
                                                </span>
                                                {reply.contact?.company && reply.contact?.name && (
                                                    <span className="text-slate-400 text-sm truncate">
                                                        @ {reply.contact.company}
                                                    </span>
                                                )}
                                                <span className="text-slate-400 text-xs ml-auto shrink-0">
                                                    {formatDate(reply.receivedAt)}
                                                </span>
                                            </div>

                                            <div className="text-sm text-slate-700 font-medium mb-1 truncate">
                                                {reply.subject}
                                            </div>

                                            <div className="text-sm text-slate-400 line-clamp-2">
                                                {reply.body.replace(/<[^>]*>/g, "").slice(0, 150)}...
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2 mt-3">
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-medium"
                                                    style={{
                                                        backgroundColor: classInfo.bg,
                                                        color: classInfo.color
                                                    }}
                                                >
                                                    {classInfo.label}
                                                </span>

                                                {!reply.isProcessed && (
                                                    <span className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400">
                                                        Needs Review
                                                    </span>
                                                )}

                                                {reply.buyingSignals?.score && (
                                                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                                                        BANT: {reply.buyingSignals.score}
                                                    </span>
                                                )}

                                                {reply.responseStatus === "responded" && (
                                                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 ml-auto">
                                                        ✓ Responded
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detail Panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-4 h-fit sticky top-4">
                        {!selectedReplyData ? (
                            <div className="text-center py-12 text-slate-500">
                                <div className="text-4xl mb-3">👈</div>
                                <div>Select a reply to view details</div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Reply Details</h3>
                                    <button
                                        onClick={() => setSelectedReply(null)}
                                        className="text-slate-500 hover:text-slate-900"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Contact Info */}
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <div className="text-sm text-slate-500 mb-1">From</div>
                                    <div className="text-slate-900 dark:text-white font-medium">
                                        {selectedReplyData.contact?.name || selectedReplyData.fromEmail}
                                    </div>
                                    {selectedReplyData.contact?.company && (
                                        <div className="text-sm text-slate-500">{selectedReplyData.contact.company}</div>
                                    )}
                                    <div className="text-sm text-slate-400">{selectedReplyData.fromEmail}</div>
                                </div>

                                {/* Subject & Body */}
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <div className="text-sm text-slate-500 mb-1">Subject</div>
                                    <div className="text-slate-900 dark:text-white mb-3">{selectedReplyData.subject}</div>

                                    <div className="text-sm text-slate-500 mb-1">Message</div>
                                    <div className="text-slate-800 text-sm bg-white rounded-lg p-3 max-h-48 overflow-y-auto">
                                        {selectedReplyData.body.replace(/<[^>]*>/g, "")}
                                    </div>
                                </div>

                                {/* Quick Classify */}
                                <div className="mb-4 pb-4 border-b border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm text-slate-500">Classify As</div>
                                        {!selectedReplyData.isProcessed && (
                                            <button
                                                onClick={() => handleAIClassify(selectedReplyData)}
                                                disabled={isClassifying}
                                                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {isClassifying ? (
                                                    <>⏳ Analyzing...</>
                                                ) : (
                                                    <>✨ AI Classify</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {CLASSIFICATIONS.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => handleClassify(selectedReplyData._id, c.id)}
                                                disabled={isClassifying}
                                                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${selectedReplyData.classification === c.id
                                                    ? "ring-2 ring-offset-1 ring-offset-[#12121a]"
                                                    : "hover:scale-105"
                                                    }`}
                                                style={{
                                                    backgroundColor: c.bg,
                                                    borderColor: c.color + "40",
                                                    color: c.color
                                                }}
                                            >
                                                {c.icon} {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* BANT Signals */}
                                {selectedReplyData.buyingSignals && (
                                    <div className="mb-4 pb-4 border-b border-slate-200">
                                        <div className="text-sm text-slate-500 mb-2">Buying Signals (BANT)</div>
                                        <div className="space-y-2 text-sm">
                                            {selectedReplyData.buyingSignals.budget && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Budget</span>
                                                    <span className="text-slate-900 dark:text-white">{selectedReplyData.buyingSignals.budget}</span>
                                                </div>
                                            )}
                                            {selectedReplyData.buyingSignals.authority && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Authority</span>
                                                    <span className="text-slate-900 dark:text-white">{selectedReplyData.buyingSignals.authority}</span>
                                                </div>
                                            )}
                                            {selectedReplyData.buyingSignals.need && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Need</span>
                                                    <span className="text-slate-900 dark:text-white">{selectedReplyData.buyingSignals.need}</span>
                                                </div>
                                            )}
                                            {selectedReplyData.buyingSignals.timeline && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Timeline</span>
                                                    <span className="text-slate-900 dark:text-white">{selectedReplyData.buyingSignals.timeline}</span>
                                                </div>
                                            )}
                                            {selectedReplyData.buyingSignals.score && (
                                                <div className="flex justify-between pt-2 border-t border-slate-200">
                                                    <span className="text-slate-500">Score</span>
                                                    <span className="text-green-400 font-bold">{selectedReplyData.buyingSignals.score}/100</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* AI Suggested Responses */}
                                {selectedReplyData.suggestedResponses && selectedReplyData.suggestedResponses.length > 0 && (
                                    <div className="mb-4 pb-4 border-b border-slate-200">
                                        <div className="text-sm text-slate-500 mb-2">AI Suggested Responses</div>
                                        <div className="space-y-2">
                                            {selectedReplyData.suggestedResponses.map((resp, i) => (
                                                <div key={i} className="bg-white rounded-lg p-3 text-sm">
                                                    <div className="text-slate-700 font-medium mb-1">
                                                        {i === 0 ? "✨ Best" : `Option ${i + 1}`}: {resp.subject}
                                                    </div>
                                                    <div className="text-slate-500 text-xs line-clamp-2">
                                                        {resp.body.slice(0, 100)}...
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => markResponded({ id: selectedReplyData._id })}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                                    >
                                        ✓ Mark Responded
                                    </button>
                                    <button
                                        onClick={() => markIgnored({ id: selectedReplyData._id })}
                                        className="px-4 py-2 bg-slate-50 hover:bg-white/20 text-slate-700 rounded-lg text-sm font-medium transition-all"
                                    >
                                        Skip
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function RepliesPageWrapper() {
    return (
        <AuthGuard>
            <RepliesPage />
        </AuthGuard>
    );
}
