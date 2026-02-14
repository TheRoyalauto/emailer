"use client";

import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

export default function LinksPage() {
    return (
        <AuthGuard>
            <LinksContent />
        </AuthGuard>
    );
}

function LinksContent() {
    const [isCreating, setIsCreating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        destinationUrl: "",
        label: "",
        utmSource: "",
        utmMedium: "email",
        utmCampaign: "",
        utmContent: "",
        utmTerm: "",
    });

    const links = useAuthQuery(api.trackedLinks.list, {});
    const stats = useAuthQuery(api.trackedLinks.getStats, {});
    const createLink = useAuthMutation(api.trackedLinks.create);
    const updateLink = useAuthMutation(api.trackedLinks.update);
    const deleteLink = useAuthMutation(api.trackedLinks.remove);

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    const resetForm = () => {
        setFormData({
            destinationUrl: "",
            label: "",
            utmSource: "",
            utmMedium: "email",
            utmCampaign: "",
            utmContent: "",
            utmTerm: "",
        });
        setIsCreating(false);
    };

    const handleCreate = async () => {
        if (!formData.destinationUrl) return;

        await createLink({
            destinationUrl: formData.destinationUrl,
            label: formData.label || undefined,
            utmSource: formData.utmSource || undefined,
            utmMedium: formData.utmMedium || undefined,
            utmCampaign: formData.utmCampaign || undefined,
            utmContent: formData.utmContent || undefined,
            utmTerm: formData.utmTerm || undefined,
        });
        resetForm();
    };

    const copyToClipboard = async (code: string, id: string) => {
        const url = `${baseUrl}/api/r/${code}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: Id<"trackedLinks">) => {
        if (confirm("Delete this tracking link?")) {
            await deleteLink({ id });
        }
    };

    const toggleActive = async (id: Id<"trackedLinks">, isActive: boolean) => {
        await updateLink({ id, isActive: !isActive });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Tracked Links</h1>
                        <p className="text-white/50 text-sm">Create and manage click-tracked URLs with UTM parameters</p>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all"
                        >
                            + Create Link
                        </button>
                    )}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold text-blue-400">{stats?.total || 0}</div>
                        <div className="text-sm text-white/50">Total Links</div>
                    </div>
                    <div className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-400">{stats?.totalClicks || 0}</div>
                        <div className="text-sm text-white/50">Total Clicks</div>
                    </div>
                    <div className="p-4 bg-[#12121a] border border-white/10 rounded-xl">
                        <div className="text-2xl font-bold text-purple-400">{stats?.activeLinks || 0}</div>
                        <div className="text-sm text-white/50">Active Links</div>
                    </div>
                </div>

                {/* Create Form */}
                {isCreating && (
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Create Tracked Link</h2>
                            <button onClick={resetForm} className="text-white/50 hover:text-white">✕</button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Core */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-white/70 mb-1">Destination URL *</label>
                                    <input
                                        type="url"
                                        value={formData.destinationUrl}
                                        onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                                        placeholder="https://example.com/landing-page"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-white/70 mb-1">Label (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        placeholder="e.g., CTA Button, Email Footer"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30"
                                    />
                                </div>
                            </div>

                            {/* Right Column - UTM */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-white/70">UTM Parameters</span>
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Optional</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Source</label>
                                        <input
                                            type="text"
                                            value={formData.utmSource}
                                            onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                                            placeholder="newsletter"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Medium</label>
                                        <input
                                            type="text"
                                            value={formData.utmMedium}
                                            onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                                            placeholder="email"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Campaign</label>
                                        <input
                                            type="text"
                                            value={formData.utmCampaign}
                                            onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                                            placeholder="spring_sale"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1">Content</label>
                                        <input
                                            type="text"
                                            value={formData.utmContent}
                                            onChange={(e) => setFormData({ ...formData, utmContent: e.target.value })}
                                            placeholder="cta_button"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        {formData.destinationUrl && (
                            <div className="mt-4 p-3 bg-black/30 rounded-lg">
                                <span className="text-xs text-white/50">Preview: </span>
                                <span className="text-xs text-cyan-400 font-mono">{baseUrl}/api/r/[code]</span>
                                <span className="text-xs text-white/30"> → </span>
                                <span className="text-xs text-white/70 truncate">{formData.destinationUrl}</span>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                            <button onClick={resetForm} className="px-4 py-2 text-white/50 hover:text-white">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={!formData.destinationUrl}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                            >
                                Create Link
                            </button>
                        </div>
                    </div>
                )}

                {/* Links List */}
                <div className="space-y-3">
                    {links?.length === 0 && !isCreating && (
                        <div className="bg-[#12121a] border border-white/10 rounded-xl p-12 text-center">
                            <div className="text-4xl mb-4">🔗</div>
                            <h3 className="text-lg font-medium text-white mb-2">No Tracked Links Yet</h3>
                            <p className="text-white/50 text-sm mb-4">Create tracked links to monitor clicks and add UTM parameters</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium"
                            >
                                + Create First Link
                            </button>
                        </div>
                    )}

                    {links?.map((link) => (
                        <div key={link._id} className="bg-[#12121a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleActive(link._id, link.isActive)}
                                        className={`w-10 h-6 rounded-full transition-all ${link.isActive ? "bg-emerald-500" : "bg-white/20"}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${link.isActive ? "translate-x-5" : "translate-x-1"}`} />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{link.label || "Untitled"}</span>
                                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-mono">
                                                {link.code}
                                            </span>
                                        </div>
                                        <div className="text-sm text-white/50 truncate max-w-md">
                                            {link.destinationUrl}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Click Stats */}
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-emerald-400">{link.clickCount}</div>
                                        <div className="text-xs text-white/40">clicks</div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyToClipboard(link.code, link._id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copiedId === link._id
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-white/5 text-white/60 hover:bg-white/10"
                                                }`}
                                        >
                                            {copiedId === link._id ? "✓ Copied" : "📋 Copy"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link._id)}
                                            className="px-3 py-1.5 bg-white/5 text-red-400/70 hover:text-red-400 rounded-lg text-sm"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* UTM Tags */}
                            {(link.utmSource || link.utmCampaign) && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {link.utmSource && (
                                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                            source: {link.utmSource}
                                        </span>
                                    )}
                                    {link.utmMedium && (
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                            medium: {link.utmMedium}
                                        </span>
                                    )}
                                    {link.utmCampaign && (
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                                            campaign: {link.utmCampaign}
                                        </span>
                                    )}
                                    {link.utmContent && (
                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                                            content: {link.utmContent}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Last Click */}
                            {link.lastClickedAt && (
                                <div className="text-xs text-white/30 mt-2">
                                    Last click: {new Date(link.lastClickedAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
