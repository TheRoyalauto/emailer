"use client";

import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { PageWrapper } from "@/components/PageWrapper";
import { Id } from "@/../convex/_generated/dataModel";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { PageLoadingSpinner } from "@/components/PageLoadingSpinner";
import { PageEmptyState } from "@/components/PageEmptyState";
import { PageHeader } from "@/components/PageHeader";
import { FormModal } from "@/components/FormModal";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { UpgradeGate } from "@/components/UpgradeModal";

function ABTestsPage() {
    const { canUseABTesting, tier, isLoading } = useFeatureGate();
    const tests = useAuthQuery(api.abTests.list);
    const templates = useAuthQuery(api.templates.list, {});
    const createTest = useAuthMutation(api.abTests.create);
    const startTest = useAuthMutation(api.abTests.start);
    const completeTest = useAuthMutation(api.abTests.complete);
    const removeTest = useAuthMutation(api.abTests.remove);

    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [templateAId, setTemplateAId] = useState("");
    const [templateBId, setTemplateBId] = useState("");
    const [splitPercentage, setSplitPercentage] = useState(50);

    // Feature gate: A/B testing requires Starter+
    if (!isLoading && !canUseABTesting) {
        return (
            <PageWrapper>
                <UpgradeGate feature="ab_testing" currentTier={tier} />
            </PageWrapper>
        );
    }

    const handleCreate = async () => {
        if (!name || !templateAId || !templateBId) return;
        await createTest({
            name,
            templateAId: templateAId as Id<"templates">,
            templateBId: templateBId as Id<"templates">,
            splitPercentage,
        });
        setShowCreate(false);
        setName("");
        setTemplateAId("");
        setTemplateBId("");
        setSplitPercentage(50);
    };

    const calcOpenRate = (stats: { sent: number; opened: number } | undefined) => {
        if (!stats || stats.sent === 0) return "0%";
        return `${((stats.opened / stats.sent) * 100).toFixed(1)}%`;
    };

    return (
        <PageWrapper>
            <PageHeader
                title="A/B Tests"
                subtitle="Compare template variants"
                actionLabel="+ New Test"
                onAction={() => setShowCreate(true)}
            />

            {/* Tests List */}
            {tests === undefined ? (
                <PageLoadingSpinner />
            ) : tests.length === 0 ? (
                <PageEmptyState
                    icon="🧪"
                    title="No A/B Tests Yet"
                    description="Create your first A/B test to compare template performance"
                    actionLabel="Create A/B Test"
                    onAction={() => setShowCreate(true)}
                    buttonClassName="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg"
                />
            ) : (
                <div className="space-y-4">
                    {tests.map((test) => (
                        <div key={test._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{test.name}</h3>
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${test.status === "running" ? "bg-green-500/20 text-green-400" :
                                        test.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                                            "bg-slate-50 dark:bg-slate-800 text-slate-500"
                                        }`}>
                                        {test.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {test.status === "draft" && (
                                        <button
                                            onClick={() => startTest({ id: test._id })}
                                            className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm"
                                        >
                                            Start
                                        </button>
                                    )}
                                    {test.status === "running" && (
                                        <>
                                            <button
                                                onClick={() => completeTest({ id: test._id, winningVariant: "A" })}
                                                className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm"
                                            >
                                                A Wins
                                            </button>
                                            <button
                                                onClick={() => completeTest({ id: test._id, winningVariant: "B" })}
                                                className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
                                            >
                                                B Wins
                                            </button>
                                        </>
                                    )}
                                    {test.status !== "running" && (
                                        <button
                                            onClick={() => removeTest({ id: test._id })}
                                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Variant Comparison */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg ${test.winningVariant === "A" ? "bg-green-500/10 border border-green-500/30" : "bg-white dark:bg-slate-800/50"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-indigo-400">Variant A ({test.splitPercentage}%)</span>
                                        {test.winningVariant === "A" && <span className="text-green-400 text-sm">🏆 Winner</span>}
                                    </div>
                                    <div className="text-sm text-slate-500 mb-2 truncate">
                                        {test.templateA?.name || "Template"}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{test.variantAStats?.sent || 0}</div>
                                            <div className="text-xs text-slate-400">Sent</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{test.variantAStats?.opened || 0}</div>
                                            <div className="text-xs text-slate-400">Opened</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-indigo-400">
                                                {calcOpenRate(test.variantAStats)}
                                            </div>
                                            <div className="text-xs text-slate-400">Rate</div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${test.winningVariant === "B" ? "bg-green-500/10 border border-green-500/30" : "bg-white dark:bg-slate-800/50"}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-purple-400">Variant B ({100 - test.splitPercentage}%)</span>
                                        {test.winningVariant === "B" && <span className="text-green-400 text-sm">🏆 Winner</span>}
                                    </div>
                                    <div className="text-sm text-slate-500 mb-2 truncate">
                                        {test.templateB?.name || "Template"}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{test.variantBStats?.sent || 0}</div>
                                            <div className="text-xs text-slate-400">Sent</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white">{test.variantBStats?.opened || 0}</div>
                                            <div className="text-xs text-slate-400">Opened</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-purple-400">
                                                {calcOpenRate(test.variantBStats)}
                                            </div>
                                            <div className="text-xs text-slate-400">Rate</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            <FormModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="Create A/B Test"
                onSubmit={handleCreate}
                submitLabel="Create Test"
                submitDisabled={!name || !templateAId || !templateBId}
            >
                <div>
                    <label className="text-sm text-slate-500 mb-1 block">Test Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        placeholder="e.g., Subject Line Test"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">Variant A</label>
                        <select
                            value={templateAId}
                            onChange={(e) => setTemplateAId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        >
                            <option value="">Select template</option>
                            {templates?.map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-slate-500 mb-1 block">Variant B</label>
                        <select
                            value={templateBId}
                            onChange={(e) => setTemplateBId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        >
                            <option value="">Select template</option>
                            {templates?.map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-sm text-slate-500 mb-1 block">
                        Traffic Split: {splitPercentage}% A / {100 - splitPercentage}% B
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="90"
                        value={splitPercentage}
                        onChange={(e) => setSplitPercentage(parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>
            </FormModal>
        </PageWrapper >
    );
}

export default function ABTestsPageWrapper() {
    return (
        <AuthGuard>
            <ABTestsPage />
        </AuthGuard>
    );
}
