"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

function SendersPage() {
    const senders = useQuery(api.senders.list);
    const createSender = useMutation(api.senders.create);
    const deleteSender = useMutation(api.senders.remove);
    const updateSender = useMutation(api.senders.update);
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
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Sender Identities
                        </h1>
                        <p className="text-white/50 mt-1">Configure your email sender profiles</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        + Add Sender
                    </button>
                </div>

                {isCreating && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setIsCreating(false)}>
                        <div className="bg-[#1a1a2e] p-6 rounded-xl border border-white/10 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-xl font-semibold mb-4">Add Sender</h2>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Sender name (e.g., Your Company)"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    autoFocus
                                />
                                <input
                                    type="email"
                                    placeholder="From email address"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                />
                                <input
                                    type="email"
                                    placeholder="Reply-to address (optional)"
                                    value={newReplyTo}
                                    onChange={(e) => setNewReplyTo(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleCreate} className="px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">
                                    Add Sender
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {senders === undefined ? (
                    <div className="text-white/50">Loading senders...</div>
                ) : senders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/50 mb-4">No senders configured yet</p>
                        <button onClick={() => setIsCreating(true)} className="text-indigo-400 hover:text-indigo-300">
                            Add your first sender →
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {senders.map((sender) => (
                            <div
                                key={sender._id}
                                className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl">
                                            ✉️
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">{sender.name}</h3>
                                                {sender.isDefault && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                                                        Default
                                                    </span>
                                                )}
                                                {sender.verified && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white/50 text-sm">{sender.email}</p>
                                            {sender.replyTo && (
                                                <p className="text-white/30 text-sm">Reply-to: {sender.replyTo}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!sender.isDefault && (
                                            <button
                                                onClick={() => setDefault(sender._id)}
                                                className="px-3 py-1.5 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteSender({ id: sender._id })}
                                            className="p-2 text-white/40 hover:text-red-400 transition-colors"
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

// Wrapper with auth
export default function SendersPageWrapper() {
    return (
        <AuthGuard>
            <SendersPage />
        </AuthGuard>
    );
}
