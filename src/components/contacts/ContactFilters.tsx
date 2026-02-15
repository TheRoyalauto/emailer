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
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 mb-6 space-y-4">
            {/* Top row: search + sort + view toggle */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex-1 min-w-[280px] relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f8fafc] border border-[#E5E7EB] rounded-xl focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:outline-none transition-all text-sm text-[#0f172a] placeholder:text-[#9CA3AF]"
                    />
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="px-3 py-2.5 bg-[#f8fafc] border border-[#E5E7EB] rounded-xl focus:border-[#0EA5E9] focus:outline-none transition-all text-sm text-[#4B5563] cursor-pointer"
                >
                    <option value="name">Sort: Name</option>
                    <option value="email">Sort: Email</option>
                    <option value="company">Sort: Company</option>
                    <option value="lastEmailAt">Sort: Last Activity</option>
                    <option value="leadScore">Sort: Lead Score</option>
                </select>

                <button
                    onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                    className="p-2.5 bg-[#f8fafc] border border-[#E5E7EB] rounded-xl hover:bg-[#E5E7EB] transition-all text-sm text-[#4B5563]"
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                    {sortOrder === "asc" ? "↑" : "↓"}
                </button>

                <div className="flex bg-[#f8fafc] rounded-xl p-1 border border-[#E5E7EB]">
                    <button
                        onClick={() => onViewModeChange("list")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "list" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#9CA3AF] hover:text-[#4B5563]"}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                    </button>
                    <button
                        onClick={() => onViewModeChange("grid")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "grid" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#9CA3AF] hover:text-[#4B5563]"}`}
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
                        ? "bg-[#0EA5E9]/10 border-[#0EA5E9]/30 text-[#0EA5E9]"
                        : "bg-[#f8fafc] border-[#E5E7EB] text-[#4B5563]"
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
                        ? "bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#8B5CF6]"
                        : "bg-[#f8fafc] border-[#E5E7EB] text-[#4B5563]"
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
                        ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                        : "bg-[#f8fafc] border-[#E5E7EB] text-[#4B5563]"
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
                            ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]"
                            : "bg-[#f8fafc] border-[#E5E7EB] text-[#4B5563]"
                            }`}
                    >
                        Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                        <span className="ml-1">▾</span>
                    </button>
                    {showTagDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 min-w-[200px] max-h-[240px] overflow-y-auto p-2">
                            {allTags.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-[#9CA3AF]">No tags yet</div>
                            ) : allTags.map(tag => (
                                <label key={tag} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f8fafc] cursor-pointer">
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
                                        className="rounded border-[#E5E7EB] text-[#0EA5E9] focus:ring-[#0EA5E9]"
                                    />
                                    <span className="text-sm text-[#0f172a]">{tag}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active filter count + clear */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/20 transition-all"
                    >
                        Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                    </button>
                )}
            </div>
        </div>
    );
}
