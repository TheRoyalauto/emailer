"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useAuthMutation } from "@/hooks/useAuthConvex";

const SALES_STAGES = [
    { id: "new", label: "New", color: "#9CA3AF", icon: "🆕" },
    { id: "contacted", label: "Contacted", color: "#0EA5E9", icon: "📧" },
    { id: "follow_up", label: "Follow-up", color: "#F59E0B", icon: "🔄" },
    { id: "qualified", label: "Qualified", color: "#8B5CF6", icon: "⭐" },
    { id: "closed_won", label: "Closed Won", color: "#10B981", icon: "✅" },
    { id: "closed_lost", label: "Closed Lost", color: "#EF4444", icon: "❌" },
];

interface Contact {
    _id: Id<"contacts">;
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    status?: string;
    salesStage?: string;
    tags?: string[];
    lastEmailAt?: number;
    lastCallAt?: number;
    emailCount?: number;
    callCount?: number;
    leadScore?: number;
}

interface ContactSlideOverProps {
    contact: Contact;
    onClose: () => void;
    onUpdated: () => void;
    onDeleted: () => void;
}

export default function ContactSlideOver({ contact, onClose, onUpdated, onDeleted }: ContactSlideOverProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        email: contact.email,
        name: contact.name || "",
        company: contact.company || "",
        phone: contact.phone || "",
        location: contact.location || "",
        website: contact.website || "",
        address: contact.address || "",
    });
    const [tagInput, setTagInput] = useState("");
    const [activeTab, setActiveTab] = useState<"details" | "activity">("details");

    const updateContact = useAuthMutation(api.contacts.update);
    const deleteContact = useAuthMutation(api.contacts.remove);
    const updateSalesStage = useAuthMutation(api.activities.updateSalesStage);

    const contactActivities = useQuery(
        api.activities.getContactActivities,
        { contactId: contact._id, limit: 30 }
    );

    useEffect(() => {
        setEditForm({
            email: contact.email,
            name: contact.name || "",
            company: contact.company || "",
            phone: contact.phone || "",
            location: contact.location || "",
            website: contact.website || "",
            address: contact.address || "",
        });
        setIsEditing(false);
    }, [contact._id]);

    const handleSave = async () => {
        await updateContact({
            id: contact._id,
            email: editForm.email || undefined,
            name: editForm.name || undefined,
            company: editForm.company || undefined,
            phone: editForm.phone || undefined,
            location: editForm.location || undefined,
            website: editForm.website || undefined,
            address: editForm.address || undefined,
        });
        setIsEditing(false);
        onUpdated();
    };

    const handleStageChange = async (stageId: string) => {
        await updateSalesStage({
            contactId: contact._id,
            stage: stageId as any,
        });
        onUpdated();
    };

    const handleDelete = async () => {
        if (!confirm("Delete this contact? This cannot be undone.")) return;
        await deleteContact({ id: contact._id });
        onDeleted();
    };

    const handleAddTag = async () => {
        if (!tagInput.trim()) return;
        const currentTags = contact.tags || [];
        const newTags = [...new Set([...currentTags, tagInput.trim()])];
        await updateContact({ id: contact._id, tags: newTags });
        setTagInput("");
        onUpdated();
    };

    const handleRemoveTag = async (tag: string) => {
        const currentTags = contact.tags || [];
        await updateContact({ id: contact._id, tags: currentTags.filter(t => t !== tag) });
        onUpdated();
    };

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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "email_sent": return "📧";
            case "email_opened": return "👁️";
            case "email_clicked": return "🔗";
            case "call_made": case "call_received": return "📞";
            case "voicemail_left": return "📱";
            case "note_added": return "📝";
            case "status_changed": return "🔄";
            case "follow_up_scheduled": return "📅";
            default: return "📌";
        }
    };

    const currentStage = SALES_STAGES.find(s => s.id === (contact.salesStage || "new")) || SALES_STAGES[0];

    const fields = [
        { key: "name", label: "Name", type: "text" },
        { key: "email", label: "Email", type: "email" },
        { key: "company", label: "Company", type: "text" },
        { key: "phone", label: "Phone", type: "tel" },
        { key: "location", label: "Location", type: "text" },
        { key: "website", label: "Website", type: "url" },
        { key: "address", label: "Address", type: "text" },
    ] as const;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E5E7EB] bg-[#f8fafc]">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#10B981] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#0EA5E9]/25">
                                {contact.name?.charAt(0).toUpperCase() || contact.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#0f172a]">
                                    {contact.name || contact.email.split("@")[0]}
                                </h2>
                                <p className="text-sm text-[#9CA3AF]">{contact.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-[#9CA3AF] hover:text-[#0f172a]"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Stage pills */}
                    <div className="flex flex-wrap gap-1.5">
                        {SALES_STAGES.map(stage => (
                            <button
                                key={stage.id}
                                onClick={() => handleStageChange(stage.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${currentStage.id === stage.id
                                    ? "ring-2 ring-offset-1 shadow-sm"
                                    : "hover:scale-105 opacity-60 hover:opacity-100"
                                    }`}
                                style={{
                                    backgroundColor: `${stage.color}18`,
                                    color: stage.color,
                                    ...(currentStage.id === stage.id ? { boxShadow: `0 0 0 2px white, 0 0 0 3.5px ${stage.color}` } : {}),
                                }}
                            >
                                {stage.icon} {stage.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#E5E7EB] px-6">
                    {(["details", "activity"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all capitalize ${activeTab === tab
                                ? "border-[#0EA5E9] text-[#0EA5E9]"
                                : "border-transparent text-[#9CA3AF] hover:text-[#4B5563]"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "details" ? (
                        <div className="space-y-6">
                            {/* Edit toggle */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Contact Info</h3>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs font-medium text-[#0EA5E9] hover:text-[#0EA5E9]/80 transition-colors"
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="text-xs text-[#9CA3AF] hover:text-[#0f172a]">Cancel</button>
                                        <button onClick={handleSave} className="text-xs font-medium text-[#10B981]">Save</button>
                                    </div>
                                )}
                            </div>

                            {/* Fields */}
                            <div className="grid grid-cols-2 gap-3">
                                {fields.map(field => (
                                    <div key={field.key} className={field.key === "address" ? "col-span-2" : ""}>
                                        <label className="block text-xs text-[#9CA3AF] mb-1">{field.label}</label>
                                        {isEditing ? (
                                            <input
                                                type={field.type}
                                                value={editForm[field.key] || ""}
                                                onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                                                className="w-full px-3 py-2 bg-[#f8fafc] border border-[#E5E7EB] rounded-lg text-sm text-[#0f172a] focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]/20 focus:outline-none transition-all"
                                            />
                                        ) : (
                                            <p className="px-3 py-2 bg-[#f8fafc] rounded-lg text-sm text-[#0f172a] min-h-[36px]">
                                                {field.key === "website" && contact.website ? (
                                                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-[#0EA5E9] hover:underline">
                                                        {contact.website}
                                                    </a>
                                                ) : (
                                                    (contact as any)[field.key] || "—"
                                                )}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Tags */}
                            <div>
                                <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {(contact.tags || []).map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium rounded-lg">
                                            {tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-[#EF4444] transition-colors">×</button>
                                        </span>
                                    ))}
                                    {(!contact.tags || contact.tags.length === 0) && (
                                        <span className="text-xs text-[#9CA3AF]">No tags</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add tag..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                                        className="flex-1 px-3 py-1.5 bg-[#f8fafc] border border-[#E5E7EB] rounded-lg text-xs text-[#0f172a] focus:border-[#0EA5E9] focus:outline-none"
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        disabled={!tagInput.trim()}
                                        className="px-3 py-1.5 bg-[#0EA5E9] text-white text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-[#0EA5E9]/90 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Engagement stats */}
                            <div>
                                <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Engagement</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-center">
                                        <div className="text-xl font-bold text-[#0f172a]">{contact.emailCount || 0}</div>
                                        <div className="text-xs text-[#9CA3AF]">Emails</div>
                                    </div>
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-center">
                                        <div className="text-xl font-bold text-[#0f172a]">{contact.callCount || 0}</div>
                                        <div className="text-xs text-[#9CA3AF]">Calls</div>
                                    </div>
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-center">
                                        <div className="text-sm font-medium text-[#0f172a]">
                                            {contact.lastEmailAt ? formatRelativeTime(contact.lastEmailAt) : "—"}
                                        </div>
                                        <div className="text-xs text-[#9CA3AF]">Last Email</div>
                                    </div>
                                    <div className="p-3 bg-[#f8fafc] rounded-xl text-center">
                                        <div className="text-sm font-medium text-[#0f172a]">
                                            {contact.lastCallAt ? formatRelativeTime(contact.lastCallAt) : "—"}
                                        </div>
                                        <div className="text-xs text-[#9CA3AF]">Last Call</div>
                                    </div>
                                </div>
                                {contact.leadScore !== undefined && contact.leadScore > 0 && (
                                    <div className="mt-3 p-3 bg-[#f8fafc] rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-[#9CA3AF]">Lead Score</span>
                                            <span className="text-sm font-bold text-[#0f172a]">{contact.leadScore}/100</span>
                                        </div>
                                        <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${contact.leadScore}%`,
                                                    backgroundColor: contact.leadScore >= 70 ? "#10B981" : contact.leadScore >= 40 ? "#F59E0B" : "#EF4444",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Activity Tab */
                        <div>
                            {contactActivities === undefined ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full" />
                                </div>
                            ) : contactActivities.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="text-[#9CA3AF]">No activity yet</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {contactActivities.map((activity) => (
                                        <div key={activity._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f8fafc] transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-[#f8fafc] border border-[#E5E7EB] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-[#0f172a]">
                                                    {activity.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                                </div>
                                                {activity.notes && (
                                                    <div className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-2">{activity.notes}</div>
                                                )}
                                                <div className="text-xs text-[#9CA3AF] mt-1">
                                                    {formatRelativeTime(activity.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#f8fafc] flex items-center justify-between">
                    <button
                        onClick={handleDelete}
                        className="px-3 py-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg text-sm font-medium transition-all"
                    >
                        Delete
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-lg text-sm font-medium hover:bg-[#F1F3F8] transition-all">
                            📧 Email
                        </button>
                        <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#4B5563] rounded-lg text-sm font-medium hover:bg-[#F1F3F8] transition-all">
                            📞 Log Call
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
