"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import ContactDetail from "@/components/ContactDetail";
import { Id } from "../../../convex/_generated/dataModel";

// Color options for batches
const BATCH_COLORS = [
    "#6366f1", // indigo
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
];

// Parse raw text into contacts
function parseContacts(rawText: string): { email: string; phone?: string; name?: string }[] {
    const contacts: { email: string; phone?: string; name?: string }[] = [];
    const seen = new Set<string>();

    // Split by common delimiters
    const lines = rawText.split(/[\n,;]+/);

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Email regex
        const emailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        // Phone regex (various formats)
        const phoneMatch = trimmed.match(/(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);

        if (emailMatch) {
            const email = emailMatch[1].toLowerCase();
            if (!seen.has(email)) {
                seen.add(email);
                const contact: { email: string; phone?: string; name?: string } = { email };

                // Try to extract phone if present
                if (phoneMatch) {
                    contact.phone = phoneMatch[1].replace(/[-.\s()]/g, '');
                }

                // Try to extract name (text before email)
                const beforeEmail = trimmed.substring(0, trimmed.indexOf(emailMatch[1])).trim();
                if (beforeEmail && !beforeEmail.match(/^[\d\s+()-]+$/)) {
                    contact.name = beforeEmail.replace(/[<>:,;]+$/, '').trim();
                }

                contacts.push(contact);
            }
        } else if (phoneMatch) {
            // Phone-only entry
            const phone = phoneMatch[1].replace(/[-.\s()]/g, '');
            if (!seen.has(phone)) {
                seen.add(phone);
                contacts.push({
                    email: `${phone}@sms.placeholder`,
                    phone
                });
            }
        }
    }

    return contacts;
}

