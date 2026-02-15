"use client";

import { useState, useMemo } from "react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import ContactDetail from "@/components/ContactDetail";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

const PIPELINE_STAGES = [
    { id: "new", label: "New Leads", color: "#6366f1", icon: "✨" },
    { id: "contacted", label: "Contacted", color: "#3b82f6", icon: "📧" },
    { id: "follow_up", label: "Follow Up", color: "#f59e0b", icon: "🔄" },
    { id: "qualified", label: "Qualified", color: "#8b5cf6", icon: "⭐" },
    { id: "closed_won", label: "Closed Won", color: "#22c55e", icon: "🎉" },
    { id: "closed_lost", label: "Closed Lost", color: "#ef4444", icon: "❌" },
] as const;

type StageId = typeof PIPELINE_STAGES[number]["id"];

interface Contact {
    _id: Id<"contacts">;
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    salesStage?: string;
    lastEmailAt?: number;
    lastCallAt?: number;
    emailCount?: number;
    callCount?: number;
}

// Compact contact card for pipeline
function ContactCard({
    contact,
    stage,
    isDragging,
    onDragStart,
    onDragEnd,
    onClick
}: {
    contact: Contact;
    stage: typeof PIPELINE_STAGES[number];
    isDragging: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onClick: () => void;
}) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onClick}
            className={`bg-black/40 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-black/60 transition-all border border-slate-200 hover:border-slate-200 ${isDragging ? "opacity-50 scale-95" : ""
                }`}
        >
            <div className="flex items-center gap-2">
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: `${stage.color}30`, color: stage.color }}
                >
                    {(contact.name || contact.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                        {contact.name || contact.email.split("@")[0]}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                        {contact.company || contact.email}
                    </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                    {(contact.emailCount ?? 0) > 0 && <span>📧{contact.emailCount}</span>}
                    {(contact.callCount ?? 0) > 0 && <span>📞{contact.callCount}</span>}
                </div>
            </div>
        </div>
    );
}

