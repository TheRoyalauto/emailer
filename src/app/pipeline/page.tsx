"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import ContactDetail from "@/components/ContactDetail";

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

function PipelinePage() {
    const [viewContactId, setViewContactId] = useState<Id<"contacts"> | null>(null);
    const [draggedContact, setDraggedContact] = useState<Id<"contacts"> | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    // Queries
    const allContacts = useQuery(api.contacts.list, {});
    const updateStage = useMutation(api.activities.updateSalesStage);

    // Group contacts by stage
    const contactsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage.id] = (allContacts || []).filter(c => {
            const contactStage = c.salesStage || "new";
            return contactStage === stage.id;
        });
        return acc;
    }, {} as Record<string, Contact[]>);

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

    const formatRelativeTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    const totalContacts = allContacts?.length || 0;
    const wonCount = contactsByStage["closed_won"]?.length || 0;
    const lostCount = contactsByStage["closed_lost"]?.length || 0;

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader currentPage="contacts" />

            <main className="px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Sales Pipeline</h1>
                        <p className="text-white/50 text-sm">Drag contacts to move through stages</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-white/50">Total:</span>
                            <span className="font-medium">{totalContacts}</span>
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

                {/* Kanban Board */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                    {PIPELINE_STAGES.map((stage) => (
                        <div
                            key={stage.id}
                            className={`flex-shrink-0 w-72 snap-start transition-all duration-200 ${dragOverStage === stage.id
                                    ? "scale-[1.02]"
                                    : ""
                                }`}
                            onDragOver={(e) => handleDragOver(e, stage.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* Stage Header */}
                            <div
                                className="rounded-t-xl p-3 flex items-center justify-between"
                                style={{ backgroundColor: `${stage.color}20` }}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{stage.icon}</span>
                                    <span className="font-medium" style={{ color: stage.color }}>
                                        {stage.label}
                                    </span>
                                </div>
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                                    style={{ backgroundColor: stage.color, color: "#000" }}
                                >
                                    {contactsByStage[stage.id]?.length || 0}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div
                                className={`bg-[#12121f] rounded-b-xl border border-white/10 min-h-[400px] p-2 space-y-2 transition-colors ${dragOverStage === stage.id
                                        ? "border-2"
                                        : ""
                                    }`}
                                style={{
                                    borderColor: dragOverStage === stage.id ? stage.color : undefined
                                }}
                            >
                                {contactsByStage[stage.id]?.map((contact) => (
                                    <div
                                        key={contact._id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, contact._id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => setViewContactId(contact._id)}
                                        className={`bg-black/40 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-black/60 transition-all border border-white/5 hover:border-white/20 ${draggedContact === contact._id
                                                ? "opacity-50 scale-95"
                                                : ""
                                            }`}
                                    >
                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                style={{ backgroundColor: `${stage.color}30`, color: stage.color }}
                                            >
                                                {(contact.name || contact.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-sm truncate">
                                                    {contact.name || contact.email.split("@")[0]}
                                                </div>
                                                {contact.company && (
                                                    <div className="text-xs text-white/50 truncate">
                                                        {contact.company}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="text-xs text-white/40 truncate mb-2">
                                            {contact.email}
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-3 text-xs text-white/50">
                                            {(contact.emailCount ?? 0) > 0 && (
                                                <span className="flex items-center gap-1">
                                                    📧 {contact.emailCount}
                                                </span>
                                            )}
                                            {(contact.callCount ?? 0) > 0 && (
                                                <span className="flex items-center gap-1">
                                                    📞 {contact.callCount}
                                                </span>
                                            )}
                                            {contact.lastEmailAt && (
                                                <span className="text-white/30">
                                                    {formatRelativeTime(contact.lastEmailAt)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5">
                                            {contact.phone && (
                                                <a
                                                    href={`tel:${contact.phone}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 hover:bg-green-500/20 rounded text-green-400 transition-colors"
                                                    title="Call"
                                                >
                                                    📞
                                                </a>
                                            )}
                                            <a
                                                href={`mailto:${contact.email}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1.5 hover:bg-blue-500/20 rounded text-blue-400 transition-colors"
                                                title="Email"
                                            >
                                                ✉️
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State */}
                                {(!contactsByStage[stage.id] || contactsByStage[stage.id].length === 0) && (
                                    <div className="flex flex-col items-center justify-center h-32 text-white/20 text-sm">
                                        <span className="text-2xl mb-1">{stage.icon}</span>
                                        <span>Drop contacts here</span>
                                    </div>
                                )}
                            </div>
                        </div>
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
