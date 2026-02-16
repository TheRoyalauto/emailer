"use client";

import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EmailEditor from "@/components/EmailEditor";
import { AuthGuard } from "@/components/AuthGuard";
import { PageWrapper } from "@/components/PageWrapper";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { PageLoadingSpinner } from "@/components/PageLoadingSpinner";
import { PageHeader } from "@/components/PageHeader";

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

// Template Library - Professional pre-built templates
const LIBRARY_TEMPLATES = [
    {
        id: 1,
        name: "Warm Introduction",
        category: "cold",
        subject: "Quick intro from {{senderName}}",
        description: "A friendly first-touch email that feels personal and genuine",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">Hi {{firstName}},</p><p style="margin:0 0 16px 0;">I came across {{company}} and was impressed by what you're building. I work with similar companies to help them [your value proposition].</p><p style="margin:0 0 16px 0;">Would you be open to a quick 15-minute chat to explore if there's a fit?</p><p style="margin:0 0 8px 0;">Best,</p><p style="margin:0;font-weight:600;">{{senderName}}</p></div></body></html>`,
    },
    {
        id: 2,
        name: "Value-First Outreach",
        category: "cold",
        subject: "Idea for {{company}}",
        description: "Lead with value, not a pitch. Great for high-value prospects",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">Hi {{firstName}},</p><p style="margin:0 0 16px 0;">I noticed {{company}} is [observation about their business]. I had an idea that might help with [specific challenge].</p><p style="margin:0 0 16px 0;">I put together a quick breakdown of how companies like yours are solving this — happy to share if you're interested.</p><p style="margin:0 0 16px 0;">No strings attached, just thought it might be valuable.</p><p style="margin:0;">— {{senderName}}</p></div></body></html>`,
    },
    {
        id: 3,
        name: "Direct & Confident",
        category: "cold",
        subject: "{{firstName}}, quick question",
        description: "Straight to the point for busy decision makers",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">{{firstName}},</p><p style="margin:0 0 16px 0;">We help companies like {{company}} [achieve specific result]. Clients typically see [specific outcome] within [timeframe].</p><p style="margin:0 0 16px 0;">Worth a conversation?</p><p style="margin:0;">{{senderName}}</p></div></body></html>`,
    },
    {
        id: 4,
        name: "Gentle Nudge",
        category: "followup",
        subject: "Following up",
        description: "A soft follow-up that doesn't feel pushy",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">Hi {{firstName}},</p><p style="margin:0 0 16px 0;">Just floating this back to the top of your inbox in case it got buried.</p><p style="margin:0 0 16px 0;">No worries if now isn't the right time — happy to reconnect whenever makes sense.</p><p style="margin:0;">{{senderName}}</p></div></body></html>`,
    },
    {
        id: 5,
        name: "Breakup Email",
        category: "followup",
        subject: "Should I close your file?",
        description: "Create urgency with a respectful final attempt",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">Hi {{firstName}},</p><p style="margin:0 0 16px 0;">I've reached out a few times and haven't heard back — totally understand you're busy.</p><p style="margin:0 0 16px 0;">I don't want to be a pest, so I'll assume the timing isn't right and close out your file for now.</p><p style="margin:0 0 16px 0;">If things change down the road, I'd love to reconnect. Just reply to this email anytime.</p><p style="margin:0;">All the best,<br/>{{senderName}}</p></div></body></html>`,
    },
    {
        id: 6,
        name: "Quick Check-in",
        category: "followup",
        subject: "Re: Quick follow-up",
        description: "Short and sweet for the third touch",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">{{firstName}},</p><p style="margin:0 0 16px 0;">Wanted to circle back on my previous email. Still interested in connecting?</p><p style="margin:0 0 16px 0;">A quick yes/no would be helpful so I know whether to keep you on my radar.</p><p style="margin:0;">Thanks,<br/>{{senderName}}</p></div></body></html>`,
    },
    {
        id: 7,
        name: "Thank You Note",
        category: "custom",
        subject: "Thanks {{firstName}}!",
        description: "Post-meeting appreciation that builds rapport",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">Hi {{firstName}},</p><p style="margin:0 0 16px 0;">Just wanted to say thanks for taking the time to chat today. I really enjoyed learning about {{company}} and your approach to [topic discussed].</p><p style="margin:0 0 16px 0;">As promised, [mention any follow-up items]. Looking forward to staying in touch!</p><p style="margin:0;">Best,<br/>{{senderName}}</p></div></body></html>`,
    },
    {
        id: 8,
        name: "Resource Share",
        category: "custom",
        subject: "Thought you'd find this useful",
        description: "Share valuable content to stay top of mind",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">Hi {{firstName}},</p><p style="margin:0 0 16px 0;">I came across this [article/resource/tool] and immediately thought of you — given our conversation about [topic].</p><p style="margin:0 0 16px 0;">[Link or description of resource]</p><p style="margin:0 0 16px 0;">Hope you find it useful!</p><p style="margin:0;">{{senderName}}</p></div></body></html>`,
    },
    {
        id: 9,
        name: "Referral Request",
        category: "custom",
        subject: "Quick favor?",
        description: "Ask for introductions without being awkward",
        htmlBody: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#333333;"><p style="margin:0 0 16px 0;">Hi {{firstName}},</p><p style="margin:0 0 16px 0;">Hope you're doing well! I'm currently working with more companies like {{company}} and wondered if you might know anyone who'd benefit from [your service].</p><p style="margin:0 0 16px 0;">No pressure at all — but if anyone comes to mind, I'd really appreciate an intro.</p><p style="margin:0 0 16px 0;">Either way, always happy to be a resource for you too.</p><p style="margin:0;">Best,<br/>{{senderName}}</p></div></body></html>`,
    },
];

