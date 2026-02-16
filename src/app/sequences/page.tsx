"use client";

import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { UpgradeGate } from "@/components/UpgradeModal";

function SequencesPage() {
    const { canUseSequences, tier, isLoading } = useFeatureGate();
    const sequences = useAuthQuery(api.sequences.list);
    const templates = useAuthQuery(api.templates.list, {});
    const createSequence = useAuthMutation(api.sequences.create);
    const activateSequence = useAuthMutation(api.sequences.activate);
    const pauseSequence = useAuthMutation(api.sequences.pause);
    const removeSequence = useAuthMutation(api.sequences.remove);

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [triggerType, setTriggerType] = useState<"manual" | "on_contact_create" | "on_stage_change">("manual");

    // Feature gate: Sequences requires Starter+
    if (!isLoading && !canUseSequences) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[var(--bg-primary)] pb-20 md:pb-0">
                <AppHeader />
                <UpgradeGate feature="sequences" currentTier={tier} />
            </div>
        );
    }

    const handleCreate = async () => {
        if (!name) return;
        const id = await createSequence({ name, description, triggerType });
        setShowCreate(false);
        setName("");
        setDescription("");
        setTriggerType("manual");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[var(--bg-primary)] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Email Sequences
                        </h1>
                        <p className="text-slate-500 mt-1">Automated multi-step drip campaigns</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-white"
                    >
                        + New Sequence
                    </button>
                </div>

                {/* Sequences List */}
                {sequences === undefined ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : sequences.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-5xl mb-4">📧</div>
                        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">No Sequences Yet</h2>
                        <p className="text-slate-500 mb-4">Create automated email sequences to nurture leads</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg"
                        >
                            Create Sequence
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sequences.map((seq) => (
                            <div key={seq._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{seq.name}</h3>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${seq.status === "active" ? "bg-green-500/20 text-green-400" :
                                            seq.status === "paused" ? "bg-amber-500/20 text-amber-400" :
                                                "bg-slate-50 dark:bg-slate-800 text-slate-500"
                                            }`}>
                                            {seq.status}
                                        </span>
                                    </div>
                                </div>

                                {seq.description && (
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{seq.description}</p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                    <span>📋 {seq.stepCount} steps</span>
                                    <span>👥 {seq.activeEnrollments} active</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/sequences/${seq._id}`}
                                        className="flex-1 text-center px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors"
                                    >
                                        Edit Steps
                                    </Link>
                                    {seq.status === "draft" || seq.status === "paused" ? (
                                        <button
                                            onClick={() => activateSequence({ id: seq._id })}
                                            className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm"
                                        >
                                            Activate
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => pauseSequence({ id: seq._id })}
                                            className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm"
                                        >
                                            Pause
                                        </button>
                                    )}
                                    <button
                                        onClick={() => removeSequence({ id: seq._id })}
                                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create Sequence</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-500 mb-1 block">Sequence Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                    placeholder="e.g., Welcome Series"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-slate-500 mb-1 block">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white resize-none"
                                    rows={2}
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div>
                                <label className="text-sm text-slate-500 mb-1 block">Trigger Type</label>
                                <select
                                    value={triggerType}
                                    onChange={(e) => setTriggerType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                >
                                    <option value="manual">Manual enrollment</option>
                                    <option value="on_contact_create">When contact is created</option>
                                    <option value="on_stage_change">When sales stage changes</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!name}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-white disabled:opacity-50"
                            >
                                Create Sequence
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SequencesPageWrapper() {
    return (
        <AuthGuard>
            <SequencesPage />
        </AuthGuard>
    );
}
