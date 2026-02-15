"use client";

import { useState } from "react";
import { Id } from "@/../convex/_generated/dataModel";

interface Contact {
    _id: Id<"contacts">;
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    location?: string;
    website?: string;
    address?: string;
    tags?: string[];
    emailCount?: number;
    callCount?: number;
}

interface MergeContactsModalProps {
    contacts: Contact[];
    onMerge: (primaryId: Id<"contacts">, mergeIds: Id<"contacts">[]) => void;
    onClose: () => void;
}

export default function MergeContactsModal({ contacts, onMerge, onClose }: MergeContactsModalProps) {
    const [primaryId, setPrimaryId] = useState<Id<"contacts">>(contacts[0]?._id);

    if (contacts.length < 2) return null;

    const primary = contacts.find(c => c._id === primaryId);
    const mergeIds = contacts.filter(c => c._id !== primaryId).map(c => c._id);

    // Preview what merged contact will look like
    const mergedPreview = contacts.reduce((acc, c) => ({
        name: acc.name || c.name || "",
        email: primary!.email,
        company: acc.company || c.company || "",
        phone: acc.phone || c.phone || "",
        location: acc.location || c.location || "",
        website: acc.website || c.website || "",
        address: acc.address || c.address || "",
        tags: [...new Set([...(acc.tags || []), ...(c.tags || [])])],
        emailCount: (acc.emailCount || 0) + (c.emailCount || 0),
        callCount: (acc.callCount || 0) + (c.callCount || 0),
    }), {} as any);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] max-w-2xl w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#f8fafc]">
                    <h2 className="text-lg font-bold text-[#0f172a]">Merge {contacts.length} Contacts</h2>
                    <p className="text-sm text-[#9CA3AF]">
                        Choose the primary contact. Fields will be filled from other contacts where the primary has blanks.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Contact selection */}
                    <div>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Select Primary Contact</h3>
                        <div className="space-y-2">
                            {contacts.map(c => (
                                <button
                                    key={c._id}
                                    onClick={() => setPrimaryId(c._id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${primaryId === c._id
                                        ? "border-[#0EA5E9] bg-[#0EA5E9]/5 ring-1 ring-[#0EA5E9]/30"
                                        : "border-[#E5E7EB] hover:border-[#9CA3AF]"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${primaryId === c._id
                                            ? "bg-[#0EA5E9] text-white"
                                            : "bg-[#f8fafc] text-[#9CA3AF]"
                                            }`}>
                                            {c.name?.charAt(0).toUpperCase() || c.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-[#0f172a]">{c.name || "—"}</div>
                                            <div className="text-xs text-[#9CA3AF]">{c.email} · {c.company || "No company"}</div>
                                        </div>
                                        {primaryId === c._id && (
                                            <span className="ml-auto text-xs font-medium text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-0.5 rounded-md">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div>
                        <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Merged Result Preview</h3>
                        <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#E5E7EB] space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-[#9CA3AF]">Name:</span>{" "}
                                    <span className="text-[#0f172a] font-medium">{mergedPreview.name || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-[#9CA3AF]">Email:</span>{" "}
                                    <span className="text-[#0f172a] font-medium">{mergedPreview.email}</span>
                                </div>
                                <div>
                                    <span className="text-[#9CA3AF]">Company:</span>{" "}
                                    <span className="text-[#0f172a] font-medium">{mergedPreview.company || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-[#9CA3AF]">Phone:</span>{" "}
                                    <span className="text-[#0f172a] font-medium">{mergedPreview.phone || "—"}</span>
                                </div>
                            </div>
                            {mergedPreview.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {mergedPreview.tags.map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs rounded-md">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="text-xs text-[#9CA3AF] pt-1">
                                Combined: {mergedPreview.emailCount} emails · {mergedPreview.callCount} calls
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#FEF2F2] border border-[#EF4444]/20 rounded-xl p-3">
                        <p className="text-xs text-[#EF4444]">
                            ⚠️ This will delete {mergeIds.length} contact{mergeIds.length > 1 ? "s" : ""} and merge their data into the primary. This action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#f8fafc] flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm text-[#4B5563] hover:text-[#0f172a] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onMerge(primaryId, mergeIds)}
                        className="px-6 py-2.5 bg-[#EF4444] text-white rounded-xl text-sm font-semibold hover:bg-[#EF4444]/90 transition-all"
                    >
                        Merge {contacts.length} Contacts
                    </button>
                </div>
            </div>
        </div>
    );
}
