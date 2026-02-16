"use client";

import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { PageWrapper } from "@/components/PageWrapper";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { PageLoadingSpinner } from "@/components/PageLoadingSpinner";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageHeader } from "@/components/PageHeader";
import { FormModal } from "@/components/FormModal";
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
            <PageWrapper>
                <UpgradeGate feature="sequences" currentTier={tier} />
            </PageWrapper>
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
        <PageWrapper>
            <PageHeader
                title="Email Sequences"
                subtitle="Automated multi-step drip campaigns"
                actionLabel="+ New Sequence"
                onAction={() => setShowCreate(true)}
            />

            {/* Sequences List */}
            {sequences === undefined ? (
                <PageLoadingSpinner />
            ) : sequences.length === 0 ? (
                <PageEmptyState
                    icon="📧"
                    title="No Sequences Yet"
                    description="Create automated email sequences to nurture leads"
                    actionLabel="Create Sequence"
                    onAction={() => setShowCreate(true)}
                    buttonClassName="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg"
                />
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


            <FormModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="Create Sequence"
                onSubmit={handleCreate}
                submitLabel="Create Sequence"
                submitDisabled={!name}
            >
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
            </FormModal>
        </PageWrapper >
    );
}

export default function SequencesPageWrapper() {
    return (
        <AuthGuard>
            <SequencesPage />
        </AuthGuard>
    );
}