// Stage column with search and scrolling
function StageColumn({
    stage,
    contacts,
    searchQuery,
    onSearchChange,
    dragOverStage,
    draggedContact,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragStart,
    onDragEnd,
    onContactClick,
}: {
    stage: typeof PIPELINE_STAGES[number];
    contacts: Contact[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    dragOverStage: string | null;
    draggedContact: Id<"contacts"> | null;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDragStart: (e: React.DragEvent, id: Id<"contacts">) => void;
    onDragEnd: () => void;
    onContactClick: (id: Id<"contacts">) => void;
}) {
    // Filter contacts by search
    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return contacts;
        const q = searchQuery.toLowerCase();
        return contacts.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.company?.toLowerCase().includes(q)
        );
    }, [contacts, searchQuery]);

    const isDragTarget = dragOverStage === stage.id;

    return (
        <div
            className={`flex-shrink-0 w-72 flex flex-col transition-all duration-200 ${isDragTarget ? "scale-[1.01]" : ""
                }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* Stage Header */}
            <div
                className="rounded-t-xl p-3 flex items-center justify-between"
                style={{ backgroundColor: `${stage.color}20` }}
            >
                <div className="flex items-center gap-2">
                    <span>{stage.icon}</span>
                    <span className="font-medium text-sm" style={{ color: stage.color }}>
                        {stage.label}
                    </span>
                </div>
                <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: stage.color, color: "#000" }}
                >
                    {contacts.length}
                </span>
            </div>

            {/* Search Bar */}
            {contacts.length > 5 && (
                <div className="bg-white border-x border-slate-200 px-2 py-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-black/40 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500/50"
                    />
                </div>
            )}

            {/* Cards Container - Fixed Height with Scroll */}
            <div
                className={`bg-white rounded-b-xl border border-slate-200 flex-1 p-2 space-y-2 overflow-y-auto transition-colors ${isDragTarget ? "border-2" : ""
                    }`}
                style={{
                    borderColor: isDragTarget ? stage.color : undefined,
                    maxHeight: "calc(100vh - 280px)",
                    minHeight: "200px"
                }}
            >
                {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                        <ContactCard
                            key={contact._id}
                            contact={contact}
                            stage={stage}
                            isDragging={draggedContact === contact._id}
                            onDragStart={(e) => onDragStart(e, contact._id)}
                            onDragEnd={onDragEnd}
                            onClick={() => onContactClick(contact._id)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-slate-300 text-sm">
                        {searchQuery ? (
                            <>
                                <span className="text-xl mb-1">🔍</span>
                                <span>No matches</span>
                            </>
                        ) : (
                            <>
                                <span className="text-xl mb-1">{stage.icon}</span>
                                <span>Drop contacts here</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Show filtered count if searching */}
            {searchQuery && filteredContacts.length !== contacts.length && (
                <div className="text-center text-xs text-slate-400 py-1 bg-white border-x border-b border-slate-200 rounded-b-xl -mt-2">
                    Showing {filteredContacts.length} of {contacts.length}
                </div>
            )}
        </div>
    );
}

function PipelinePage() {
    const [viewContactId, setViewContactId] = useState<Id<"contacts"> | null>(null);
    const [draggedContact, setDraggedContact] = useState<Id<"contacts"> | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [globalSearch, setGlobalSearch] = useState("");
    const [stageSearches, setStageSearches] = useState<Record<string, string>>({});

    // Queries
    const allContacts = useAuthQuery(api.contacts.list, {});
    const updateStage = useAuthMutation(api.activities.updateSalesStage);

    // Group contacts by stage
    const contactsByStage = useMemo(() => {
        return PIPELINE_STAGES.reduce((acc, stage) => {
            let stageContacts = (allContacts || []).filter(c => {
                const contactStage = c.salesStage || "new";
                return contactStage === stage.id;
            });

            // Apply global search
            if (globalSearch.trim()) {
                const q = globalSearch.toLowerCase();
                stageContacts = stageContacts.filter(c =>
                    c.name?.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.company?.toLowerCase().includes(q)
                );
            }

            acc[stage.id] = stageContacts;
            return acc;
        }, {} as Record<string, Contact[]>);
    }, [allContacts, globalSearch]);

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, contactId: Id<"contacts">) => {
        setDraggedContact(contactId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", contactId);
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverStage(stageId);
    };

    const handleDragLeave = () => {
        setDragOverStage(null);
    };

    const handleDrop = async (e: React.DragEvent, stageId: StageId) => {
        e.preventDefault();
        setDragOverStage(null);

        if (draggedContact) {
            try {
                await updateStage({
                    contactId: draggedContact,
                    stage: stageId,
                });
            } catch (err) {
                console.error("Failed to update stage:", err);
            }
        }
        setDraggedContact(null);
    };

    const handleDragEnd = () => {
        setDraggedContact(null);
        setDragOverStage(null);
    };

    const totalContacts = allContacts?.length || 0;
    const wonCount = contactsByStage["closed_won"]?.length || 0;
    const lostCount = contactsByStage["closed_lost"]?.length || 0;
    const filteredTotal = Object.values(contactsByStage).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <AppHeader />

            <main className="px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Sales Pipeline</h1>
                        <p className="text-slate-500 text-sm">Drag contacts to move through stages</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Global Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search all contacts..."
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                                className="w-64 px-4 py-2 pl-9 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500/50"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">Total:</span>
                                <span className="font-medium">
                                    {globalSearch ? `${filteredTotal} / ${totalContacts}` : totalContacts}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-green-400">Won:</span>
                                <span className="font-medium text-green-400">{wonCount}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-red-400">Lost:</span>
                                <span className="font-medium text-red-400">{lostCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {PIPELINE_STAGES.map((stage) => (
                        <StageColumn
                            key={stage.id}
                            stage={stage}
                            contacts={contactsByStage[stage.id] || []}
                            searchQuery={stageSearches[stage.id] || ""}
                            onSearchChange={(q) => setStageSearches(prev => ({ ...prev, [stage.id]: q }))}
                            dragOverStage={dragOverStage}
                            draggedContact={draggedContact}
                            onDragOver={(e) => handleDragOver(e, stage.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage.id)}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onContactClick={setViewContactId}
                        />
                    ))}
                </div>
            </main>

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

export default function PipelinePageWrapper() {
    return (
        <AuthGuard>
            <PipelinePage />
        </AuthGuard>
    );
}
