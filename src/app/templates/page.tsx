"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EmailEditor from "@/components/EmailEditor";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

// Beautiful pre-built HTML designs for one-click insertion
const PREMIUM_DESIGNS = [
    {
        id: "hero-gradient",
        name: "Gradient Hero",
        preview: "🎨",
        category: "Headers",
        html: `<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;border-radius:12px;text-align:center;margin-bottom:24px;">
  <h1 style="margin:0 0 12px 0;color:#ffffff;font-size:28px;font-weight:700;">Your Bold Headline</h1>
  <p style="margin:0;color:rgba(255,255,255,0.9);font-size:16px;">A compelling subheadline that captures attention</p>
</div>`,
    },
    {
        id: "cta-primary",
        name: "Primary CTA",
        preview: "🔘",
        category: "Buttons",
        html: `<table border="0" cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td align="center" style="border-radius:8px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);">
      <a href="https://example.com" target="_blank" style="display:inline-block;padding:16px 40px;font-family:Arial,sans-serif;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Get Started Free →</a>
    </td>
  </tr>
</table>`,
    },
    {
        id: "cta-outline",
        name: "Outline Button",
        preview: "⭕",
        category: "Buttons",
        html: `<table border="0" cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td align="center" style="border-radius:8px;border:2px solid #6366f1;">
      <a href="https://example.com" target="_blank" style="display:inline-block;padding:14px 36px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#6366f1;text-decoration:none;">Learn More</a>
    </td>
  </tr>
</table>`,
    },
    {
        id: "feature-grid",
        name: "Feature Grid",
        preview: "📊",
        category: "Content",
        html: `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
  <tr>
    <td style="padding:16px;background:#f8fafc;border-radius:8px;width:50%;vertical-align:top;">
      <div style="font-size:28px;margin-bottom:8px;">⚡</div>
      <h3 style="margin:0 0 6px 0;font-size:16px;font-weight:600;color:#111;">Lightning Fast</h3>
      <p style="margin:0;font-size:14px;color:#666;">Blazing performance for your workflows</p>
    </td>
    <td style="width:16px;"></td>
    <td style="padding:16px;background:#f8fafc;border-radius:8px;width:50%;vertical-align:top;">
      <div style="font-size:28px;margin-bottom:8px;">🛡️</div>
      <h3 style="margin:0 0 6px 0;font-size:16px;font-weight:600;color:#111;">Secure</h3>
      <p style="margin:0;font-size:14px;color:#666;">Enterprise-grade security built in</p>
    </td>
  </tr>
</table>`,
    },
    {
        id: "testimonial",
        name: "Testimonial",
        preview: "💬",
        category: "Social Proof",
        html: `<div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0;border-left:4px solid #6366f1;">
  <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333;font-style:italic;">"This product completely transformed how our team works. We've saved hours every week and our customers are happier than ever."</p>
  <div style="display:flex;align-items:center;">
    <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);margin-right:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;">JD</div>
    <div>
      <div style="font-weight:600;color:#111;font-size:14px;">Jane Doe</div>
      <div style="color:#666;font-size:12px;">CEO at TechCorp</div>
    </div>
  </div>
</div>`,
    },
    {
        id: "pricing-card",
        name: "Pricing Card",
        preview: "💳",
        category: "Pricing",
        html: `<div style="background:linear-gradient(180deg,#1a1a2e 0%,#16162a 100%);border-radius:16px;padding:32px;margin:24px 0;text-align:center;border:1px solid rgba(255,255,255,0.1);">
  <div style="color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Most Popular</div>
  <div style="color:#fff;font-size:48px;font-weight:700;">$29<span style="font-size:16px;font-weight:400;">/mo</span></div>
  <p style="color:rgba(255,255,255,0.7);margin:12px 0 24px 0;font-size:14px;">Perfect for growing teams</p>
  <a href="#" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Start Free Trial</a>
</div>`,
    },
    {
        id: "countdown",
        name: "Urgency Banner",
        preview: "⏰",
        category: "Urgency",
        html: `<div style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:20px;border-radius:8px;text-align:center;margin:24px 0;">
  <p style="margin:0 0 8px 0;color:#fff;font-size:18px;font-weight:600;">🔥 Limited Time Offer - Ends Soon!</p>
  <p style="margin:0;color:rgba(255,255,255,0.9);font-size:14px;">Use code <strong>SAVE20</strong> for 20% off your first month</p>
</div>`,
    },
    {
        id: "image-text",
        name: "Image + Text",
        preview: "🖼️",
        category: "Content",
        html: `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
  <tr>
    <td style="width:180px;vertical-align:top;">
      <div style="width:160px;height:120px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:32px;">📸</div>
    </td>
    <td style="vertical-align:top;padding-left:20px;">
      <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111;">Feature Highlight</h3>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">Describe your amazing feature here. Make it compelling and benefit-focused to drive engagement.</p>
    </td>
  </tr>
</table>`,
    },
    {
        id: "divider-fancy",
        name: "Fancy Divider",
        preview: "✨",
        category: "Dividers",
        html: `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0;">
  <tr>
    <td style="border-top:1px solid #e5e7eb;"></td>
    <td style="padding:0 16px;color:#9ca3af;font-size:12px;white-space:nowrap;">✨ ✨ ✨</td>
    <td style="border-top:1px solid #e5e7eb;"></td>
  </tr>
</table>`,
    },
    {
        id: "footer-pro",
        name: "Pro Footer",
        preview: "📝",
        category: "Footers",
        html: `<div style="margin-top:40px;padding-top:24px;border-top:1px solid #e5e7eb;text-align:center;">
  <p style="margin:0 0 12px 0;font-size:13px;color:#666;">
    <a href="#" style="color:#6366f1;text-decoration:none;margin:0 8px;">Website</a> •
    <a href="#" style="color:#6366f1;text-decoration:none;margin:0 8px;">Twitter</a> •
    <a href="#" style="color:#6366f1;text-decoration:none;margin:0 8px;">LinkedIn</a>
  </p>
  <p style="margin:0;font-size:11px;color:#999;">
    © 2026 Your Company • 
    <a href="{{unsubscribeUrl}}" style="color:#999;">Unsubscribe</a>
  </p>
</div>`,
    },
];

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
    const templates = useQuery(api.campaigns.list);
    const createTemplate = useMutation(api.campaigns.create);
    const updateTemplate = useMutation(api.campaigns.update);
    const deleteTemplate = useMutation(api.campaigns.remove);

    // Editor state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState("");
    const [subject, setSubject] = useState("");
    const [htmlContent, setHtmlContent] = useState(STARTER_HTML);
    const [showDesigns, setShowDesigns] = useState(false);
    const [designCategory, setDesignCategory] = useState<string>("All");

    const categories = ["All", ...new Set(PREMIUM_DESIGNS.map(d => d.category))];
    const filteredDesigns = designCategory === "All"
        ? PREMIUM_DESIGNS
        : PREMIUM_DESIGNS.filter(d => d.category === designCategory);

    // Handle URL-based modal opening (from dashboard quick actions)
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            setIsEditing(true);
            setEditingId(null);
            setTemplateName("");
            setSubject("");
            setHtmlContent("");
        }
    }, [searchParams]);

    const handleStartNew = () => {
        setIsEditing(true);
        setEditingId(null);
        setTemplateName("");
        setSubject("");
        setHtmlContent("");
    };

    const handleEdit = (template: NonNullable<typeof templates>[0]) => {
        setIsEditing(true);
        setEditingId(template._id);
        setTemplateName(template.name);
        setSubject(template.subject);
        setHtmlContent(template.htmlContent);
    };

    const handleSave = async () => {
        if (!templateName.trim() || !subject.trim()) return;

        if (editingId) {
            await updateTemplate({
                id: editingId as any,
                name: templateName,
                subject,
                htmlContent,
            });
        } else {
            await createTemplate({
                name: templateName,
                subject,
                htmlContent,
            });
        }

        setIsEditing(false);
        setEditingId(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingId(null);
    };

    const insertDesign = (html: string) => {
        // Find insertion point (before closing div/body)
        const insertPoint = htmlContent.lastIndexOf("</div>");
        if (insertPoint > 0) {
            const newHtml = htmlContent.slice(0, insertPoint) + "\n" + html + "\n" + htmlContent.slice(insertPoint);
            setHtmlContent(newHtml);
        } else {
            setHtmlContent(htmlContent + "\n" + html);
        }
    };

    const statusColors: Record<string, string> = {
        draft: "bg-zinc-600",
        scheduled: "bg-amber-600",
        sending: "bg-blue-600 animate-pulse",
        sent: "bg-green-600",
        paused: "bg-orange-600",
    };

    // Full-screen editor mode
    if (isEditing) {
        return (
            <div className="fixed inset-0 bg-[#0a0a0f] z-50 flex flex-col">
                {/* Top Bar */}
                <header className="flex-shrink-0 border-b border-white/10 bg-black/60 backdrop-blur-sm">
                    <div className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                ← Back
                            </button>
                            <div className="h-6 w-px bg-white/20" />
                            <h1 className="text-lg font-semibold">
                                {editingId ? "Edit Template" : "Create Template"}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDesigns(!showDesigns)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${showDesigns
                                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                                    : "bg-white/10 hover:bg-white/20"
                                    }`}
                            >
                                ✨ Design Library
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!templateName.trim() || !subject.trim()}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingId ? "Save Changes" : "Create Template"}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Design Library Panel */}
                {showDesigns && (
                    <div className="flex-shrink-0 border-b border-white/10 bg-[#12121f] p-4 max-h-40 overflow-y-auto">
                        <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm font-medium text-white/60">Quick Insert:</span>
                            <div className="flex gap-2 flex-wrap">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setDesignCategory(cat)}
                                        className={`px-3 py-1 rounded-lg text-xs transition-all ${designCategory === cat
                                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                                            : "bg-white/5 hover:bg-white/10 text-white/60"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {filteredDesigns.map((design) => (
                                <button
                                    key={design.id}
                                    onClick={() => insertDesign(design.html)}
                                    className="flex-shrink-0 w-24 p-2 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all group text-left"
                                >
                                    <span className="text-lg block mb-1">{design.preview}</span>
                                    <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1">
                                        {design.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex min-h-0">
                    {/* Left Panel - Template Details + Editor */}
                    <div className="flex-1 flex flex-col min-w-0 border-r border-white/10">
                        {/* Template Metadata */}
                        <div className="flex-shrink-0 p-4 border-b border-white/10 bg-[#0d0d15]">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-2">Template Name</label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        placeholder="e.g., Welcome Email"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-white/50 mb-2">Email Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g., Welcome, {{firstName}}!"
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Editor */}
                        <div className="flex-1 min-h-0 p-4">
                            <EmailEditor
                                htmlBody={htmlContent}
                                onHtmlChange={setHtmlContent}
                                subject={subject}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Template List View
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Email Templates
                        </h1>
                        <p className="text-white/50 mt-1">Create and manage your email templates</p>
                    </div>
                    <button
                        onClick={handleStartNew}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <span className="text-lg">+</span> New Template
                    </button>
                </div>

                {templates === undefined ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                            <span className="text-4xl">📝</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No templates yet</h2>
                        <p className="text-white/50 mb-6 max-w-md mx-auto">
                            Create your first email template to use in campaigns.
                        </p>
                        <button
                            onClick={handleStartNew}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                            Create Your First Template
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {templates.map((template) => (
                            <div
                                key={template._id}
                                className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all group cursor-pointer"
                                onClick={() => handleEdit(template)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold group-hover:text-indigo-300 transition-colors truncate">
                                                {template.name}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[template.status]}`}>
                                                {template.status}
                                            </span>
                                        </div>
                                        <p className="text-white/50 text-sm truncate">{template.subject}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(template);
                                            }}
                                            className="px-3 py-1.5 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTemplate({ id: template._id });
                                            }}
                                            className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
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