function ContactsPage() {
    const contacts = useQuery(api.contacts.list, {});
    const batches = useQuery(api.batches.list);
    const bulkCreate = useMutation(api.contacts.bulkCreate);
    const createContact = useMutation(api.contacts.create);
    const createBatch = useMutation(api.batches.create);
    const deleteContact = useMutation(api.contacts.remove);
    const deleteBatch = useMutation(api.batches.remove);
    const createBatchFromSelection = useMutation(api.batches.createFromSelection);

    // Import state
    const [showImport, setShowImport] = useState(false);
    const [rawText, setRawText] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    const [createNewBatch, setCreateNewBatch] = useState(false);
    const [newBatchName, setNewBatchName] = useState("");
    const [newBatchColor, setNewBatchColor] = useState(BATCH_COLORS[0]);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ created: number; skipped: number } | null>(null);

    // Add single contact state
    const [showAddContact, setShowAddContact] = useState(false);
    const [newContactEmail, setNewContactEmail] = useState("");
    const [newContactName, setNewContactName] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");
    const [addingContact, setAddingContact] = useState(false);

    // Handle URL-based modal opening (from dashboard quick actions)
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setShowAddContact(true);
        }
    }, [searchParams]);

    // View state: 'batches' shows batch cards, 'all' shows all contacts, or a specific batchId shows that batch's contacts
    const [viewMode, setViewMode] = useState<string>("batches");

    // Nested batch navigation
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [showCreateSubBatch, setShowCreateSubBatch] = useState(false);
    const [subBatchName, setSubBatchName] = useState("");
    const [subBatchColor, setSubBatchColor] = useState(BATCH_COLORS[0]);
    const [creatingSubBatch, setCreatingSubBatch] = useState(false);

    // Contact detail view
    const [viewContactId, setViewContactId] = useState<Id<"contacts"> | null>(null);

    // Multi-select state
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [selectionBatchName, setSelectionBatchName] = useState("");
    const [selectionBatchColor, setSelectionBatchColor] = useState(BATCH_COLORS[0]);
    const [creatingBatch, setCreatingBatch] = useState(false);

    // Get parent batches (no parentBatchId) and child batches (has parentBatchId)
    const parentBatches = batches?.filter(b => !b.parentBatchId) || [];
    const currentChildBatches = batches?.filter(b => b.parentBatchId === currentParentId) || [];
    const currentParent = batches?.find(b => b._id === currentParentId);


    const parsedContacts = parseContacts(rawText);

    const filteredContacts = contacts?.filter(c => {
        if (viewMode === "all") return true;
        if (viewMode === "none") return !c.batchId;
        if (viewMode === "batches") return false; // Don't show any contacts in batches view
        return c.batchId === viewMode;
    });

    const handleImport = async () => {
        if (parsedContacts.length === 0) return;
        setImporting(true);
        setImportResult(null);

        try {
            let batchId: string | undefined = selectedBatchId || undefined;

            // Create new batch if requested
            if (createNewBatch && newBatchName.trim()) {
                batchId = await createBatch({
                    name: newBatchName.trim(),
                    color: newBatchColor,
                });
            }

            const result = await bulkCreate({
                contacts: parsedContacts.map(c => ({
                    email: c.email,
                    name: c.name,
                    phone: c.phone,
                })),
                batchId: batchId as any,
            });

            setImportResult(result);
            setRawText("");
            setNewBatchName("");
            setCreateNewBatch(false);
        } catch (error) {
            console.error("Import failed:", error);
        } finally {
            setImporting(false);
        }
    };

    const handleAddContact = async () => {
        if (!newContactEmail.trim()) return;
        setAddingContact(true);
        try {
            await createContact({
                email: newContactEmail.trim().toLowerCase(),
                name: newContactName.trim() || undefined,
                phone: newContactPhone.trim() || undefined,
            });
            setNewContactEmail("");
            setNewContactName("");
            setNewContactPhone("");
            setShowAddContact(false);
        } catch (error) {
            console.error("Failed to add contact:", error);
            alert("Failed to add contact. Email may already exist.");
        } finally {
            setAddingContact(false);
        }
    };

    const getBatchColor = (batchId: string | undefined) => {
        if (!batchId) return null;
        const batch = batches?.find(b => b._id === batchId);
        return batch?.color;
    };

    const getBatchName = (batchId: string | undefined) => {
        if (!batchId) return null;
        const batch = batches?.find(b => b._id === batchId);
        return batch?.name;
    };

    // Multi-select helpers with shift+click range selection
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const handleContactClick = (contactId: string, index: number, event: React.MouseEvent) => {
        if (event.shiftKey && lastSelectedIndex !== null && filteredContacts) {
            // Shift+click: select range
            const start = Math.min(lastSelectedIndex, index);
            const end = Math.max(lastSelectedIndex, index);
            const rangeIds = filteredContacts.slice(start, end + 1).map(c => c._id);
            setSelectedContacts(prev => {
                const next = new Set(prev);
                rangeIds.forEach(id => next.add(id));
                return next;
            });
        } else {
            // Regular click: toggle single
            setSelectedContacts(prev => {
                const next = new Set(prev);
                if (next.has(contactId)) {
                    next.delete(contactId);
                } else {
                    next.add(contactId);
                }
                return next;
            });
            setLastSelectedIndex(index);
        }
    };

    const selectAllVisible = () => {
        if (!filteredContacts) return;
        setSelectedContacts(new Set(filteredContacts.map(c => c._id)));
    };

    const clearSelection = () => {
        setSelectedContacts(new Set());
        setLastSelectedIndex(null);
    };

    const handleCreateBatchFromSelection = async () => {
        if (selectedContacts.size === 0 || !selectionBatchName.trim()) return;
        setCreatingBatch(true);
        try {
            await createBatchFromSelection({
                name: selectionBatchName.trim(),
                color: selectionBatchColor,
                contactIds: Array.from(selectedContacts) as any,
                parentBatchId: currentParentId as any,
            });
            setShowBatchModal(false);
            setSelectionBatchName("");
            setSelectionBatchColor(BATCH_COLORS[0]);
            setSelectedContacts(new Set());
            if (currentParentId) {
                // Stay in parent view after creating sub-batch
            } else {
                setViewMode("batches");
            }
        } catch (error) {
            console.error("Failed to create batch:", error);
            alert("Failed to create batch from selection");
        } finally {
            setCreatingBatch(false);
        }
    };

    const handleCreateSubBatch = async () => {
        if (!currentParentId || !subBatchName.trim()) return;
        setCreatingSubBatch(true);
        try {
            await createBatch({
                name: subBatchName.trim(),
                color: subBatchColor,
                parentBatchId: currentParentId as any,
            });
            setShowCreateSubBatch(false);
            setSubBatchName("");
            setSubBatchColor(BATCH_COLORS[0]);
        } catch (error) {
            console.error("Failed to create sub-batch:", error);
            alert("Failed to create sub-batch");
        } finally {
            setCreatingSubBatch(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header with Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Contacts
                        </h1>
                        <p className="text-white/50 mt-1">{contacts?.length || 0} total contacts in your master list</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAddContact(true)}
                            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Add Contact
                        </button>
                        <button
                            onClick={() => setShowImport(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <span className="text-lg">📥</span> Import Batch
                        </button>
                    </div>
                </div>

                {/* Back button when viewing contacts */}
                {viewMode !== "batches" && (
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setViewMode("batches")}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                            ← Back to Batches
                        </button>
                        <div className="h-6 w-px bg-white/20" />
                        <div className="flex items-center gap-3">
                            {viewMode !== "all" && viewMode !== "none" && getBatchColor(viewMode) && (
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: getBatchColor(viewMode) || "#6366f1" }}
                                />
                            )}
                            <h2 className="text-xl font-semibold">
                                {viewMode === "all" ? "All Contacts" : viewMode === "none" ? "Unbatched Contacts" : getBatchName(viewMode)}
                            </h2>
                            <span className="text-white/50">
                                ({filteredContacts?.length || 0} contacts)
                            </span>
                        </div>
                    </div>
                )}

                {/* Batches Grid - Only show when in batches view */}
                {viewMode === "batches" && (
                    <div>
                        {/* Parent batch navigation breadcrumb */}
                        {currentParentId && (
                            <div className="flex items-center gap-3 mb-6">
                                <button
                                    onClick={() => setCurrentParentId(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-white/60 hover:text-white"
                                >
                                    ← Back to All Batches
                                </button>
                                <div className="h-6 w-px bg-white/20" />
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
                                        style={{ backgroundColor: currentParent?.color || "#6366f1" }}
                                    >
                                        {currentParent?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-xl font-semibold">{currentParent?.name}</h2>
                                    <span className="text-white/50 text-sm">({currentChildBatches.length} zones)</span>
                                </div>
                                <button
                                    onClick={() => setShowCreateSubBatch(true)}
                                    className="ml-auto px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors"
                                >
                                    + Add Zone
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* All Contacts Card - Master list */}
                            {!currentParentId && (
                                <button
                                    onClick={() => setViewMode("all")}
                                    className="p-5 rounded-xl border text-left transition-all bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/10"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                            <span className="text-lg">👥</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">All Contacts</h3>
                                            <p className="text-xs text-white/50">Master list</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">{contacts?.length || 0}</span>
                                        <span className="text-xs text-white/40">total</span>
                                    </div>
                                </button>
                            )}

                            {/* Unbatched Card */}
                            {!currentParentId && (
                                <button
                                    onClick={() => setViewMode("none")}
                                    className="p-5 rounded-xl border text-left transition-all bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                                            <span className="text-lg">📋</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">Unbatched</h3>
                                            <p className="text-xs text-white/50">Not in any batch</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">{contacts?.filter(c => !c.batchId).length || 0}</span>
                                        <span className="text-xs text-white/40">contacts</span>
                                    </div>
                                </button>
                            )}

                            {/* Show either parent batches or child batches depending on navigation */}
                            {(currentParentId ? currentChildBatches : parentBatches).map((batch) => {
                                const childCount = batches?.filter(b => b.parentBatchId === batch._id).length || 0;
                                const hasChildren = childCount > 0;

                                return (
                                    <div
                                        key={batch._id}
                                        onClick={() => setViewMode(batch._id)}
                                        className="p-5 rounded-xl border text-left transition-all group bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                style={{ backgroundColor: batch.color || "#6366f1" }}
                                            >
                                                {batch.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{batch.name}</h3>
                                                {batch.description && (
                                                    <p className="text-xs text-white/40 truncate">{batch.description}</p>
                                                )}
                                                {hasChildren && (
                                                    <p className="text-xs text-indigo-400">{childCount} zones inside</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {/* Expand to see zones */}
                                                {hasChildren && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentParentId(batch._id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/60"
                                                        title="View zones"
                                                    >
                                                        📂
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete batch "${batch.name}"? Contacts will be kept.`)) {
                                                            deleteBatch({ id: batch._id });
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-red-400"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">{batch.contactCount}</span>
                                            <span className="text-xs text-white/40">contacts</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty state for no batches */}
                            {!currentParentId && parentBatches.length === 0 && contacts?.filter(c => !c.batchId).length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                        <span className="text-3xl">📦</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No batches yet</h3>
                                    <p className="text-white/50 mb-4">Import contacts to create your first batch.</p>
                                    <button
                                        onClick={() => setShowImport(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Import Contacts
                                    </button>
                                </div>
                            )}

                            {/* Empty state for parent batch with no children */}
                            {currentParentId && currentChildBatches.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                        <span className="text-3xl">📁</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No zones yet</h3>
                                    <p className="text-white/50 mb-4">Add zones to organize contacts within {currentParent?.name}.</p>
                                    <button
                                        onClick={() => setShowCreateSubBatch(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                    >
                                        + Add Zone
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contacts Table - Only show when NOT in batches view */}
                {viewMode !== "batches" && (
                    <>
                        {contacts === undefined ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                            </div>
                        ) : filteredContacts?.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                    <span className="text-4xl">👥</span>
                                </div>
                                <h2 className="text-xl font-semibold mb-2">No contacts in this batch</h2>
                                <p className="text-white/50 mb-6">Import contacts to add them to this batch.</p>
                                <button
                                    onClick={() => setShowImport(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    Import Contacts
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Selection Controls Bar */}
                                {(selectedContacts.size > 0 || filteredContacts && filteredContacts.length > 0) && (
                                    <div className="mb-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={selectedContacts.size === filteredContacts?.length ? clearSelection : selectAllVisible}
                                                className="text-sm text-white/60 hover:text-white transition-colors"
                                            >
                                                {selectedContacts.size === filteredContacts?.length ? "Deselect All" : "Select All"}
                                            </button>
                                            {selectedContacts.size > 0 && (
                                                <span className="text-sm text-indigo-400">
                                                    {selectedContacts.size} selected
                                                </span>
                                            )}
                                        </div>
                                        {selectedContacts.size > 0 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setShowBatchModal(true)}
                                                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                                                >
                                                    Create Batch from Selection
                                                </button>
                                                <button
                                                    onClick={clearSelection}
                                                    className="px-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="overflow-hidden rounded-xl border border-white/10">
                                    <table className="w-full">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-4 py-3 text-left w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={(filteredContacts?.length ?? 0) > 0 && selectedContacts.size === (filteredContacts?.length ?? 0)}
                                                        onChange={() => selectedContacts.size === (filteredContacts?.length ?? 0) ? clearSelection() : selectAllVisible()}
                                                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Phone</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Batch</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredContacts?.map((contact, index) => (
                                                <tr
                                                    key={contact._id}
                                                    className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedContacts.has(contact._id) ? 'bg-indigo-500/10' : ''}`}
                                                    onClick={(e) => handleContactClick(contact._id, index, e)}
                                                >
                                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedContacts.has(contact._id)}
                                                            onChange={(e) => handleContactClick(contact._id, index, e as any)}
                                                            className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{contact.email}</td>
                                                    <td className="px-4 py-3 text-sm text-white/70">{contact.name || "—"}</td>
                                                    <td className="px-4 py-3 text-sm text-white/70">
                                                        {contact.phone ? (
                                                            <a
                                                                href={`tel:${contact.phone}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-green-400 hover:text-green-300 hover:underline flex items-center gap-1"
                                                            >
                                                                📞 {contact.phone}
                                                            </a>
                                                        ) : "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {contact.batchId ? (
                                                            <span
                                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs"
                                                                style={{
                                                                    backgroundColor: `${getBatchColor(contact.batchId)}20`,
                                                                    color: getBatchColor(contact.batchId) || "#6366f1"
                                                                }}
                                                            >
                                                                <span
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: getBatchColor(contact.batchId) || "#6366f1" }}
                                                                />
                                                                {getBatchName(contact.batchId)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-white/30 text-xs">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs ${contact.status === "active" ? "bg-green-500/20 text-green-400" :
                                                            contact.status === "unsubscribed" ? "bg-orange-500/20 text-orange-400" :
                                                                "bg-red-500/20 text-red-400"
                                                            }`}>
                                                            {contact.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewContactId(contact._id);
                                                                }}
                                                                className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded text-xs transition-colors"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteContact({ id: contact._id });
                                                                }}
                                                                className="text-red-400/60 hover:text-red-400 text-xs"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>

            {/* Import Modal */}
            {showImport && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Import Contacts</h2>
                                <button
                                    onClick={() => {
                                        setShowImport(false);
                                        setRawText("");
                                        setImportResult(null);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-white/50 text-sm mt-1">
                                Paste emails, phone numbers, or contact lists. We'll auto-parse them.
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Input Area */}
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Paste your contacts (emails, phones, names)
                                </label>
                                <textarea
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    placeholder="john@example.com&#10;Jane Doe <jane@example.com>&#10;555-123-4567&#10;mike@company.com, bob@company.com&#10;sales@business.com; marketing@business.com"
                                    className="w-full h-40 px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-sm resize-none"
                                />
                            </div>

                            {/* Parse Preview */}
                            {parsedContacts.length > 0 && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-green-400">✓</span>
                                        <span className="font-medium text-green-400">
                                            {parsedContacts.length} contacts detected
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                        {parsedContacts.slice(0, 20).map((c, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/70">
                                                {c.email}
                                            </span>
                                        ))}
                                        {parsedContacts.length > 20 && (
                                            <span className="px-2 py-1 text-xs text-white/50">
                                                +{parsedContacts.length - 20} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Batch Assignment */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-white/70">
                                    Assign to Batch (optional)
                                </label>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={createNewBatch}
                                            onChange={(e) => {
                                                setCreateNewBatch(e.target.checked);
                                                if (e.target.checked) setSelectedBatchId("");
                                            }}
                                            className="w-4 h-4 rounded border-white/20 bg-black/40"
                                        />
                                        <span className="text-sm">Create new batch</span>
                                    </label>
                                </div>

                                {createNewBatch ? (
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newBatchName}
                                            onChange={(e) => setNewBatchName(e.target.value)}
                                            placeholder="Batch name (e.g., Q1 Campaign Leads)"
                                            className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                        />
                                        <div className="flex gap-1">
                                            {BATCH_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setNewBatchColor(color)}
                                                    className={`w-8 h-8 rounded-lg transition-all ${newBatchColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-[#12121f]" : ""
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : batches && batches.length > 0 ? (
                                    <select
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">No batch (individual contacts)</option>
                                        {batches.map((batch) => (
                                            <option key={batch._id} value={batch._id}>
                                                {batch.name} ({batch.contactCount} contacts)
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-white/40 text-sm">No batches yet. Check "Create new batch" to create one.</p>
                                )}
                            </div>

                            {/* Import Result */}
                            {importResult && (
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <div className="font-medium text-indigo-300">Import Complete!</div>
                                    <div className="text-sm text-white/70 mt-1">
                                        {importResult.created} contacts imported, {importResult.skipped} duplicates skipped
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowImport(false);
                                    setRawText("");
                                    setImportResult(null);
                                }}
                                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={parsedContacts.length === 0 || importing || (createNewBatch && !newBatchName.trim())}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {importing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        Import {parsedContacts.length} Contacts
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Contact Modal */}
            {showAddContact && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowAddContact(false)}
                >
                    <div
                        className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-semibold">Add Contact</h2>
                            <p className="text-white/50 text-sm mt-1">Add a single contact to your list</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Email Address <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={newContactEmail}
                                    onChange={(e) => setNewContactEmail(e.target.value)}
                                    placeholder="contact@example.com"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newContactName}
                                    onChange={(e) => setNewContactName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={newContactPhone}
                                    onChange={(e) => setNewContactPhone(e.target.value)}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddContact(false);
                                    setNewContactEmail("");
                                    setNewContactName("");
                                    setNewContactPhone("");
                                }}
                                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddContact}
                                disabled={!newContactEmail.trim() || addingContact}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {addingContact ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    "Add Contact"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Batch from Selection Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-md">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Create Batch</h2>
                                <button
                                    onClick={() => setShowBatchModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-sm text-white/50 mt-1">
                                Create a new batch with {selectedContacts.size} selected contacts
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Batch Name
                                </label>
                                <input
                                    type="text"
                                    value={selectionBatchName}
                                    onChange={(e) => setSelectionBatchName(e.target.value)}
                                    placeholder="e.g., West Coast Shops"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Batch Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {BATCH_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectionBatchColor(color)}
                                            className={`w-8 h-8 rounded-full transition-all ${selectionBatchColor === color
                                                ? "ring-2 ring-offset-2 ring-offset-[#12121f] ring-white scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBatchFromSelection}
                                disabled={!selectionBatchName.trim() || creatingBatch}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creatingBatch ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Batch"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Sub-Batch/Zone Modal */}
            {showCreateSubBatch && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-md">
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Add Zone</h2>
                                <button
                                    onClick={() => setShowCreateSubBatch(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-sm text-white/50 mt-1">
                                Add a zone within {currentParent?.name}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Zone Name
                                </label>
                                <input
                                    type="text"
                                    value={subBatchName}
                                    onChange={(e) => setSubBatchName(e.target.value)}
                                    placeholder="e.g., Zone 1, North Phoenix, etc."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    Zone Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {BATCH_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSubBatchColor(color)}
                                            className={`w-8 h-8 rounded-full transition-all ${subBatchColor === color
                                                ? "ring-2 ring-offset-2 ring-offset-[#12121f] ring-white scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateSubBatch(false)}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSubBatch}
                                disabled={!subBatchName.trim() || creatingSubBatch}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creatingSubBatch ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Add Zone"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Detail Modal */}
            {viewContactId && (
                <ContactDetail
                    contactId={viewContactId}
                    onClose={() => setViewContactId(null)}
                />
            )}
        </div>
    );
}

// Wrapper with auth
export default function ContactsPageWrapper() {
    return (
        <AuthGuard>
            <ContactsPage />
        </AuthGuard>
    );
}
