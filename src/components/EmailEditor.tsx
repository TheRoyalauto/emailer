"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

interface EmailEditorProps {
    htmlBody: string;
    onHtmlChange: (html: string) => void;
    subject?: string;
}

const VARIABLES = [
    { key: "{{firstName}}", label: "First Name" },
    { key: "{{lastName}}", label: "Last Name" },
    { key: "{{email}}", label: "Email" },
    { key: "{{company}}", label: "Company" },
    { key: "{{unsubscribeUrl}}", label: "Unsubscribe Link" },
];

const HTML_SNIPPETS = [
    { id: "cta", icon: "🔘", name: "Button", html: `<p style="margin:0 0 16px 0;"><a href="https://example.com" style="display:inline-block;padding:14px 28px;background:#8b5cf6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">Get Started Now</a></p>` },
    { id: "divider", icon: "➖", name: "Divider", html: `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />` },
    { id: "bullets", icon: "📋", name: "List", html: `<ul style="margin:0 0 16px 20px;padding:0;"><li style="margin:0 0 8px 0;">First point</li><li style="margin:0 0 8px 0;">Second point</li></ul>` },
    { id: "callout", icon: "💡", name: "Callout", html: `<div style="margin:0 0 16px 0;padding:16px 20px;background:#f3f4f6;border-left:4px solid #8b5cf6;border-radius:4px;"><strong>Pro Tip:</strong> Your note here.</div>` },
    { id: "signature", icon: "✍️", name: "Signature", html: `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e5e5;"><p style="margin:0 0 4px 0;font-weight:600;">Your Name</p><p style="margin:0;color:#666;font-size:14px;">Title | Company</p></div>` },
];

