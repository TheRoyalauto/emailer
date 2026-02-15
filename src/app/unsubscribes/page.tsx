"use client";

import { api } from "@/../convex/_generated/api";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

function UnsubscribesPage() {
    const unsubscribes = useAuthQuery(api.unsubscribes.list);
    const resubscribe = useAuthMutation(api.unsubscribes.resubscribe);

    const formatDate = (ts: number) => {
        return new Date(ts).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Unsubscribes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage email opt-outs for compliance</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-3xl font-bold text-red-400">
                            {unsubscribes?.length || 0}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Total Unsubscribes</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-3xl font-bold text-green-400">
                            {unsubscribes?.filter(u => {
                                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                                return u.unsubscribedAt >= weekAgo;
                            }).length || 0}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">This Week</div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-6">
                    <h3 className="font-medium text-cyan-500 mb-2">📋 Unsubscribe Link</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Add this link to your email templates for compliance:
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                        {`<a href="${typeof window !== 'undefined' ? window.location.origin : ''}/unsubscribe?email={{email}}">Unsubscribe</a>`}
                    </div>
                </div>

                {/* Unsubscribes List */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    {unsubscribes === undefined ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                        </div>
                    ) : unsubscribes.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <div className="text-4xl mb-4">✅</div>
                            <p>No unsubscribes yet</p>
                            <p className="text-sm mt-1">All your contacts are subscribed!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {unsubscribes.map((unsub) => (
                                <div key={unsub._id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">{unsub.email}</div>
                                        <div className="text-sm text-slate-400">
                                            Unsubscribed {formatDate(unsub.unsubscribedAt)}
                                        </div>
                                        {unsub.reason && (
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Reason: {unsub.reason}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => resubscribe({ email: unsub.email })}
                                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                                    >
                                        Resubscribe
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function UnsubscribesPageWrapper() {
    return (
        <AuthGuard>
            <UnsubscribesPage />
        </AuthGuard>
    );
}
