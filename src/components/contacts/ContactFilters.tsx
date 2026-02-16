"use client";

import { useState } from "react";
import { Id } from "@/../convex/_generated/dataModel";

const SALES_STAGES = [
    { id: "new", label: "New", color: "#9CA3AF", icon: "🆕" },
    { id: "contacted", label: "Contacted", color: "#0EA5E9", icon: "📧" },
    { id: "follow_up", label: "Follow-up", color: "#F59E0B", icon: "🔄" },
    { id: "qualified", label: "Qualified", color: "#8B5CF6", icon: "⭐" },
    { id: "closed_won", label: "Closed Won", color: "#10B981", icon: "✅" },
    { id: "closed_lost", label: "Closed Lost", color: "#EF4444", icon: "❌" },
];

const STATUS_OPTIONS = [
    { id: "active", label: "Active", color: "#10B981" },
    { id: "unsubscribed", label: "Unsubscribed", color: "#F59E0B" },
    { id: "bounced", label: "Bounced", color: "#EF4444" },
];

interface ContactFiltersProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    selectedStatus: string;
    onStatusChange: (s: string) => void;
    selectedStage: string;
    onStageChange: (s: string) => void;
    selectedBatch: string;
    onBatchChange: (b: string) => void;
    selectedTags: string[];
    onTagsChange: (t: string[]) => void;
    sortBy: string;
    onSortChange: (s: string) => void;
    sortOrder: "asc" | "desc";
    onSortOrderChange: (o: "asc" | "desc") => void;
    viewMode: "list" | "grid";
    onViewModeChange: (m: "list" | "grid") => void;
    batches: { _id: Id<"batches">; name: string }[];
    allTags: string[];
    activeFilterCount: number;
    onClearAll: () => void;
}

export default function ContactFilters({
    searchQuery, onSearchChange,
    selectedStatus, onStatusChange,
    selectedStage, onStageChange,
    selectedBatch, onBatchChange,
    selectedTags, onTagsChange,
    sortBy, onSortChange,
    sortOrder, onSortOrderChange,
    viewMode, onViewModeChange,
    batches, allTags,
    activeFilterCount, onClearAll,
}: ContactFiltersProps) {
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 mb-6 space-y-4">
            {/* Top row: search + sort + view toggle */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[280px] relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all text-sm text-slate-900 dark:text-white placeholder:text-gray-400"
                    />
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-sky-500 focus:outline-none transition-all text-sm text-gray-600 dark:text-slate-300 cursor-pointer"
                >
                    <option value="name">Sort: Name</option>
                    <option value="email">Sort: Email</option>
                    <option value="company">Sort: Company</option>
                    <option value="lastEmailAt">Sort: Last Activity</option>
                    <option value="leadScore">Sort: Lead Score</option>
                </select>

                <button
                    onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-sm text-gray-600 dark:text-slate-300"
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                    {sortOrder === "asc" ? "↑" : "↓"}
                </button>

                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => onViewModeChange("list")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                    </button>
                    <button
                        onClick={() => onViewModeChange("grid")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                    </button>
                </div>
            </div>

            {/* Filter chips row */}
            <div className="flex flex-wrap gap-2 items-center">
                {/* Status filter */}
                <select
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${selectedStatus !== "all"
                        ? "bg-sky-500/10 border-sky-500/30 text-sky-500"
                        : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
                        }`}
                >
                    <option value="all">All Statuses</option>
                    {STATUS_OPTIONS.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                </select>

                {/* Stage filter */}
                <select
                    value={selectedStage}
                    onChange={(e) => onStageChange(e.target.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${selectedStage !== "all"
                        ? "bg-violet-500/10 border-violet-500/30 text-violet-500"
                        : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
                        }`}
                >
                    <option value="all">All Stages</option>
                    {SALES_STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                    ))}
                </select>

                {/* Batch filter */}
                <select
                    value={selectedBatch}
                    onChange={(e) => onBatchChange(e.target.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${selectedBatch !== "all"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
                        }`}
                >
                    <option value="all">All Lists</option>
                    {batches.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                </select>

                {/* Tags dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowTagDropdown(!showTagDropdown)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selectedTags.length > 0
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                            : "bg-slate-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300"
                            }`}
                    >
                        Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                        <span className="ml-1">▾</span>
                    </button>
                    {showTagDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-20 min-w-[200px] max-h-[240px] overflow-y-auto p-2">
                            {allTags.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-400">No tags yet</div>
                            ) : allTags.map(tag => (
                                <label key={tag} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onTagsChange([...selectedTags, tag]);
                                            } else {
                                                onTagsChange(selectedTags.filter(t => t !== tag));
                                            }
                                        }}
                                        className="rounded border-gray-200 dark:border-slate-600 text-sky-500 focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-slate-900 dark:text-white">{tag}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active filter count + clear */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-900/30 transition-all"
                    >
                        Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                    </button>
                )}
            </div>
        </div>
    );
}
