"use client";

import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

function SendersPage() {
    const senders = useAuthQuery(api.senders.list);
    const createSender = useAuthMutation(api.senders.create);
    const deleteSender = useAuthMutation(api.senders.remove);
    const updateSender = useAuthMutation(api.senders.update);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newReplyTo, setNewReplyTo] = useState("");

    const handleCreate = async () => {
        if (!newName.trim() || !newEmail.trim()) return;
        await createSender({
            name: newName,
            email: newEmail,
            replyTo: newReplyTo || undefined,
            isDefault: senders?.length === 0,
        });
        setNewName("");
        setNewEmail("");
        setNewReplyTo("");
        setIsCreating(false);
    };

    const setDefault = async (id: string) => {
        await updateSender({ id: id as any, isDefault: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                            Sender Identities
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Configure your email sender profiles</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98]"
                    >
                        + Add Sender
                    </button>
                </div>

                {/* Add Sender Modal */}
                {isCreating && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsCreating(false)}>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6">
                                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-5">Add Sender</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">Sender Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Your Company"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">From Email</label>
                                        <input
                                            type="email"
                                            placeholder="you@company.com"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-700 dark:text-slate-300 mb-1.5 block font-medium">
                                            Reply-to Address <span className="text-slate-400 font-normal">(optional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="replies@company.com"
                                            value={newReplyTo}
                                            onChange={(e) => setNewReplyTo(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!newName.trim() || !newEmail.trim()}
                                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Sender
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {senders === undefined ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    </div>
                ) : senders.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl">
                            ✉️
                        </div>
                        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">No Senders Yet</h2>
                        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                            Add a sender identity to start sending emails. This controls the &quot;From&quot; name and address on your campaigns.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98]"
                        >
                            + Add Your First Sender
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {senders.map((sender) => (
                            <div
                                key={sender._id}
                                className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-lg">
                                            ✉️
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{sender.name}</h3>
                                                {sender.isDefault && (
                                                    <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 text-[10px] rounded-full font-semibold uppercase tracking-wider">
                                                        Default
                                                    </span>
                                                )}
                                                {sender.verified && (
                                                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] rounded-full font-semibold uppercase tracking-wider">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">{sender.email}</p>
                                            {sender.replyTo && (
                                                <p className="text-xs text-slate-400">Reply-to: {sender.replyTo}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!sender.isDefault && (
                                            <button
                                                onClick={() => setDefault(sender._id)}
                                                className="px-3 py-2 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 rounded-lg text-xs font-semibold hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
                                            >
                                                ⭐ Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteSender({ id: sender._id })}
                                            className="px-3 py-2 bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200 dark:border-red-900/50 rounded-lg text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SendersPageWrapper() {
    return (
        <AuthGuard>
            <SendersPage />
        </AuthGuard>
    );
}
