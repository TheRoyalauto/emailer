"use client";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useMemo, useCallback } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import ContactFilters from "@/components/contacts/ContactFilters";
import BulkActionBar from "@/components/contacts/BulkActionBar";
import CsvImportModal from "@/components/contacts/CsvImportModal";
import ContactSlideOver from "@/components/contacts/ContactSlideOver";
import MergeContactsModal from "@/components/contacts/MergeContactsModal";

const SALES_STAGES = [
    { id: "new", label: "New", color: "#9CA3AF", icon: "🆕" },
    { id: "contacted", label: "Contacted", color: "#0EA5E9", icon: "📧" },
    { id: "follow_up", label: "Follow-up", color: "#F59E0B", icon: "🔄" },
    { id: "qualified", label: "Qualified", color: "#8B5CF6", icon: "⭐" },
    { id: "closed_won", label: "Closed Won", color: "#10B981", icon: "✅" },
    { id: "closed_lost", label: "Closed Lost", color: "#EF4444", icon: "❌" },
];

function ContactsContent() {
    // ── Queries ──────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedStage, setSelectedStage] = useState("all");
    const [selectedBatch, setSelectedBatch] = useState("all");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const contacts = useAuthQuery(api.contacts.list, {
        searchQuery: searchQuery || undefined,
        status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
        salesStage: selectedStage !== "all" ? selectedStage : undefined,
        batchId: selectedBatch !== "all" ? selectedBatch : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sortBy,
        sortOrder,
    });
    const batches = useAuthQuery(api.batches.list);
    const allTags = useAuthQuery(api.contacts.getAllTags, {});

    // ── Mutations ───────────────────────────────────────
    const createContact = useAuthMutation(api.contacts.create);
    const updateContact = useAuthMutation(api.contacts.update);
    const bulkCreate = useAuthMutation(api.contacts.bulkCreate);
    const bulkDelete = useAuthMutation(api.contacts.bulkDelete);
    const bulkUpdateStage = useAuthMutation(api.contacts.bulkUpdateStage);
    const bulkAddTags = useAuthMutation(api.contacts.bulkAddTags);
    const bulkAssignBatch = useAuthMutation(api.contacts.bulkAssignBatch);
    const mergeContacts = useAuthMutation(api.contacts.merge);

    // ── State ───────────────────────────────────────────
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<Id<"contacts">>>(new Set());
    const [slideOverContact, setSlideOverContact] = useState<any>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [newContact, setNewContact] = useState({ email: "", name: "", company: "", phone: "" });

    // ── Computed ─────────────────────────────────────────
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedStatus !== "all") count++;
        if (selectedStage !== "all") count++;
        if (selectedBatch !== "all") count++;
        if (selectedTags.length > 0) count++;
        return count;
    }, [selectedStatus, selectedStage, selectedBatch, selectedTags]);

    const stageDistribution = useMemo(() => {
        if (!contacts) return {};
        const dist: Record<string, number> = {};
        for (const c of contacts) {
            const stage = c.salesStage || "new";
            dist[stage] = (dist[stage] || 0) + 1;
        }
        return dist;
    }, [contacts]);

    // ── Handlers ────────────────────────────────────────
    const handleSelectAll = useCallback(() => {
        if (!contacts) return;
        if (selectedIds.size === contacts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(contacts.map(c => c._id)));
        }
    }, [contacts, selectedIds]);

    const handleToggleSelect = useCallback((id: Id<"contacts">) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleBulkChangeStage = async (stage: string) => {
        await bulkUpdateStage({ ids: Array.from(selectedIds), stage: stage as any });
        setSelectedIds(new Set());
    };

    const handleBulkAddTags = async (tags: string[]) => {
        await bulkAddTags({ ids: Array.from(selectedIds), tags });
        setSelectedIds(new Set());
    };

    const handleBulkAssignBatch = async (batchId: Id<"batches">) => {
        await bulkAssignBatch({ ids: Array.from(selectedIds), batchId });
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.size} contact${selectedIds.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
        await bulkDelete({ ids: Array.from(selectedIds) });
        setSelectedIds(new Set());
    };

    const handleExport = useCallback(() => {
        if (!contacts) return;
        const toExport = selectedIds.size > 0
            ? contacts.filter(c => selectedIds.has(c._id))
            : contacts;

        const headers = ["Email", "Name", "Company", "Phone", "Location", "Website", "Address", "Status", "Sales Stage", "Tags", "Lead Score"];
        const rows = toExport.map(c => [
            c.email, c.name || "", c.company || "", c.phone || "",
            c.location || "", c.website || "", c.address || "",
            c.status || "active", c.salesStage || "new",
            (c.tags || []).join("; "), c.leadScore || "",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [contacts, selectedIds]);

    const handleImport = async (importedContacts: any[]) => {
        await bulkCreate({ contacts: importedContacts });
        setShowImportModal(false);
    };

    const handleMerge = async (primaryId: Id<"contacts">, mergeIds: Id<"contacts">[]) => {
        await mergeContacts({ primaryId, mergeIds });
        setShowMergeModal(false);
        setSelectedIds(new Set());
    };

    const handleAddContact = async () => {
        if (!newContact.email.trim()) return;
        await createContact({
            email: newContact.email.trim(),
            name: newContact.name.trim() || undefined,
            company: newContact.company.trim() || undefined,
            phone: newContact.phone.trim() || undefined,
        });
        setNewContact({ email: "", name: "", company: "", phone: "" });
        setShowAddContact(false);
    };

    const clearAllFilters = () => {
        setSelectedStatus("all");
        setSelectedStage("all");
        setSelectedBatch("all");
        setSelectedTags([]);
        setSearchQuery("");
    };

    const getStageInfo = (stageId: string) => SALES_STAGES.find(s => s.id === stageId) || SALES_STAGES[0];

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-20 md:pb-0">
            <AppHeader />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ── Page Header ──────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Contacts</h1>
                        <p className="text-sm text-[#9CA3AF] mt-0.5">
                            {contacts === undefined ? "Loading..." : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
                            {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.size >= 2 && (
                            <button
                                onClick={() => setShowMergeModal(true)}
                                className="px-4 py-2.5 bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 rounded-xl text-sm font-medium hover:bg-[#8B5CF6]/20 transition-all"
                            >
                                Merge ({selectedIds.size})
                            </button>
                        )}
                        <button
                            onClick={handleExport}
                            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#4B5563] dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-[#f8fafc] dark:hover:bg-slate-700 transition-all"
                        >
                            Export
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#4B5563] dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-[#f8fafc] dark:hover:bg-slate-700 transition-all"
                        >
                            Import CSV
                        </button>
                        <button
                            onClick={() => setShowAddContact(true)}
                            className="px-4 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all shadow-sm"
                        >
                            + Add Contact
                        </button>
                    </div>
                </div>

                {/* ── Stage Distribution Bar ──────────────────── */}
                {contacts && contacts.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                        {SALES_STAGES.map(stage => {
                            const count = stageDistribution[stage.id] || 0;
                            const pct = contacts.length > 0 ? Math.round((count / contacts.length) * 100) : 0;
                            return (
                                <button
                                    key={stage.id}
                                    onClick={() => setSelectedStage(selectedStage === stage.id ? "all" : stage.id)}
                                    className={`p-3 rounded-xl border transition-all text-left bg-white dark:bg-slate-900 ${selectedStage === stage.id
                                        ? "ring-2 ring-offset-1 dark:ring-offset-slate-950 shadow-sm"
                                        : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#9CA3AF]"
                                        }`}
                                    style={{
                                        backgroundColor: selectedStage === stage.id ? `${stage.color}12` : undefined,
                                        borderColor: selectedStage === stage.id ? `${stage.color}40` : undefined,
                                        ...(selectedStage === stage.id ? { boxShadow: `0 0 0 2px var(--tw-ring-offset-color, white), 0 0 0 3.5px ${stage.color}` } : {}),
                                    }}
                                >
                                    <div className="text-lg font-bold text-[#0f172a] dark:text-white">{count}</div>
                                    <div className="text-xs text-[#9CA3AF] flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                                        {stage.label}
                                    </div>
                                    <div className="h-1 bg-[#E5E7EB] dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Filter Bar ──────────────────────────────── */}
                <ContactFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    selectedStage={selectedStage}
                    onStageChange={setSelectedStage}
                    selectedBatch={selectedBatch}
                    onBatchChange={setSelectedBatch}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    batches={(batches || []).map(b => ({ _id: b._id, name: b.name }))}
                    allTags={allTags || []}
                    activeFilterCount={activeFilterCount}
                    onClearAll={clearAllFilters}
                />

                {/* ── Bulk Action Bar ─────────────────────────── */}
                <BulkActionBar
                    selectedCount={selectedIds.size}
                    onChangeStage={handleBulkChangeStage}
                    onAddTags={handleBulkAddTags}
                    onAssignBatch={handleBulkAssignBatch}
                    onExport={handleExport}
                    onDelete={handleBulkDelete}
                    onClearSelection={() => setSelectedIds(new Set())}
                    batches={(batches || []).map(b => ({ _id: b._id, name: b.name }))}
                    allTags={allTags || []}
                />

                {/* ── Loading State ───────────────────────────── */}
                {contacts === undefined && (
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 p-4 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#E5E7EB] dark:bg-slate-700" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-[#E5E7EB] dark:bg-slate-700 rounded w-1/3" />
                                        <div className="h-3 bg-[#F1F3F8] dark:bg-slate-800 rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Empty State ─────────────────────────────── */}
                {contacts && contacts.length === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 p-16 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-center text-4xl">
                            👥
                        </div>
                        <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-2">
                            {activeFilterCount > 0 ? "No contacts match your filters" : "No contacts yet"}
                        </h3>
                        <p className="text-[#9CA3AF] max-w-md mx-auto mb-6">
                            {activeFilterCount > 0
                                ? "Try adjusting your filters or clearing them to see all contacts."
                                : "Add your first contact manually or import a CSV file to get started."
                            }
                        </p>
                        <div className="flex gap-3 justify-center">
                            {activeFilterCount > 0 ? (
                                <button onClick={clearAllFilters} className="px-5 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all">
                                    Clear Filters
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => setShowAddContact(true)} className="px-5 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all">
                                        + Add Contact
                                    </button>
                                    <button onClick={() => setShowImportModal(true)} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#4B5563] dark:text-slate-300 rounded-xl text-sm font-medium">
                                        Import CSV
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ── List View ───────────────────────────────── */}
                {contacts && contacts.length > 0 && viewMode === "list" && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-[auto,2fr,1fr,1fr,1fr,auto] gap-4 px-5 py-3 bg-[#f8fafc] dark:bg-slate-800/50 border-b border-[#E5E7EB] dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={contacts.length > 0 && selectedIds.size === contacts.length}
                                    onChange={handleSelectAll}
                                    className="rounded border-[#E5E7EB] text-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                                />
                            </div>
                            <div>Contact</div>
                            <div>Company</div>
                            <div>Stage</div>
                            <div>Tags</div>
                            <div>Activity</div>
                        </div>

                        {/* Table rows */}
                        {contacts.map(contact => {
                            const stage = getStageInfo(contact.salesStage || "new");
                            return (
                                <div
                                    key={contact._id}
                                    className={`grid grid-cols-[auto,2fr,1fr,1fr,1fr,auto] gap-4 px-5 py-3.5 items-center border-b border-[#F1F3F8] dark:border-slate-800 last:border-0 hover:bg-[#f8fafc]/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${selectedIds.has(contact._id) ? "bg-[#0EA5E9]/[0.03]" : ""
                                        }`}
                                    onClick={() => setSlideOverContact(contact)}
                                >
                                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(contact._id)}
                                            onChange={() => handleToggleSelect(contact._id)}
                                            className="rounded border-[#E5E7EB] text-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9]/20 to-[#10B981]/20 flex items-center justify-center text-sm font-bold text-[#0EA5E9] flex-shrink-0">
                                            {contact.name?.charAt(0).toUpperCase() || contact.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-[#0f172a] dark:text-white truncate">
                                                {contact.name || contact.email.split("@")[0]}
                                            </div>
                                            <div className="text-xs text-[#9CA3AF] truncate">{contact.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-[#4B5563] dark:text-slate-400 truncate">{contact.company || "—"}</div>
                                    <div>
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                                            style={{
                                                backgroundColor: `${stage.color}15`,
                                                color: stage.color,
                                            }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                                            {stage.label}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {(contact.tags || []).slice(0, 2).map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 bg-[#f8fafc] dark:bg-slate-800 text-[#4B5563] dark:text-slate-400 text-xs rounded border border-[#E5E7EB] dark:border-slate-700">
                                                {tag}
                                            </span>
                                        ))}
                                        {(contact.tags || []).length > 2 && (
                                            <span className="px-1.5 py-0.5 bg-[#f8fafc] dark:bg-slate-800 text-[#9CA3AF] text-xs rounded">
                                                +{(contact.tags || []).length - 2}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-[#9CA3AF] whitespace-nowrap">
                                        {contact.lastEmailAt ? formatRelativeTime(contact.lastEmailAt) : "—"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Grid View ───────────────────────────────── */}
                {contacts && contacts.length > 0 && viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {contacts.map(contact => {
                            const stage = getStageInfo(contact.salesStage || "new");
                            return (
                                <div
                                    key={contact._id}
                                    className={`p-4 bg-white dark:bg-slate-900 rounded-xl border transition-all cursor-pointer group hover:shadow-md hover:border-[#0EA5E9]/30 ${selectedIds.has(contact._id) ? "border-[#0EA5E9] bg-[#0EA5E9]/[0.02]" : "border-[#E5E7EB] dark:border-slate-700"
                                        }`}
                                    onClick={() => setSlideOverContact(contact)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9]/20 to-[#10B981]/20 flex items-center justify-center text-lg font-bold text-[#0EA5E9]">
                                                {contact.name?.charAt(0).toUpperCase() || contact.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-[#0f172a] dark:text-white">
                                                    {contact.name || contact.email.split("@")[0]}
                                                </div>
                                                <div className="text-xs text-[#9CA3AF]">{contact.email}</div>
                                            </div>
                                        </div>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(contact._id)}
                                                onChange={() => handleToggleSelect(contact._id)}
                                                className="rounded border-[#E5E7EB] text-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                                            />
                                        </div>
                                    </div>
                                    {contact.company && (
                                        <div className="text-xs text-[#4B5563] dark:text-slate-400 mb-2">🏢 {contact.company}</div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                                            style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                                            {stage.label}
                                        </span>
                                        <div className="flex gap-1">
                                            {(contact.tags || []).slice(0, 1).map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 bg-[#f8fafc] dark:bg-slate-800 text-[#4B5563] dark:text-slate-400 text-xs rounded border border-[#E5E7EB] dark:border-slate-700">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(contact.tags || []).length > 1 && (
                                                <span className="px-1.5 py-0.5 text-[#9CA3AF] text-xs">
                                                    +{(contact.tags || []).length - 1}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ── Add Contact Inline Modal ────────────────── */}
            {showAddContact && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddContact(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 max-w-md w-full shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white mb-4">Add Contact</h2>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email *"
                                value={newContact.email}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-sm text-[#0f172a] dark:text-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:outline-none"
                                autoFocus
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    className="px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-sm text-[#0f172a] dark:text-white focus:border-[#0EA5E9] focus:outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Company"
                                    value={newContact.company}
                                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                                    className="px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-sm text-[#0f172a] dark:text-white focus:border-[#0EA5E9] focus:outline-none"
                                />
                            </div>
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-sm text-[#0f172a] dark:text-white focus:border-[#0EA5E9] focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowAddContact(false)}
                                className="px-4 py-2.5 text-sm text-[#4B5563] hover:text-[#0f172a] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddContact}
                                disabled={!newContact.email.trim()}
                                className="px-5 py-2.5 bg-[#0f172a] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#0f172a]/90 transition-all"
                            >
                                Create Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modals & Panels ─────────────────────────── */}
            {showImportModal && (
                <CsvImportModal
                    onImport={handleImport}
                    onClose={() => setShowImportModal(false)}
                />
            )}

            {slideOverContact && (
                <ContactSlideOver
                    contact={slideOverContact}
                    onClose={() => setSlideOverContact(null)}
                    onUpdated={() => { }}
                    onDeleted={() => setSlideOverContact(null)}
                />
            )}

            {showMergeModal && contacts && (
                <MergeContactsModal
                    contacts={contacts.filter((c: any) => selectedIds.has(c._id))}
                    onMerge={handleMerge}
                    onClose={() => setShowMergeModal(false)}
                />
            )}
        </div>
    );
}

export default function ContactsPage() {
    return (
        <AuthGuard>
            <ContactsContent />
        </AuthGuard>
    );
}
