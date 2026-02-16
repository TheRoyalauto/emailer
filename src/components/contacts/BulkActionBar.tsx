"use client";

import { Id } from "@/../convex/_generated/dataModel";

const SALES_STAGES = [
    { id: "new", label: "New", color: "#9CA3AF" },
    { id: "contacted", label: "Contacted", color: "#0EA5E9" },
    { id: "follow_up", label: "Follow-up", color: "#F59E0B" },
    { id: "qualified", label: "Qualified", color: "#8B5CF6" },
    { id: "closed_won", label: "Closed Won", color: "#10B981" },
    { id: "closed_lost", label: "Closed Lost", color: "#EF4444" },
];

interface BulkActionBarProps {
    selectedCount: number;
    onChangeStage: (stage: string) => void;
    onAddTags: (tags: string[]) => void;
    onAssignBatch: (batchId: Id<"batches">) => void;
    onExport: () => void;
    onDelete: () => void;
    onClearSelection: () => void;
    batches: { _id: Id<"batches">; name: string }[];
    allTags: string[];
}

import { useState } from "react";

export default function BulkActionBar({
    selectedCount, onChangeStage, onAddTags, onAssignBatch,
    onExport, onDelete, onClearSelection, batches, allTags,
}: BulkActionBarProps) {
    const [showStageMenu, setShowStageMenu] = useState(false);
    const [showTagInput, setShowTagInput] = useState(false);
    const [showBatchMenu, setShowBatchMenu] = useState(false);
    const [tagInput, setTagInput] = useState("");

    if (selectedCount === 0) return null;

    return (
        <div className="sticky top-0 z-30 bg-[#0f172a] dark:bg-slate-800 text-white rounded-xl px-5 py-3 mb-4 flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0EA5E9] flex items-center justify-center text-xs font-bold">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-medium text-white/80">selected</span>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Stage change */}
                <div className="relative">
                    <button
                        onClick={() => { setShowStageMenu(!showStageMenu); setShowTagInput(false); setShowBatchMenu(false); }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                    >
                        Change Stage ▾
                    </button>
                    {showStageMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-xl shadow-xl z-40 min-w-[160px] p-1">
                            {SALES_STAGES.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { onChangeStage(s.id); setShowStageMenu(false); }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#f8fafc] dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-[#0f172a] dark:text-white">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add tags */}
                <div className="relative">
                    <button
                        onClick={() => { setShowTagInput(!showTagInput); setShowStageMenu(false); setShowBatchMenu(false); }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                    >
                        Add Tags ▾
                    </button>
                    {showTagInput && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-xl shadow-xl z-40 min-w-[220px] p-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Tag name..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && tagInput.trim()) {
                                            onAddTags([tagInput.trim()]);
                                            setTagInput("");
                                            setShowTagInput(false);
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white focus:border-[#0EA5E9] focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => {
                                        if (tagInput.trim()) {
                                            onAddTags([tagInput.trim()]);
                                            setTagInput("");
                                            setShowTagInput(false);
                                        }
                                    }}
                                    className="px-3 py-2 bg-[#0EA5E9] text-white rounded-lg text-sm font-medium hover:bg-[#0EA5E9]/90 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {allTags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {allTags.slice(0, 10).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { onAddTags([t]); setShowTagInput(false); }}
                                            className="px-2 py-1 bg-[#f8fafc] dark:bg-slate-800 text-[#4B5563] dark:text-slate-400 text-xs rounded-md hover:bg-[#E5E7EB] dark:hover:bg-slate-700 transition-colors"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Assign to list */}
                <div className="relative">
                    <button
                        onClick={() => { setShowBatchMenu(!showBatchMenu); setShowStageMenu(false); setShowTagInput(false); }}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                    >
                        Assign List ▾
                    </button>
                    {showBatchMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-xl shadow-xl z-40 min-w-[160px] p-1">
                            {batches.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-[#9CA3AF]">No lists</div>
                            ) : batches.map(b => (
                                <button
                                    key={b._id}
                                    onClick={() => { onAssignBatch(b._id); setShowBatchMenu(false); }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#0f172a] dark:text-white hover:bg-[#f8fafc] dark:hover:bg-slate-800 transition-colors"
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Export */}
                <button
                    onClick={onExport}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all"
                >
                    Export
                </button>
            </div>

            <div className="flex items-center gap-2">
                {/* Delete */}
                <button
                    onClick={onDelete}
                    className="px-3 py-1.5 bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] rounded-lg text-sm font-medium transition-all"
                >
                    Delete
                </button>
                {/* Clear selection */}
                <button
                    onClick={onClearSelection}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/50 hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