const LIBRARY_CATEGORIES = [
    { id: "all", label: "All", icon: "📋", count: 9 },
    { id: "cold", label: "Cold Outreach", icon: "❄️", count: 3 },
    { id: "followup", label: "Follow-up", icon: "🔄", count: 3 },
    { id: "custom", label: "General", icon: "✨", count: 3 },
];

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
    const [showLibrary, setShowLibrary] = useState(false);
    const [libraryCategory, setLibraryCategory] = useState<string>("all");
    const [previewLibraryTemplate, setPreviewLibraryTemplate] = useState<number | null>(null);
    const [successToast, setSuccessToast] = useState<string | null>(null);

    // Auto-dismiss toast
    useEffect(() => {
        if (successToast) {
            const timer = setTimeout(() => setSuccessToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successToast]);

    // Queries & Mutations
    const templates = useAuthQuery(api.templates.list,
        activeCategory === "all" ? {} : { category: activeCategory }
    );
    const createTemplate = useAuthMutation(api.templates.create);
    const updateTemplate = useAuthMutation(api.templates.update);
    const deleteTemplate = useAuthMutation(api.templates.remove);
    const duplicateTemplate = useAuthMutation(api.templates.duplicate);

    // Fetch SMTP configs for test email
    const smtpConfigs = useAuthQuery(api.smtpConfigs.list);
    const defaultSmtp = smtpConfigs?.find((c: any) => c.isDefault) ?? smtpConfigs?.[0];
    const smtpConfig = defaultSmtp ? {
        host: defaultSmtp.host ?? "",
        port: defaultSmtp.port ?? 587,
        secure: defaultSmtp.secure ?? false,
        user: defaultSmtp.username ?? "",
        pass: defaultSmtp.password ?? "",
    } : undefined;

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
    const allTemplates = useAuthQuery(api.templates.list, {});
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

        const isNew = !editingId;
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
        setSuccessToast(isNew ? `"${templateName}" created successfully` : `"${templateName}" updated successfully`);
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
            case "cold": return "bg-sky-50 text-sky-600 border-sky-200";
            case "followup": return "bg-amber-50 text-amber-600 border-amber-200";
            case "custom": return "bg-violet-50 text-violet-600 border-violet-200";
            default: return "bg-slate-100 text-slate-400 border-slate-200";
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">Create Template</h2>
                            <p className="text-sm text-slate-400 mt-1">Step 1 of 2 — Choose type</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                        {[
                            { id: "cold", icon: "❄️", label: "Cold Outreach", desc: "First contact with new leads", color: "#0EA5E9" },
                            { id: "followup", icon: "🔄", label: "Follow-up", desc: "Sequence and nurture emails", color: "#F59E0B" },
                            { id: "custom", icon: "✨", label: "Custom", desc: "General purpose templates", color: "#8B5CF6" },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setTemplateCategory(cat.id);
                                    setWizardStep(2);
                                }}
                                className={`w-full p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4 text-left ${templateCategory === cat.id
                                    ? `border-slate-300 bg-white shadow-sm`
                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700"
                                    }`}
                                style={templateCategory === cat.id ? { backgroundColor: `${cat.color}10`, borderColor: `${cat.color}50` } : {}}
                            >
                                <div className="text-3xl">{cat.icon}</div>
                                <div className="flex-1">
                                    <div className="font-semibold text-slate-900 dark:text-white">{cat.label}</div>
                                    <div className="text-sm text-slate-400">{cat.desc}</div>
                                </div>
                                <span className="text-slate-400">→</span>
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            {!editingId && (
                                <button
                                    onClick={() => setWizardStep(1)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                                >
                                    ←
                                </button>
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white tracking-[-0.02em]">
                                        {editingId ? "Edit Template" : "New Template"}
                                    </h2>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(templateCategory)}`}>
                                        {getCategoryIcon(templateCategory)} {templateCategory}
                                    </span>
                                </div>
                                {!editingId && <p className="text-xs text-slate-400">Step 2 of 2 — Add details</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!templateName.trim() || !subject.trim()}
                                className="px-5 py-2 bg-slate-900 dark:bg-white rounded-lg font-semibold text-sm text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingId ? "Save" : "Create"}
                            </button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Template Name</label>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="e.g., Initial Outreach"
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subject Line</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Quick question, {{firstName}}"
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Email Editor */}
                    <div className="flex-1 min-h-0 p-4 h-full bg-slate-50 dark:bg-slate-950">
                        <EmailEditor
                            htmlBody={htmlContent}
                            onHtmlChange={setHtmlContent}
                            subject={subject}
                            smtpConfig={smtpConfig}
                            fromName={defaultSmtp?.fromName}
                            fromEmail={defaultSmtp?.fromEmail}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Template List View
    return (
        <PageWrapper>
            <div className="mb-8">
                <PageHeader
                    title="Email Templates"
                    subtitle="Craft, organize, and reuse your email templates"
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowLibrary(true)}
                            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-500 dark:text-slate-300 hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 shadow-sm"
                        >
                            <span className="text-lg">📚</span> Template Library
                        </button>
                        <button
                            onClick={handleStartNew}
                            className="px-5 py-2.5 bg-slate-900 dark:bg-white rounded-xl font-semibold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                        >
                            <span className="text-lg">+</span> New Template
                        </button>
                    </div>
                </PageHeader>
            </div>

            {/* Category Tabs */}
            <div className="mb-6">
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 w-fit shadow-sm">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === cat.id
                                ? "bg-slate-900 text-white border border-transparent"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent"
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
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
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
                    />
                </div>
            </div>

            {/* Templates Grid */}
            {templates === undefined ? (
                <PageLoadingSpinner />
            ) : filteredTemplates?.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-50 border border-cyan-200/50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold font-heading text-slate-900 dark:text-white mb-2">
                        {searchQuery ? "No matching templates" : `No ${activeCategory === "all" ? "" : activeCategory} templates yet`}
                    </h2>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        {searchQuery
                            ? "Try a different search term"
                            : "Create your first template to get started"}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={handleStartNew}
                            className="px-6 py-3 bg-slate-900 rounded-xl font-semibold text-white hover:bg-slate-800 transition-all"
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
                            className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
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
                                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                        title="Duplicate"
                                    >
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTemplate({ id: template._id });
                                        }}
                                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Template Info */}
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors mb-2 line-clamp-1">
                                {template.name}
                            </h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                                {template.subject}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>
                                    {template.createdAt
                                        ? new Date(template.createdAt).toLocaleDateString()
                                        : "—"
                                    }
                                </span>
                                <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600 font-medium">
                                    Edit →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Template Library Modal */}
            {
                showLibrary && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                    <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2 tracking-[-0.03em]">
                                        <span className="text-2xl">📚</span> Template Library
                                    </h2>
                                    <p className="text-sm text-slate-400">Professional templates ready to use</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowLibrary(false);
                                        setPreviewLibraryTemplate(null);
                                    }}
                                    className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Category Tabs */}
                            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                <div className="flex items-center gap-2">
                                    {LIBRARY_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setLibraryCategory(cat.id)}
                                            className={`group px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 ${libraryCategory === cat.id
                                                ? "bg-slate-900 text-white border border-transparent"
                                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                                                }`}
                                        >
                                            <span className={`transition-transform duration-200 ${libraryCategory === cat.id ? "scale-110" : "group-hover:scale-110"}`}>{cat.icon}</span>
                                            <span>{cat.label}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${libraryCategory === cat.id
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-100 text-slate-400"
                                                }`}>
                                                {cat.count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Template Grid */}
                            <div className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {LIBRARY_TEMPLATES
                                        .filter(t => libraryCategory === "all" || t.category === libraryCategory)
                                        .map((template, index) => (
                                            <div
                                                key={template.id}
                                                className="group relative p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                {/* Category Badge */}
                                                <div className="relative flex items-center mb-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${template.category === "cold"
                                                        ? "bg-sky-50 text-sky-600"
                                                        : template.category === "followup"
                                                            ? "bg-amber-50 text-amber-600"
                                                            : "bg-violet-50 text-violet-600"
                                                        }`}>
                                                        <span>{template.category === "cold" ? "❄️" : template.category === "followup" ? "🔄" : "✨"}</span>
                                                        {template.category === "cold" ? "Cold" : template.category === "followup" ? "Follow-up" : "General"}
                                                    </span>
                                                </div>

                                                {/* Template Info */}
                                                <h3 className="relative text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-600 transition-colors">{template.name}</h3>
                                                <p className="relative text-xs text-slate-400 mb-1.5 line-clamp-1">{template.description}</p>
                                                <p className="relative text-[11px] text-slate-400 mb-3 truncate font-mono">📧 {template.subject}</p>

                                                {/* Action Buttons */}
                                                <div className="relative flex items-center gap-2">
                                                    <button
                                                        onClick={() => setPreviewLibraryTemplate(template.id)}
                                                        className="flex-1 px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-slate-500 hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Preview
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await createTemplate({
                                                                name: template.name,
                                                                subject: template.subject,
                                                                htmlBody: template.htmlBody,
                                                                category: template.category,
                                                            });
                                                            setShowLibrary(false);
                                                            setSuccessToast(`"${template.name}" added to your templates`);
                                                        }}
                                                        className="flex-1 px-3 py-2 text-xs bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        <span>✨</span> Use
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Library Template Preview Modal */}
            {
                previewLibraryTemplate && (() => {
                    const template = LIBRARY_TEMPLATES.find(t => t.id === previewLibraryTemplate);
                    if (!template) return null;
                    return (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                    <div>
                                        <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">{template.name}</h2>
                                        <p className="text-sm text-slate-400">Subject: {template.subject}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreviewLibraryTemplate(null)}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Email Preview */}
                                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
                                    <iframe
                                        srcDoc={template.htmlBody}
                                        className="w-full h-full min-h-[350px] bg-white"
                                        title="Email Preview"
                                        sandbox="allow-same-origin"
                                    />
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <button
                                        onClick={() => setPreviewLibraryTemplate(null)}
                                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-slate-200"
                                    >
                                        ← Back to Library
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await createTemplate({
                                                name: template.name,
                                                subject: template.subject,
                                                htmlBody: template.htmlBody,
                                                category: template.category,
                                            });
                                            setPreviewLibraryTemplate(null);
                                            setShowLibrary(false);
                                            setSuccessToast(`"${template.name}" added to your templates`);
                                        }}
                                        className="px-5 py-2 bg-slate-900 rounded-lg font-semibold text-sm text-white hover:bg-slate-800 transition-all"
                                    >
                                        ✨ Use This Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()
            }
            {/* ─── Success Toast ─── */}
            {successToast && (
                <div className="fixed bottom-6 right-6 z-[100] animate-[slideUp_0.3s_ease-out]">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-500">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold">{successToast}</span>
                        <button onClick={() => setSuccessToast(null)} className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </PageWrapper >
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
