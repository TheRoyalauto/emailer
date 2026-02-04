"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

const DEAL_STAGES = [
    { id: "lead", label: "Lead", color: "#6b7280", icon: "🎯", probability: 10 },
    { id: "contacted", label: "Contacted", color: "#3b82f6", icon: "📧", probability: 20 },
    { id: "replied", label: "Replied", color: "#8b5cf6", icon: "💬", probability: 40 },
    { id: "qualified", label: "Qualified", color: "#06b6d4", icon: "✅", probability: 60 },
    { id: "demo_booked", label: "Demo Booked", color: "#14b8a6", icon: "📅", probability: 70 },
    { id: "proposal_sent", label: "Proposal Sent", color: "#f59e0b", icon: "📄", probability: 80 },
    { id: "negotiation", label: "Negotiation", color: "#f97316", icon: "🤝", probability: 85 },
    { id: "closed_won", label: "Closed Won", color: "#22c55e", icon: "🎉", probability: 100 },
    { id: "closed_lost", label: "Closed Lost", color: "#ef4444", icon: "❌", probability: 0 },
] as const;

type DealStage = typeof DEAL_STAGES[number]["id"];

function DealsPage() {
    const [selectedDeal, setSelectedDeal] = useState<Id<"deals"> | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [draggedDeal, setDraggedDeal] = useState<Id<"deals"> | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    // Create form state
    const [createForm, setCreateForm] = useState({
        contactId: "" as Id<"contacts"> | "",
        name: "",
        value: 0,
        stage: "lead" as DealStage,
        expectedCloseDate: "",
    });

    const deals = useQuery(api.deals.list, {});
    const stats = useQuery(api.deals.getStats, {});
    const contacts = useQuery(api.contacts.list, {});
    const createDeal = useMutation(api.deals.create);
    const updateStage = useMutation(api.deals.updateStage);
    const deleteDeal = useMutation(api.deals.remove);

    // Compute avgDealSize client-side (backend doesn't provide it)
    const avgDealSize = stats && stats.total > 0
        ? Math.round(stats.totalValue / stats.total)
        : 0;

    const getStageInfo = (id: string) => DEAL_STAGES.find(s => s.id === id);

    const getDealsForStage = useCallback((stageId: string) => {
        return deals?.filter(d => d.stage === stageId) || [];
    }, [deals]);

    const getStageTotalValue = (stageId: string) => {
        return getDealsForStage(stageId).reduce((sum, d) => sum + d.value, 0);
    };

    const handleDragStart = (dealId: Id<"deals">) => {
        setDraggedDeal(dealId);
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        setDragOverStage(stageId);
    };

    const handleDragLeave = () => {
        setDragOverStage(null);
    };

    const handleDrop = async (stageId: string) => {
        if (draggedDeal) {
            await updateStage({ id: draggedDeal, stage: stageId });
        }
        setDraggedDeal(null);
        setDragOverStage(null);
    };

    const handleCreate = async () => {
        if (!createForm.contactId || !createForm.name) return;

        await createDeal({
            contactId: createForm.contactId as Id<"contacts">,
            name: createForm.name,
            value: createForm.value,
            stage: createForm.stage,
            expectedCloseDate: createForm.expectedCloseDate
                ? new Date(createForm.expectedCloseDate).getTime()
                : undefined,
        });

        setCreateForm({ contactId: "", name: "", value: 0, stage: "lead", expectedCloseDate: "" });
        setShowCreate(false);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const selectedDealData = deals?.find(d => d._id === selectedDeal);

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <AppHeader />

            <main className="max-w-[1800px] mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Deals Pipeline</h1>
                        <p className="text-white/50 text-sm">Manage your sales opportunities</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                    >
                        + New Deal
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
                        <div className="text-xs text-white/50">Total Deals</div>
                    </div>
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-blue-400">{formatCurrency(stats?.totalValue || 0)}</div>
                        <div className="text-xs text-white/50">Pipeline Value</div>
                    </div>
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-purple-400">{formatCurrency(stats?.weightedValue || 0)}</div>
                        <div className="text-xs text-white/50">Weighted Value</div>
                    </div>
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(stats?.wonValueThisMonth || 0)}</div>
                        <div className="text-xs text-white/50">Won This Month</div>
                    </div>
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-amber-400">{formatCurrency(avgDealSize)}</div>
                        <div className="text-xs text-white/50">Avg Deal Size</div>
                    </div>
                </div>

                {/* Pipeline Board */}
                <div className="flex gap-3 overflow-x-auto pb-4">
                    {DEAL_STAGES.map((stage) => {
                        const stageDeals = getDealsForStage(stage.id);
                        const stageValue = getStageTotalValue(stage.id);
                        const isDragOver = dragOverStage === stage.id;

                        return (
                            <div
                                key={stage.id}
                                onDragOver={(e) => handleDragOver(e, stage.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={() => handleDrop(stage.id)}
                                className={`flex-shrink-0 w-72 bg-[#0f0f15] rounded-xl border transition-all ${isDragOver
                                    ? "border-blue-500/50 bg-blue-500/5"
                                    : "border-white/10"
                                    }`}
                            >
                                {/* Stage Header */}
                                <div
                                    className="p-3 border-b border-white/10"
                                    style={{ borderLeftColor: stage.color, borderLeftWidth: "3px" }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{stage.icon}</span>
                                            <span className="font-medium text-white text-sm">{stage.label}</span>
                                            <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs text-white/60">
                                                {stageDeals.length}
                                            </span>
                                        </div>
                                        <span className="text-xs" style={{ color: stage.color }}>
                                            {stage.probability}%
                                        </span>
                                    </div>
                                    <div className="text-sm text-white/40 mt-1">
                                        {formatCurrency(stageValue)}
                                    </div>
                                </div>

                                {/* Deals List */}
                                <div className="p-2 space-y-2 min-h-[200px] max-h-[calc(100vh-400px)] overflow-y-auto">
                                    {stageDeals.length === 0 && (
                                        <div className="text-center py-8 text-white/30 text-sm">
                                            No deals
                                        </div>
                                    )}

                                    {stageDeals.map((deal) => (
                                        <div
                                            key={deal._id}
                                            draggable
                                            onDragStart={() => handleDragStart(deal._id)}
                                            onClick={() => setSelectedDeal(deal._id)}
                                            className={`bg-[#12121a] border rounded-lg p-3 cursor-pointer transition-all hover:border-white/30 ${draggedDeal === deal._id
                                                ? "opacity-50 border-blue-500/50"
                                                : "border-white/10"
                                                } ${selectedDeal === deal._id ? "ring-1 ring-blue-500/50" : ""}`}
                                        >
                                            <div className="text-white font-medium text-sm mb-1 truncate">
                                                {deal.name}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/60 text-xs truncate">
                                                    {deal.contact?.company || deal.contact?.name || deal.contact?.email}
                                                </span>
                                                <span className="text-green-400 font-medium text-sm">
                                                    {formatCurrency(deal.value)}
                                                </span>
                                            </div>
                                            {deal.expectedCloseDate && (
                                                <div className="text-xs text-white/40 mt-2">
                                                    Close: {formatDate(deal.expectedCloseDate)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Create Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-md">
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">Create Deal</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Contact</label>
                                    <select
                                        value={createForm.contactId}
                                        onChange={(e) => setCreateForm({ ...createForm, contactId: e.target.value as Id<"contacts"> })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                                    >
                                        <option value="">Select contact...</option>
                                        {contacts?.map((contact) => (
                                            <option key={contact._id} value={contact._id}>
                                                {contact.name || contact.email} {contact.company ? `@ ${contact.company}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Deal Name</label>
                                    <input
                                        type="text"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                        placeholder="e.g., Enterprise License - Acme Corp"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Value ($)</label>
                                    <input
                                        type="number"
                                        value={createForm.value}
                                        onChange={(e) => setCreateForm({ ...createForm, value: parseInt(e.target.value) || 0 })}
                                        placeholder="1000"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Stage</label>
                                    <select
                                        value={createForm.stage}
                                        onChange={(e) => setCreateForm({ ...createForm, stage: e.target.value as DealStage })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                                    >
                                        {DEAL_STAGES.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.icon} {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Expected Close Date</label>
                                    <input
                                        type="date"
                                        value={createForm.expectedCloseDate}
                                        onChange={(e) => setCreateForm({ ...createForm, expectedCloseDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!createForm.contactId || !createForm.name}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
                                >
                                    Create Deal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deal Detail Drawer */}
                {selectedDealData && (
                    <div className="fixed right-0 top-0 h-full w-96 bg-[#12121a] border-l border-white/10 z-50 overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold text-white">Deal Details</h3>
                            <button onClick={() => setSelectedDeal(null)} className="text-white/50 hover:text-white">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedDealData.name}</h2>
                                <div className="text-2xl font-bold text-green-400 mt-1">
                                    {formatCurrency(selectedDealData.value)}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-white/50 mb-2">Stage</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getStageInfo(selectedDealData.stage)?.icon}</span>
                                    <span className="text-white">{getStageInfo(selectedDealData.stage)?.label}</span>
                                    <span className="text-white/40">({selectedDealData.probability}%)</span>
                                </div>
                            </div>

                            {selectedDealData.contact && (
                                <div>
                                    <div className="text-sm text-white/50 mb-2">Contact</div>
                                    <div className="text-white">{selectedDealData.contact.name || selectedDealData.contact.email}</div>
                                    {selectedDealData.contact.company && (
                                        <div className="text-white/60">{selectedDealData.contact.company}</div>
                                    )}
                                </div>
                            )}

                            {selectedDealData.expectedCloseDate && (
                                <div>
                                    <div className="text-sm text-white/50 mb-2">Expected Close</div>
                                    <div className="text-white">{formatDate(selectedDealData.expectedCloseDate)}</div>
                                </div>
                            )}

                            {selectedDealData.notes && (
                                <div>
                                    <div className="text-sm text-white/50 mb-2">Notes</div>
                                    <div className="text-white/80 text-sm bg-white/5 rounded-lg p-3">
                                        {selectedDealData.notes}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/10">
                                <button
                                    onClick={async () => {
                                        await deleteDeal({ id: selectedDealData._id });
                                        setSelectedDeal(null);
                                    }}
                                    className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-all"
                                >
                                    Delete Deal
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function DealsPageWrapper() {
    return (
        <AuthGuard>
            <DealsPage />
        </AuthGuard>
    );
}
