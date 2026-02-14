"use client";

import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

function ABTestsPage() {
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
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            A/B Tests
                        </h1>
                        <p className="text-white/50 mt-1">Compare template variants</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium"
                    >
                        + New Test
                    </button>
                </div>

                {/* Tests List */}
                {tests === undefined ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : tests.length === 0 ? (
                    <div className="text-center py-16 bg-[#12121f] rounded-xl border border-white/10">
                        <div className="text-5xl mb-4">🧪</div>
                        <h2 className="text-xl font-semibold mb-2">No A/B Tests Yet</h2>
                        <p className="text-white/50 mb-4">Create your first A/B test to compare template performance</p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg"
                        >
                            Create A/B Test
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tests.map((test) => (
                            <div key={test._id} className="bg-[#12121f] rounded-xl border border-white/10 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{test.name}</h3>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${test.status === "running" ? "bg-green-500/20 text-green-400" :
                                                test.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                                                    "bg-white/10 text-white/50"
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
                                    <div className={`p-4 rounded-lg ${test.winningVariant === "A" ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-indigo-400">Variant A ({test.splitPercentage}%)</span>
                                            {test.winningVariant === "A" && <span className="text-green-400 text-sm">🏆 Winner</span>}
                                        </div>
                                        <div className="text-sm text-white/50 mb-2 truncate">
                                            {test.templateA?.name || "Template"}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <div className="text-lg font-bold">{test.variantAStats?.sent || 0}</div>
                                                <div className="text-xs text-white/40">Sent</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold">{test.variantAStats?.opened || 0}</div>
                                                <div className="text-xs text-white/40">Opened</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-indigo-400">
                                                    {calcOpenRate(test.variantAStats)}
                                                </div>
                                                <div className="text-xs text-white/40">Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-lg ${test.winningVariant === "B" ? "bg-green-500/10 border border-green-500/30" : "bg-white/5"}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-purple-400">Variant B ({100 - test.splitPercentage}%)</span>
                                            {test.winningVariant === "B" && <span className="text-green-400 text-sm">🏆 Winner</span>}
                                        </div>
                                        <div className="text-sm text-white/50 mb-2 truncate">
                                            {test.templateB?.name || "Template"}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <div className="text-lg font-bold">{test.variantBStats?.sent || 0}</div>
                                                <div className="text-xs text-white/40">Sent</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold">{test.variantBStats?.opened || 0}</div>
                                                <div className="text-xs text-white/40">Opened</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-purple-400">
                                                    {calcOpenRate(test.variantBStats)}
                                                </div>
                                                <div className="text-xs text-white/40">Rate</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Create A/B Test</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-white/50 mb-1 block">Test Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    placeholder="e.g., Subject Line Test"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-white/50 mb-1 block">Variant A</label>
                                    <select
                                        value={templateAId}
                                        onChange={(e) => setTemplateAId(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    >
                                        <option value="">Select template</option>
                                        {templates?.map((t) => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-white/50 mb-1 block">Variant B</label>
                                    <select
                                        value={templateBId}
                                        onChange={(e) => setTemplateBId(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    >
                                        <option value="">Select template</option>
                                        {templates?.map((t) => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-white/50 mb-1 block">
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
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 bg-white/10 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!name || !templateAId || !templateBId}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50"
                            >
                                Create Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ABTestsPageWrapper() {
    return (
        <AuthGuard>
            <ABTestsPage />
        </AuthGuard>
    );
}
