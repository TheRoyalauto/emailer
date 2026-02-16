"use client";

import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

interface Batch {
    _id: Id<"batches">;
    name: string;
    description?: string;
    color?: string;
    contactCount: number;
    parentBatchId?: Id<"batches">;
    createdAt: number;
}

interface BatchManagerProps {
    batches: Batch[];
    selectedBatch: string;
    onSelectBatch: (batchId: string) => void;
    onCreateBatch: (data: { name: string; description?: string; color?: string; parentBatchId?: Id<"batches"> }) => Promise<void>;
    onUpdateBatch: (data: { id: Id<"batches">; name?: string; description?: string; color?: string }) => Promise<void>;
    onDeleteBatch: (id: Id<"batches">) => Promise<void>;
}

const BATCH_COLORS = [
    "#0EA5E9", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444",
    "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

export default function BatchManager({
    batches,
    selectedBatch,
    onSelectBatch,
    onCreateBatch,
    onUpdateBatch,
    onDeleteBatch,
}: BatchManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingBatchId, setEditingBatchId] = useState<Id<"batches"> | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", color: "#0EA5E9" });
    const [confirmDelete, setConfirmDelete] = useState<Id<"batches"> | null>(null);

    const parentBatches = batches.filter(b => !b.parentBatchId);
    const getChildren = (parentId: Id<"batches">) => batches.filter(b => b.parentBatchId === parentId);
    const totalContacts = batches.reduce((sum, b) => sum + b.contactCount, 0);

    const resetForm = () => {
        setFormData({ name: "", description: "", color: "#0EA5E9" });
        setShowCreateForm(false);
        setEditingBatchId(null);
    };

    const handleCreate = async () => {
        if (!formData.name.trim()) return;
        await onCreateBatch({
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            color: formData.color,
        });
        resetForm();
    };

    const handleUpdate = async () => {
        if (!editingBatchId || !formData.name.trim()) return;
        await onUpdateBatch({
            id: editingBatchId,
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            color: formData.color,
        });
        resetForm();
    };

    const handleDelete = async (id: Id<"batches">) => {
        await onDeleteBatch(id);
        setConfirmDelete(null);
        if (selectedBatch === id) {
            onSelectBatch("all");
        }
    };

    const startEdit = (batch: Batch) => {
        setEditingBatchId(batch._id);
        setFormData({
            name: batch.name,
            description: batch.description || "",
            color: batch.color || "#0EA5E9",
        });
        setShowCreateForm(false);
    };

    return (
        <div className="mb-4">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border transition-all ${isOpen
                        ? "border-[#0EA5E9]/30 shadow-sm ring-1 ring-[#0EA5E9]/10"
                        : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#9CA3AF]"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0EA5E9]/15 to-[#8B5CF6]/15 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-[#0f172a] dark:text-white">
                            Contact Batches
                        </div>
                        <div className="text-xs text-[#9CA3AF]">
                            {batches.length} batch{batches.length !== 1 ? "es" : ""} · {totalContacts} contact{totalContacts !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>
                <svg
                    className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expanded Panel */}
            {isOpen && (
                <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm overflow-hidden animate-[slideUp_0.2s_ease-out]">
                    {/* Header with Create Button */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F3F8] dark:border-slate-800">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Manage Batches</span>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowCreateForm(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            New Batch
                        </button>
                    </div>

                    {/* Create / Edit Form */}
                    {(showCreateForm || editingBatchId) && (
                        <div className="px-4 py-4 border-b border-[#F1F3F8] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/50">
                            <div className="text-xs font-semibold text-[#0f172a] dark:text-white mb-3">
                                {editingBatchId ? "Edit Batch" : "Create New Batch"}
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Batch name *"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:outline-none"
                                    autoFocus
                                />
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm text-[#0f172a] dark:text-white focus:border-[#0EA5E9] focus:outline-none"
                                />
                                {/* Color Picker */}
                                <div>
                                    <div className="text-xs text-[#9CA3AF] mb-1.5">Color</div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {BATCH_COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${formData.color === color ? "border-[#0f172a] dark:border-white scale-110 shadow-sm" : "border-transparent"
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex gap-2 justify-end pt-1">
                                    <button
                                        onClick={resetForm}
                                        className="px-3 py-1.5 text-xs text-[#4B5563] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={editingBatchId ? handleUpdate : handleCreate}
                                        disabled={!formData.name.trim()}
                                        className="px-4 py-1.5 bg-[#0EA5E9] text-white rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-[#0EA5E9]/90 transition-all"
                                    >
                                        {editingBatchId ? "Save Changes" : "Create Batch"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Batch List */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {/* "All Contacts" option */}
                        <button
                            onClick={() => onSelectBatch("all")}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#F1F3F8] dark:border-slate-800 ${selectedBatch === "all"
                                    ? "bg-[#0EA5E9]/[0.06] dark:bg-[#0EA5E9]/10"
                                    : "hover:bg-[#f8fafc] dark:hover:bg-slate-800/50"
                                }`}
                        >
                            <div className="w-7 h-7 rounded-lg bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-sm">
                                📋
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#0f172a] dark:text-white">All Contacts</div>
                            </div>
                            <span className="text-xs text-[#9CA3AF] font-medium tabular-nums">{totalContacts}</span>
                        </button>

                        {/* "Unassigned" option */}
                        <button
                            onClick={() => onSelectBatch("unassigned")}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#F1F3F8] dark:border-slate-800 ${selectedBatch === "unassigned"
                                    ? "bg-[#0EA5E9]/[0.06] dark:bg-[#0EA5E9]/10"
                                    : "hover:bg-[#f8fafc] dark:hover:bg-slate-800/50"
                                }`}
                        >
                            <div className="w-7 h-7 rounded-lg bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-sm">
                                📁
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#4B5563] dark:text-slate-400">Unassigned</div>
                            </div>
                        </button>

                        {/* Batch Items */}
                        {parentBatches.length === 0 && !showCreateForm && (
                            <div className="px-4 py-8 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-2xl">
                                    📦
                                </div>
                                <div className="text-sm font-medium text-[#0f172a] dark:text-white mb-1">No batches yet</div>
                                <div className="text-xs text-[#9CA3AF] mb-3">Organize your contacts into groups</div>
                                <button
                                    onClick={() => { resetForm(); setShowCreateForm(true); }}
                                    className="px-4 py-2 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold hover:bg-[#0f172a]/90 transition-all"
                                >
                                    + Create First Batch
                                </button>
                            </div>
                        )}

                        {parentBatches.map(batch => {
                            const children = getChildren(batch._id);
                            const isSelected = selectedBatch === batch._id;
                            const batchColor = batch.color || "#9CA3AF";

                            return (
                                <div key={batch._id}>
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3 transition-colors border-b border-[#F1F3F8] dark:border-slate-800 group ${isSelected
                                                ? "bg-[#0EA5E9]/[0.06] dark:bg-[#0EA5E9]/10"
                                                : "hover:bg-[#f8fafc] dark:hover:bg-slate-800/50"
                                            }`}
                                    >
                                        <button
                                            onClick={() => onSelectBatch(isSelected ? "all" : batch._id)}
                                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                        >
                                            <div
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: batchColor }}
                                            >
                                                {batch.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-[#0f172a] dark:text-white truncate">{batch.name}</div>
                                                {batch.description && (
                                                    <div className="text-xs text-[#9CA3AF] truncate">{batch.description}</div>
                                                )}
                                            </div>
                                            <span className="text-xs text-[#9CA3AF] font-medium tabular-nums flex-shrink-0">
                                                {batch.contactCount}
                                            </span>
                                        </button>

                                        {/* Actions */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); startEdit(batch); }}
                                                className="p-1.5 text-[#9CA3AF] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-md transition-all"
                                                title="Edit"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(batch._id); }}
                                                className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md transition-all"
                                                title="Delete"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Child Batches */}
                                    {children.map(child => {
                                        const childSelected = selectedBatch === child._id;
                                        const childColor = child.color || batchColor;
                                        return (
                                            <div
                                                key={child._id}
                                                className={`flex items-center gap-3 pl-10 pr-4 py-2.5 transition-colors border-b border-[#F1F3F8] dark:border-slate-800 group ${childSelected
                                                        ? "bg-[#0EA5E9]/[0.06] dark:bg-[#0EA5E9]/10"
                                                        : "hover:bg-[#f8fafc] dark:hover:bg-slate-800/50"
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => onSelectBatch(childSelected ? "all" : child._id)}
                                                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                                        style={{ backgroundColor: childColor }}
                                                    >
                                                        {child.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-medium text-[#4B5563] dark:text-slate-400 truncate">{child.name}</span>
                                                    <span className="text-[10px] text-[#9CA3AF] tabular-nums flex-shrink-0">{child.contactCount}</span>
                                                </button>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startEdit(child); }}
                                                        className="p-1 text-[#9CA3AF] hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded transition-all"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(child._id); }}
                                                        className="p-1 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-all"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 max-w-sm w-full shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-center text-2xl">
                            🗑
                        </div>
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white text-center mb-2">Delete Batch</h3>
                        <p className="text-sm text-[#9CA3AF] text-center mb-6">
                            This will remove the batch. Contacts in this batch will be unassigned but not deleted.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 bg-[#f8fafc] dark:bg-slate-800 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 rounded-xl text-sm font-semibold text-[#4B5563] dark:text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDelete)}
                                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white transition-colors"
                            >
                                Delete Batch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
