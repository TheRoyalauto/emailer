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
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 max-w-2xl w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Merge {contacts.length} Contacts</h2>
                    <p className="text-sm text-gray-400">
                        Choose the primary contact. Fields will be filled from other contacts where the primary has blanks.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Contact selection */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Primary Contact</h3>
                        <div className="space-y-2">
                            {contacts.map(c => (
                                <button
                                    key={c._id}
                                    onClick={() => setPrimaryId(c._id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${primaryId === c._id
                                        ? "border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 ring-1 ring-sky-500/30"
                                        : "border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-500"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${primaryId === c._id
                                            ? "bg-sky-500 text-white"
                                            : "bg-slate-50 dark:bg-slate-800 text-gray-400"
                                            }`}>
                                            {c.name?.charAt(0).toUpperCase() || c.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{c.name || "—"}</div>
                                            <div className="text-xs text-gray-400">{c.email} · {c.company || "No company"}</div>
                                        </div>
                                        {primaryId === c._id && (
                                            <span className="ml-auto text-xs font-medium text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-md">
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
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Merged Result Preview</h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-400">Name:</span>{" "}
                                    <span className="text-slate-900 dark:text-white font-medium">{mergedPreview.name || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Email:</span>{" "}
                                    <span className="text-slate-900 dark:text-white font-medium">{mergedPreview.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Company:</span>{" "}
                                    <span className="text-slate-900 dark:text-white font-medium">{mergedPreview.company || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">Phone:</span>{" "}
                                    <span className="text-slate-900 dark:text-white font-medium">{mergedPreview.phone || "—"}</span>
                                </div>
                            </div>
                            {mergedPreview.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {mergedPreview.tags.map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 bg-sky-500/10 text-sky-500 text-xs rounded-md">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="text-xs text-gray-400 pt-1">
                                Combined: {mergedPreview.emailCount} emails · {mergedPreview.callCount} calls
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-500/20 rounded-xl p-3">
                        <p className="text-xs text-red-500">
                            ⚠️ This will delete {mergeIds.length} contact{mergeIds.length > 1 ? "s" : ""} and merge their data into the primary. This action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm text-gray-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onMerge(primaryId, mergeIds)}
                        className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-500/90 transition-all"
                    >
                        Merge {contacts.length} Contacts
                    </button>
                </div>
            </div>
        </div>
    );
}
