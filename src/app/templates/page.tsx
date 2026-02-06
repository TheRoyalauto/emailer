"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EmailEditor from "@/components/EmailEditor";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "../../../convex/_generated/dataModel";

// Template categories
const TEMPLATE_CATEGORIES = [
    { id: "all", label: "All Templates", icon: "📋" },
    { id: "cold", label: "Cold Outreach", icon: "❄️" },
    { id: "followup", label: "Follow-up", icon: "🔄" },
    { id: "custom", label: "Custom", icon: "✨" },
];

// Premium HTML starter template
const STARTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#111111;">
        <p style="margin:0 0 16px 0;">Hi {{firstName}},</p>
        <p style="margin:0 0 16px 0;">Your message here...</p>
        <p style="margin:0;">Best regards</p>
    </div>
</body>
</html>`;

function TemplatesPage() {
    // State
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<Id<"templates"> | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [templateCategory, setTemplateCategory] = useState<string>("custom");
    const [subject, setSubject] = useState("");
    const [htmlContent, setHtmlContent] = useState(STARTER_HTML);
    const [searchQuery, setSearchQuery] = useState("");

    // Queries & Mutations
    const templates = useQuery(api.templates.list,
        activeCategory === "all" ? {} : { category: activeCategory }
    );
    const createTemplate = useMutation(api.templates.create);
    const updateTemplate = useMutation(api.templates.update);
    const deleteTemplate = useMutation(api.templates.remove);
    const duplicateTemplate = useMutation(api.templates.duplicate);

    // Handle URL-based modal opening
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            handleStartNew();
        }
        // Handle edit from campaign page
        const editId = searchParams.get('edit');
        if (editId && templates) {
            const templateToEdit = templates.find(t => t._id === editId);
            if (templateToEdit) {
                handleEdit(templateToEdit);
            }
        }
    }, [searchParams, templates]);

    // Filter by search
    const filteredTemplates = templates?.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Template counts by category
    const allTemplates = useQuery(api.templates.list, {});
    const categoryCounts = {
        all: allTemplates?.length || 0,
        cold: allTemplates?.filter(t => t.category === "cold").length || 0,
        followup: allTemplates?.filter(t => t.category === "followup").length || 0,
        custom: allTemplates?.filter(t => !t.category || t.category === "custom").length || 0,
    };

    const handleStartNew = () => {
        setIsEditing(true);
        setEditingId(null);
        setTemplateName("");
        setTemplateCategory("custom");
        setSubject("");
        setHtmlContent(STARTER_HTML);
    };

    const handleEdit = (template: NonNullable<typeof templates>[0]) => {
        setIsEditing(true);
        setEditingId(template._id);
        setTemplateName(template.name);
        setTemplateCategory(template.category || "custom");
        setSubject(template.subject);
        setHtmlContent(template.htmlBody);
    };

    const handleSave = async () => {
        if (!templateName.trim() || !subject.trim()) return;

        if (editingId) {
            await updateTemplate({
                id: editingId,
                name: templateName,
                subject,
                htmlBody: htmlContent,
                category: templateCategory,
            });
        } else {
            await createTemplate({
                name: templateName,
                subject,
                htmlBody: htmlContent,
                category: templateCategory,
            });
        }

        setIsEditing(false);
        setEditingId(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingId(null);
    };

    const handleDuplicate = async (id: Id<"templates">) => {
        await duplicateTemplate({ id });
    };

    const getCategoryColor = (category: string | undefined) => {
        switch (category) {
            case "cold": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "followup": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
            case "custom": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
            default: return "bg-white/10 text-white/60 border-white/20";
        }
    };

    const getCategoryIcon = (category: string | undefined) => {
        switch (category) {
            case "cold": return "❄️";
            case "followup": return "🔄";
            case "custom": return "✨";
            default: return "📝";
        }
    };

    // Wizard state
    const [wizardStep, setWizardStep] = useState<1 | 2>(editingId ? 2 : 1);

    // Reset wizard when starting new
    useEffect(() => {
        if (isEditing && !editingId) {
            setWizardStep(1);
        } else if (isEditing && editingId) {
            setWizardStep(2);
        }
    }, [isEditing, editingId]);

    // Wizard Step 1: Choose Template Type
    if (isEditing && wizardStep === 1) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#12121f] rounded-2xl border border-white/10 max-w-lg w-full p-6 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Create Template</h2>
                            <p className="text-sm text-white/50 mt-1">Step 1 of 2 — Choose type</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                        {[
                            { id: "cold", icon: "❄️", label: "Cold Outreach", desc: "First contact with new leads", color: "blue" },
                            { id: "followup", icon: "🔄", label: "Follow-up", desc: "Sequence and nurture emails", color: "amber" },
                            { id: "custom", icon: "✨", label: "Custom", desc: "General purpose templates", color: "purple" },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setTemplateCategory(cat.id);
                                    setWizardStep(2);
                                }}
                                className={`w-full p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4 text-left ${templateCategory === cat.id
                                    ? cat.color === "blue"
                                        ? "bg-blue-500/10 border-blue-500/40"
                                        : cat.color === "amber"
                                            ? "bg-amber-500/10 border-amber-500/40"
                                            : "bg-purple-500/10 border-purple-500/40"
                                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                                    }`}
                            >
                                <div className="text-3xl">{cat.icon}</div>
                                <div className="flex-1">
                                    <div className={`font-semibold ${cat.color === "blue" ? "text-blue-300" : cat.color === "amber" ? "text-amber-300" : "text-purple-300"
                                        }`}>
                                        {cat.label}
                                    </div>
                                    <div className="text-sm text-white/50">{cat.desc}</div>
                                </div>
                                <span className="text-white/30">→</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Wizard Step 2: Template Editor (Centered Modal)
    if (isEditing && wizardStep === 2) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#0d0d15] rounded-2xl border border-white/10 max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12121f]">
                        <div className="flex items-center gap-3">
                            {!editingId && (
                                <button
                                    onClick={() => setWizardStep(1)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                                >
                                    ←
                                </button>
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-white">
                                        {editingId ? "Edit Template" : "New Template"}
                                    </h2>
                                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(templateCategory)}`}>
                                        {getCategoryIcon(templateCategory)} {templateCategory}
                                    </span>
                                </div>
                                {!editingId && <p className="text-xs text-white/40">Step 2 of 2 — Add details</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!templateName.trim() || !subject.trim()}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingId ? "Save" : "Create"}
                            </button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="px-6 py-4 border-b border-white/10 bg-[#0d0d15]">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5">Template Name</label>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="e.g., Initial Outreach"
                                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/50 mb-1.5">Subject Line</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Quick question, {{firstName}}"
                                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Editor */}
                    <div className="flex-1 min-h-0 p-4 h-full">
                        <EmailEditor
                            htmlBody={htmlContent}
                            onHtmlChange={setHtmlContent}
                            subject={subject}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Template List View
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Email Templates
                            </h1>
                            <p className="text-white/50 mt-2">Craft, organize, and reuse your email templates</p>
                        </div>
                        <button
                            onClick={handleStartNew}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <span className="text-lg">+</span> New Template
                        </button>
                    </div>
                </div>

                {/* Category Tabs - Robinhood Style */}
                <div className="mb-6">
                    <div className="flex items-center gap-1 p-1 bg-[#12121f] rounded-xl border border-white/10 w-fit">
                        {TEMPLATE_CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === cat.id
                                    ? "bg-white/10 text-white border border-white/20"
                                    : "text-white/50 hover:text-white/70 hover:bg-white/5"
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeCategory === cat.id ? "bg-indigo-500/30 text-indigo-300" : "bg-white/10 text-white/40"
                                    }`}>
                                    {categoryCounts[cat.id as keyof typeof categoryCounts]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search templates..."
                            className="w-full pl-11 pr-4 py-3 bg-[#12121f] border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-white placeholder:text-white/30"
                        />
                    </div>
                </div>

                {/* Templates Grid */}
                {templates === undefined ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredTemplates?.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">
                            {searchQuery ? "No matching templates" : `No ${activeCategory === "all" ? "" : activeCategory} templates yet`}
                        </h2>
                        <p className="text-white/50 mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? "Try a different search term"
                                : "Create your first template to get started"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={handleStartNew}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
                            >
                                Create Template
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates?.map((template) => (
                            <div
                                key={template._id}
                                className="group relative p-5 rounded-2xl bg-gradient-to-br from-[#12121f] to-[#16162a] border border-white/10 hover:border-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
                                onClick={() => handleEdit(template)}
                            >
                                {/* Category Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(template.category)}`}>
                                        {getCategoryIcon(template.category)} {template.category || "Custom"}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDuplicate(template._id);
                                            }}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Duplicate"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTemplate({ id: template._id });
                                            }}
                                            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Template Info */}
                                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-1">
                                    {template.name}
                                </h3>
                                <p className="text-white/50 text-sm line-clamp-2 mb-4">
                                    {template.subject}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-white/40">
                                    <span>
                                        {template.createdAt
                                            ? new Date(template.createdAt).toLocaleDateString()
                                            : "—"
                                        }
                                    </span>
                                    <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                                        Edit →
                                    </span>
                                </div>

                                {/* Hover glow effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all pointer-events-none" />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// Wrapper with auth
export default function TemplatesPageWrapper() {
    return (
        <AuthGuard>
            <TemplatesPage />
        </AuthGuard>
    );
}