const STARTER_TEMPLATE = `<!DOCTYPE html>
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

// Extract inner body content from full HTML for visual editing
function extractBodyContent(html: string): string {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) return bodyMatch[1].trim();
    // If no body tag, check for div wrapper
    const divMatch = html.match(/<div[^>]*>([\s\S]*)<\/div>/i);
    if (divMatch) return divMatch[1].trim();
    return html;
}

// Wrap visual editor content back into full email HTML
function wrapInEmailHtml(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#111111;">
        ${content}
    </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual Editor Toolbar Button
// ─────────────────────────────────────────────────────────────────────────────
function ToolbarButton({ onClick, isActive, children, title }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`p-1.5 rounded text-sm transition-all ${isActive
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            title={title}
        >
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Visual Editor Toolbar
// ─────────────────────────────────────────────────────────────────────────────
function VisualToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
    const [showVariables, setShowVariables] = useState(false);

    if (!editor) return null;

    const addLink = () => {
        const url = prompt("Enter URL:");
        if (url) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    };

    const insertVariable = (variable: string) => {
        editor.chain().focus().insertContent(variable).run();
        setShowVariables(false);
    };

    return (
        <div className="flex items-center gap-0.5 flex-wrap">
            {/* Text Formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold (Ctrl+B)">
                <span className="font-bold">B</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic (Ctrl+I)">
                <span className="italic">I</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline (Ctrl+U)">
                <span className="underline">U</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
                <span className="line-through">S</span>
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Headings */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading">
                <span className="font-bold text-xs">H</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Subheading">
                <span className="font-semibold text-[10px]">H2</span>
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Lists */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
                •≡
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
                1.
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Block Elements */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
                ❝
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
                ━
            </ToolbarButton>
            <ToolbarButton onClick={addLink} isActive={editor.isActive("link")} title="Link">
                🔗
            </ToolbarButton>
            {editor.isActive("link") && (
                <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
                    🚫
                </ToolbarButton>
            )}

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Variables & Undo/Redo */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => setShowVariables(!showVariables)}
                    className="px-2 py-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 text-xs transition-colors font-mono"
                    title="Insert Variable"
                >
                    {`{{x}}`} ▾
                </button>
                {showVariables && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg p-1 z-50 min-w-44 shadow-xl">
                        <div className="text-[10px] text-gray-400 px-2 py-1 font-medium">INSERT VARIABLE</div>
                        {VARIABLES.map((v) => (
                            <button
                                key={v.key}
                                className="w-full px-2 py-1.5 text-left text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                                onClick={() => insertVariable(v.key)}
                            >
                                <code className="text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded text-[10px]">{v.key}</code>
                                <span>{v.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                ↩
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                ↪
            </ToolbarButton>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Email Editor Component
// ─────────────────────────────────────────────────────────────────────────────
export default function EmailEditor({ htmlBody, onHtmlChange, subject }: EmailEditorProps) {
    const [activeView, setActiveView] = useState<"visual" | "code" | "preview">("visual");
    const [showCodeVariables, setShowCodeVariables] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClick = () => setShowCodeVariables(false);
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    // TipTap editor instance
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-indigo-600 underline cursor-pointer",
                },
            }),
            Placeholder.configure({
                placeholder: "Start writing your email here…",
            }),
        ],
        content: extractBodyContent(htmlBody),
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onHtmlChange(wrapInEmailHtml(html));
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-5 py-4 text-gray-800 leading-relaxed",
            },
        },
    });

    // Sync editor when switching TO visual mode
    useEffect(() => {
        if (activeView === "visual" && editor) {
            const currentContent = extractBodyContent(htmlBody);
            const editorContent = editor.getHTML();
            // Only update if meaningfully different (avoid loops)
            if (currentContent.replace(/\s+/g, "") !== editorContent.replace(/\s+/g, "")) {
                editor.commands.setContent(currentContent);
            }
        }
    }, [activeView]); // eslint-disable-line react-hooks/exhaustive-deps

    // Code mode: Insert text at cursor
    const insertAtCursor = useCallback((text: string) => {
        if (activeView === "visual" && editor) {
            editor.chain().focus().insertContent(text).run();
            return;
        }
        const textarea = textareaRef.current;
        if (!textarea) {
            onHtmlChange(htmlBody + text);
            return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = htmlBody.substring(0, start) + text + htmlBody.substring(end);
        onHtmlChange(newValue);
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + text.length;
            textarea.focus();
        }, 0);
    }, [htmlBody, onHtmlChange, activeView, editor]);

    // Code mode: Wrap selection
    const wrapSelection = useCallback((before: string, after: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = htmlBody.substring(start, end);
        const newValue = htmlBody.substring(0, start) + before + selectedText + after + htmlBody.substring(end);
        onHtmlChange(newValue);
        setTimeout(() => {
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selectedText.length;
            textarea.focus();
        }, 0);
    }, [htmlBody, onHtmlChange]);

    const formatBold = () => wrapSelection("<b>", "</b>");
    const formatItalic = () => wrapSelection("<i>", "</i>");
    const formatLink = () => {
        const url = prompt("Enter URL:");
        if (url) wrapSelection(`<a href="${url}" style="color:#4f46e5;text-decoration:underline;">`, "</a>");
    };

    // Code mode: Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const insertHtml = e.shiftKey ? '\n<p style="margin:0 0 16px 0;"></p>' : '<br>\n';
            const newValue = htmlBody.substring(0, start) + insertHtml + htmlBody.substring(end);
            onHtmlChange(newValue);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + insertHtml.length;
                textarea.focus();
            }, 0);
        }
    };

    const loadStarterTemplate = () => {
        onHtmlChange(STARTER_TEMPLATE);
        if (editor) {
            editor.commands.setContent(extractBodyContent(STARTER_TEMPLATE));
        }
    };

    // Preview with interpolated variables
    const getPreviewHtml = () => {
        if (!htmlBody.trim()) {
            return `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#999;text-align:center;font-family:Arial,sans-serif;">
                <div><div style="font-size:40px;margin-bottom:12px;">📧</div><div style="font-size:13px;">Start typing to see preview</div></div>
            </div>`;
        }
        return htmlBody
            .replace(/\{\{firstName\}\}/g, "John")
            .replace(/\{\{lastName\}\}/g, "Doe")
            .replace(/\{\{email\}\}/g, "john@example.com")
            .replace(/\{\{company\}\}/g, "Acme Inc.")
            .replace(/\{\{unsubscribeUrl\}\}/g, "#unsubscribe");
    };

    const isEmpty = !htmlBody.trim();

    return (
        <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* ── Header: Mode Tabs + Toolbar ── */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                    {(["visual", "code", "preview"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setActiveView(mode)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeView === mode
                                ? "bg-indigo-500 text-white shadow"
                                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                                }`}
                        >
                            {mode === "visual" ? "✏️ Visual" : mode === "code" ? "🖥 Code" : "👁 Preview"}
                        </button>
                    ))}
                </div>

                {/* Mode-specific tools */}
                {activeView === "code" && (
                    <div className="flex items-center gap-1">
                        <button onClick={formatBold} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 text-sm font-bold transition-colors" title="Bold">B</button>
                        <button onClick={formatItalic} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 text-sm italic transition-colors" title="Italic">I</button>
                        <button onClick={formatLink} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 text-sm transition-colors" title="Link">🔗</button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowCodeVariables(!showCodeVariables)}
                                className="px-2 py-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 text-xs transition-colors"
                            >
                                {`{{x}}`} ▾
                            </button>
                            {showCodeVariables && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg p-1 z-50 min-w-40 shadow-xl">
                                    <div className="text-[10px] text-gray-400 px-2 py-1">Insert Variable</div>
                                    {VARIABLES.map((v) => (
                                        <button
                                            key={v.key}
                                            className="w-full px-2 py-1.5 text-left text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                                            onClick={() => { insertAtCursor(v.key); setShowCodeVariables(false); }}
                                        >
                                            <code className="text-indigo-500 mr-2">{v.key}</code>
                                            {v.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeView === "preview" && (
                    <span className="text-xs text-gray-400">Live preview with sample data</span>
                )}
            </div>

            {/* ── Visual Toolbar (only in visual mode) ── */}
            {activeView === "visual" && editor && (
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                    <VisualToolbar editor={editor} />
                </div>
            )}

            {/* ── Content Area ── */}
            <div className="flex-1 overflow-hidden">
                {/* ── VISUAL MODE ── */}
                {activeView === "visual" && (
                    <div className="h-full flex flex-col">
                        {isEmpty && (
                            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={loadStarterTemplate}
                                    className="px-3 py-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md text-indigo-600 transition-all"
                                >
                                    📄 Load Starter Template
                                </button>
                            </div>
                        )}
                        <div className="flex-1 overflow-auto">
                            <EditorContent editor={editor} className="h-full" />
                        </div>
                    </div>
                )}

                {/* ── CODE MODE ── */}
                {activeView === "code" && (
                    <div className="h-full flex flex-col">
                        {/* Component Snippets */}
                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-medium shrink-0">INSERT:</span>
                                <div className="flex gap-1 flex-wrap">
                                    {HTML_SNIPPETS.map((snippet) => (
                                        <button
                                            key={snippet.id}
                                            onClick={() => insertAtCursor(snippet.html)}
                                            className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-indigo-400 rounded-md text-gray-600 hover:text-gray-900 transition-all flex items-center gap-1"
                                            title={snippet.name}
                                        >
                                            <span>{snippet.icon}</span>
                                            <span className="hidden sm:inline">{snippet.name}</span>
                                        </button>
                                    ))}
                                    {isEmpty && (
                                        <button
                                            onClick={loadStarterTemplate}
                                            className="px-2 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md text-indigo-600 transition-all ml-2"
                                        >
                                            📄 Load Template
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* HTML Textarea */}
                        <textarea
                            ref={textareaRef}
                            value={htmlBody}
                            onChange={(e) => onHtmlChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 w-full p-4 bg-transparent text-gray-800 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-gray-300"
                            placeholder={`Start typing your email HTML...

Press Enter for line break
Press Shift+Enter for new paragraph`}
                        />
                    </div>
                )}

                {/* ── PREVIEW MODE ── */}
                {activeView === "preview" && (
                    <div className="h-full flex flex-col bg-white">
                        {/* Gmail Header */}
                        <div className="px-4 py-3 border-b border-gray-200">
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                                {subject || "No subject"}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px]">Inbox</span>
                            </div>
                        </div>

                        {/* Sender Info */}
                        <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-200">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                Y
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-gray-900">Your Name</span>
                                    <span className="text-gray-400 text-xs">&lt;you@example.com&gt;</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    to <span className="text-gray-600">John Doe</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">
                                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>

                        {/* Email Body Preview */}
                        <div className="flex-1 overflow-auto">
                            <iframe
                                srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;background:#ffffff;color:#111;}a{color:#4f46e5;}</style></head><body style="padding:0;margin:0;font-family:Arial,Helvetica,sans-serif;background:#ffffff;">${getPreviewHtml()}</body></html>`}
                                className="w-full h-full border-none"
                                style={{ minHeight: 200, background: "#ffffff" }}
                                title="Email Preview"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
