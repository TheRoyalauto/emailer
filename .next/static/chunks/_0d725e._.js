(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/_0d725e._.js", {

"[project]/convex/_generated/api.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: require } = __turbopack_context__;
{
/* eslint-disable */ /**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */ __turbopack_esm__({
    "api": (()=>api),
    "components": (()=>components),
    "internal": (()=>internal)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/server/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/server/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$components$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/server/components/index.js [app-client] (ecmascript) <locals>");
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["anyApi"];
const internal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["anyApi"];
const components = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$server$2f$components$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["componentsGeneric"])();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/EmailEditor.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>EmailEditor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
const VARIABLES = [
    {
        key: "{{firstName}}",
        label: "First Name"
    },
    {
        key: "{{lastName}}",
        label: "Last Name"
    },
    {
        key: "{{email}}",
        label: "Email"
    },
    {
        key: "{{unsubscribeUrl}}",
        label: "Unsubscribe Link"
    }
];
const HTML_SNIPPETS = [
    {
        id: "cta",
        icon: "🔘",
        name: "CTA Button",
        html: `<p style="margin:0 0 16px 0;"><a href="https://example.com" style="display:inline-block;padding:14px 28px;background:#8b5cf6;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">Get Started Now</a></p>`
    },
    {
        id: "divider",
        icon: "➖",
        name: "Divider",
        html: `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e5;" />`
    },
    {
        id: "bullets",
        icon: "📋",
        name: "Bullet List",
        html: `<ul style="margin:0 0 16px 20px;padding:0;">
    <li style="margin:0 0 8px 0;">First benefit or point</li>
    <li style="margin:0 0 8px 0;">Second benefit or point</li>
    <li style="margin:0 0 8px 0;">Third benefit or point</li>
</ul>`
    },
    {
        id: "callout",
        icon: "💡",
        name: "Callout Box",
        html: `<div style="margin:0 0 16px 0;padding:16px 20px;background:#f3f4f6;border-left:4px solid #8b5cf6;border-radius:4px;">
    <strong style="display:block;margin-bottom:4px;">Pro Tip:</strong>
    <span style="color:#555;">Your helpful tip or important note goes here.</span>
</div>`
    },
    {
        id: "signature",
        icon: "✍️",
        name: "Signature",
        html: `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e5e5;">
    <p style="margin:0 0 4px 0;font-weight:600;">Your Name</p>
    <p style="margin:0;color:#666;font-size:14px;">Your Title | Your Company</p>
</div>`
    },
    {
        id: "social",
        icon: "🔗",
        name: "Social Links",
        html: `<p style="margin:16px 0 0 0;font-size:14px;color:#666;">
    Follow us:
    <a href="#" style="color:#0066cc;text-decoration:none;margin-left:8px;">Twitter</a> ·
    <a href="#" style="color:#0066cc;text-decoration:none;margin-left:4px;">LinkedIn</a> ·
    <a href="#" style="color:#0066cc;text-decoration:none;margin-left:4px;">Website</a>
</p>`
    }
];
const STARTER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#111111;">
        <p style="margin:0 0 16px 0;">Hi {{firstName}},</p>
        <p style="margin:0 0 16px 0;">Your message here...</p>
        <p style="margin:0;">Best regards</p>
    </div>
</body>
</html>`;
function EmailEditor({ htmlBody, onHtmlChange, subject }) {
    _s();
    const [previewMode, setPreviewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desktop");
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("html");
    const [showVariables, setShowVariables] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const textareaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Close dropdowns when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EmailEditor.useEffect": ()=>{
            const handleClick = {
                "EmailEditor.useEffect.handleClick": ()=>{
                    setShowVariables(false);
                }
            }["EmailEditor.useEffect.handleClick"];
            document.addEventListener("click", handleClick);
            return ({
                "EmailEditor.useEffect": ()=>document.removeEventListener("click", handleClick)
            })["EmailEditor.useEffect"];
        }
    }["EmailEditor.useEffect"], []);
    // Insert text at cursor position
    const insertAtCursor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EmailEditor.useCallback[insertAtCursor]": (text)=>{
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = htmlBody.substring(0, start) + text + htmlBody.substring(end);
            onHtmlChange(newValue);
            setTimeout({
                "EmailEditor.useCallback[insertAtCursor]": ()=>{
                    textarea.selectionStart = textarea.selectionEnd = start + text.length;
                    textarea.focus();
                }
            }["EmailEditor.useCallback[insertAtCursor]"], 0);
        }
    }["EmailEditor.useCallback[insertAtCursor]"], [
        htmlBody,
        onHtmlChange
    ]);
    // Wrap selection with tags
    const wrapSelection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "EmailEditor.useCallback[wrapSelection]": (before, after)=>{
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = htmlBody.substring(start, end);
            const newValue = htmlBody.substring(0, start) + before + selectedText + after + htmlBody.substring(end);
            onHtmlChange(newValue);
            setTimeout({
                "EmailEditor.useCallback[wrapSelection]": ()=>{
                    textarea.selectionStart = start + before.length;
                    textarea.selectionEnd = start + before.length + selectedText.length;
                    textarea.focus();
                }
            }["EmailEditor.useCallback[wrapSelection]"], 0);
        }
    }["EmailEditor.useCallback[wrapSelection]"], [
        htmlBody,
        onHtmlChange
    ]);
    const formatBold = ()=>wrapSelection("<b>", "</b>");
    const formatItalic = ()=>wrapSelection("<i>", "</i>");
    const formatUnderline = ()=>wrapSelection("<u>", "</u>");
    const formatLink = ()=>{
        const url = prompt("Enter URL:");
        if (url) wrapSelection(`<a href="${url}" style="color:#0066cc;text-decoration:underline;">`, "</a>");
    };
    const formatParagraph = ()=>insertAtCursor('\n<p style="margin:0 0 16px 0;">New paragraph</p>');
    const formatList = ()=>insertAtCursor('\n<ul style="margin:0 0 16px 20px;padding:0;">\n    <li style="margin:0 0 6px 0;">Item 1</li>\n    <li style="margin:0 0 6px 0;">Item 2</li>\n</ul>');
    const formatButton = ()=>{
        const url = prompt("Button URL:", "https://");
        const text = prompt("Button text:", "Click Here");
        if (url && text) {
            insertAtCursor(`\n<p style="margin:0 0 16px 0;"><a href="${url}" style="display:inline-block;padding:12px 24px;background:#0066cc;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">${text}</a></p>`);
        }
    };
    // Handle Enter key to insert HTML line breaks
    const handleKeyDown = (e)=>{
        if (e.key === "Enter") {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            // Shift+Enter = new paragraph, Enter = line break
            const insertHtml = e.shiftKey ? '\n<p style="margin:0 0 16px 0;"></p>' : '<br>\n';
            const newValue = htmlBody.substring(0, start) + insertHtml + htmlBody.substring(end);
            onHtmlChange(newValue);
            setTimeout(()=>{
                const newPos = start + insertHtml.length;
                textarea.selectionStart = textarea.selectionEnd = newPos;
                textarea.focus();
            }, 0);
        }
    };
    const loadStarterTemplate = ()=>{
        onHtmlChange(STARTER_TEMPLATE);
    };
    const insertSnippet = (html)=>{
        const textarea = textareaRef.current;
        if (!textarea) {
            // If no textarea, append to existing or set as new content
            onHtmlChange(htmlBody + "\n" + html);
            return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = htmlBody.substring(0, start) + html + htmlBody.substring(end);
        onHtmlChange(newValue);
        setTimeout(()=>{
            textarea.selectionStart = textarea.selectionEnd = start + html.length;
            textarea.focus();
        }, 0);
    };
    // Preview with interpolated variables (sample data)
    const getPreviewHtml = ()=>{
        if (!htmlBody.trim()) {
            return `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:Arial,sans-serif;color:#888;padding:40px;text-align:center;">
                    <div>
                        <div style="font-size:48px;margin-bottom:16px;">📧</div>
                        <div style="font-size:14px;">Start typing or select a template<br/>to see your email preview here</div>
                    </div>
                </div>
            `;
        }
        return htmlBody.replace(/\{\{firstName\}\}/g, "John").replace(/\{\{lastName\}\}/g, "Doe").replace(/\{\{email\}\}/g, "john@example.com").replace(/\{\{unsubscribeUrl\}\}/g, "#unsubscribe");
    };
    const isEmpty = !htmlBody.trim();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            gap: 16,
            height: "100%"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            gap: 6,
                            padding: "10px 12px",
                            background: "var(--bg-tertiary)",
                            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                            border: "1px solid var(--border-subtle)",
                            borderBottom: "none",
                            flexWrap: "wrap",
                            alignItems: "center"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 2,
                                    padding: 2,
                                    background: "var(--bg-primary)",
                                    borderRadius: 6,
                                    marginRight: 8
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${activeTab === "html" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setActiveTab("html"),
                                        style: {
                                            fontSize: 12,
                                            padding: "5px 12px",
                                            borderRadius: 4
                                        },
                                        children: "HTML"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 248,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${activeTab === "visual" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setActiveTab("visual"),
                                        style: {
                                            fontSize: 12,
                                            padding: "5px 12px",
                                            borderRadius: 4
                                        },
                                        children: "Visual"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 255,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 240,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 1,
                                    height: 20,
                                    background: "var(--border-subtle)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 264,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatBold,
                                title: "Bold",
                                style: {
                                    padding: "6px 10px",
                                    fontWeight: 700
                                },
                                children: "B"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 267,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatItalic,
                                title: "Italic",
                                style: {
                                    padding: "6px 10px",
                                    fontStyle: "italic"
                                },
                                children: "I"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 270,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatUnderline,
                                title: "Underline",
                                style: {
                                    padding: "6px 10px",
                                    textDecoration: "underline"
                                },
                                children: "U"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 273,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatLink,
                                title: "Insert Link",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "🔗"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 276,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatParagraph,
                                title: "Add Paragraph",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "¶"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 279,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatList,
                                title: "Add List",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "•••"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 282,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                onClick: formatButton,
                                title: "Add CTA Button",
                                style: {
                                    padding: "6px 10px"
                                },
                                children: "🔘"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 285,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 1,
                                    height: 20,
                                    background: "var(--border-subtle)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 289,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: "relative"
                                },
                                onClick: (e)=>e.stopPropagation(),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "btn btn-ghost btn-sm",
                                        onClick: ()=>setShowVariables(!showVariables),
                                        style: {
                                            padding: "6px 10px",
                                            fontSize: 12
                                        },
                                        children: [
                                            `{{x}}`,
                                            " ▾"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 293,
                                        columnNumber: 25
                                    }, this),
                                    showVariables && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: "absolute",
                                            top: "calc(100% + 4px)",
                                            left: 0,
                                            background: "var(--bg-secondary)",
                                            border: "1px solid var(--border-subtle)",
                                            borderRadius: 8,
                                            padding: 6,
                                            zIndex: 100,
                                            minWidth: 160,
                                            boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: 11,
                                                    color: "var(--text-muted)",
                                                    padding: "4px 8px",
                                                    marginBottom: 4
                                                },
                                                children: "Insert Variable"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 315,
                                                columnNumber: 33
                                            }, this),
                                            VARIABLES.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn btn-ghost btn-sm",
                                                    style: {
                                                        width: "100%",
                                                        justifyContent: "flex-start",
                                                        fontSize: 12,
                                                        padding: "6px 8px"
                                                    },
                                                    onClick: ()=>{
                                                        insertAtCursor(v.key);
                                                        setShowVariables(false);
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                            style: {
                                                                marginRight: 8,
                                                                opacity: 0.6
                                                            },
                                                            children: v.key
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EmailEditor.tsx",
                                                            lineNumber: 328,
                                                            columnNumber: 41
                                                        }, this),
                                                        v.label
                                                    ]
                                                }, v.key, true, {
                                                    fileName: "[project]/src/components/EmailEditor.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 37
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 301,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 292,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 226,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                            padding: 16,
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            overflow: "hidden"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    color: "var(--text-muted)"
                                                },
                                                children: "Insert Components"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 354,
                                                columnNumber: 29
                                            }, this),
                                            isEmpty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: loadStarterTemplate,
                                                className: "btn btn-ghost btn-sm",
                                                style: {
                                                    padding: "4px 10px",
                                                    fontSize: 11
                                                },
                                                children: "📄 Load Base Template"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 356,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 353,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(6, 1fr)",
                                            gap: 6
                                        },
                                        children: HTML_SNIPPETS.map((snippet)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>insertSnippet(snippet.html),
                                                style: {
                                                    padding: "8px",
                                                    background: "var(--bg-secondary)",
                                                    border: "1px solid var(--border-subtle)",
                                                    borderRadius: 6,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    cursor: "pointer",
                                                    transition: "all 0.15s ease",
                                                    fontSize: 10,
                                                    color: "var(--text-secondary)"
                                                },
                                                onMouseOver: (e)=>{
                                                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                                                    e.currentTarget.style.background = "var(--bg-tertiary)";
                                                    e.currentTarget.style.color = "var(--text-primary)";
                                                },
                                                onMouseOut: (e)=>{
                                                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                                                    e.currentTarget.style.background = "var(--bg-secondary)";
                                                    e.currentTarget.style.color = "var(--text-secondary)";
                                                },
                                                title: snippet.name,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: 18
                                                        },
                                                        children: snippet.icon
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                                        lineNumber: 396,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: 500
                                                        },
                                                        children: snippet.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                                        lineNumber: 397,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, snippet.id, true, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 367,
                                                columnNumber: 33
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 365,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 352,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                ref: textareaRef,
                                className: "form-textarea",
                                value: htmlBody,
                                onChange: (e)=>onHtmlChange(e.target.value),
                                onKeyDown: handleKeyDown,
                                style: {
                                    flex: 1,
                                    fontFamily: "monospace",
                                    fontSize: 13,
                                    lineHeight: 1.6,
                                    resize: "none",
                                    minHeight: 200
                                },
                                placeholder: "Start typing your email content...      Press Enter for line break (<br>)   Press Shift+Enter for new paragraph (<p>)"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 404,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 338,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EmailEditor.tsx",
                lineNumber: 224,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: previewMode === "mobile" ? 488 : 585,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                    overflow: "hidden"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: "var(--bg-tertiary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--text-secondary)"
                                },
                                children: "Gmail Preview"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 448,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    gap: 2,
                                    padding: 2,
                                    background: "var(--bg-primary)",
                                    borderRadius: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${previewMode === "desktop" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setPreviewMode("desktop"),
                                        style: {
                                            fontSize: 10,
                                            padding: "3px 8px",
                                            borderRadius: 4
                                        },
                                        children: "🖥️"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 456,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `btn btn-sm ${previewMode === "mobile" ? "btn-primary" : "btn-ghost"}`,
                                        onClick: ()=>setPreviewMode("mobile"),
                                        style: {
                                            fontSize: 10,
                                            padding: "3px 8px",
                                            borderRadius: 4
                                        },
                                        children: "📱"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 463,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 449,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 438,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "8px 16px",
                            background: "var(--bg-tertiary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 14
                                },
                                children: "←"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 482,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 12
                                },
                                children: "🗑️"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 483,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 12
                                },
                                children: "📁"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 484,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    cursor: "pointer",
                                    opacity: 0.5,
                                    fontSize: 12
                                },
                                children: "⚠️"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 485,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 486,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: 11,
                                    color: "var(--text-muted)"
                                },
                                children: "1 of 1"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 487,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 474,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "14px 16px 10px",
                            background: "var(--bg-primary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    margin: 0,
                                    fontSize: 18,
                                    fontWeight: 500,
                                    color: "var(--text-primary)"
                                },
                                children: subject || "No subject"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 496,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 6,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        display: "inline-block",
                                        padding: "2px 8px",
                                        background: "rgba(139, 92, 246, 0.15)",
                                        color: "var(--accent-primary)",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 500
                                    },
                                    children: "Inbox"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EmailEditor.tsx",
                                    lineNumber: 510,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 504,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 491,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "14px 16px",
                            background: "var(--bg-primary)",
                            borderBottom: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, var(--accent-primary) 0%, #a855f7 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#ffffff",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    flexShrink: 0
                                },
                                children: "Y"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 532,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    minWidth: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            marginBottom: 2,
                                            flexWrap: "wrap"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: "var(--text-primary)"
                                                },
                                                children: "Your Name"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 551,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 11,
                                                    color: "var(--text-muted)"
                                                },
                                                children: "<you@example.com>"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 554,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 550,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 11,
                                            color: "var(--text-muted)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 4
                                        },
                                        children: [
                                            "to ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 500,
                                                    color: "var(--text-secondary)"
                                                },
                                                children: "John Doe"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 559,
                                                columnNumber: 32
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: 9,
                                                    opacity: 0.5
                                                },
                                                children: "▾"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EmailEditor.tsx",
                                                lineNumber: 560,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 558,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 549,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    flexShrink: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 11,
                                            color: "var(--text-muted)"
                                        },
                                        children: new Date().toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric"
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 566,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            cursor: "pointer",
                                            opacity: 0.4,
                                            fontSize: 12
                                        },
                                        children: "⭐"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 569,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            cursor: "pointer",
                                            opacity: 0.4,
                                            fontSize: 12
                                        },
                                        children: "↩️"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 570,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            cursor: "pointer",
                                            opacity: 0.4
                                        },
                                        children: "⋮"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EmailEditor.tsx",
                                        lineNumber: 571,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 565,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 523,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            background: "var(--bg-primary)",
                            overflow: "auto",
                            minHeight: 220
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                            srcDoc: `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;min-height:100%;background:#1a1a2e;color:#ffffff;}a{color:#a78bfa;}p,div,span,li,td,th,h1,h2,h3,h4,h5,h6{color:#ffffff !important;}</style></head><body style="padding:16px;font-family:Arial,Helvetica,sans-serif;background:#1a1a2e;color:#ffffff;">${getPreviewHtml()}</body></html>`,
                            style: {
                                width: "100%",
                                height: "100%",
                                border: "none",
                                display: "block",
                                minHeight: 220,
                                background: "#1a1a2e"
                            },
                            title: "Email Preview",
                            sandbox: "allow-same-origin"
                        }, void 0, false, {
                            fileName: "[project]/src/components/EmailEditor.tsx",
                            lineNumber: 584,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 576,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: "10px 16px",
                            background: "var(--bg-secondary)",
                            borderTop: "1px solid var(--border-subtle)",
                            display: "flex",
                            gap: 8
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    padding: "8px 14px",
                                    background: "var(--bg-tertiary)",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: 20,
                                    color: "var(--text-muted)",
                                    fontSize: 13,
                                    cursor: "text"
                                },
                                children: "Click here to Reply"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 607,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn btn-ghost btn-sm",
                                style: {
                                    borderRadius: 20,
                                    padding: "8px 14px",
                                    fontSize: 12
                                },
                                children: "Forward"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EmailEditor.tsx",
                                lineNumber: 619,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/EmailEditor.tsx",
                        lineNumber: 600,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/EmailEditor.tsx",
                lineNumber: 427,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/EmailEditor.tsx",
        lineNumber: 222,
        columnNumber: 9
    }, this);
}
_s(EmailEditor, "eGPeJL1txTmk+tcswPovy6DICwU=");
_c = EmailEditor;
var _c;
__turbopack_refresh__.register(_c, "EmailEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/AuthGuard.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "AppHeader": (()=>AppHeader),
    "AuthGuard": (()=>AuthGuard)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/react/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$convex$2d$dev$2f$auth$2f$dist$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/@convex-dev/auth/dist/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$ConvexAuthState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/react/ConvexAuthState.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature(), _s1 = __turbopack_refresh__.signature();
"use client";
;
;
;
;
;
function AuthGuard({ children }) {
    _s();
    const { isAuthenticated, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$ConvexAuthState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConvexAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthGuard.useEffect": ()=>{
            if (!isLoading && !isAuthenticated) {
                router.push("/login");
            }
        }
    }["AuthGuard.useEffect"], [
        isAuthenticated,
        isLoading,
        router
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
                    }, void 0, false, {
                        fileName: "[project]/src/components/AuthGuard.tsx",
                        lineNumber: 28,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-white/50",
                        children: "Loading..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/AuthGuard.tsx",
                        lineNumber: 29,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AuthGuard.tsx",
                lineNumber: 27,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/AuthGuard.tsx",
            lineNumber: 26,
            columnNumber: 13
        }, this);
    }
    if (!isAuthenticated) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(AuthGuard, "1Z6B9fdG6j6n3ru6AMA11sBFPuc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$ConvexAuthState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useConvexAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AuthGuard;
// Navigation items - consolidated to core hubs
const NAV_ITEMS = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: "🏠",
        mobileIcon: "🏠"
    },
    {
        href: "/campaigns",
        label: "Campaigns",
        icon: "📧",
        mobileIcon: "📧"
    },
    {
        href: "/contacts",
        label: "Contacts",
        icon: "👥",
        mobileIcon: "👥"
    },
    {
        href: "/pipeline",
        label: "Pipeline",
        icon: "📊",
        mobileIcon: "📊"
    },
    {
        href: "/sequences",
        label: "Sequences",
        icon: "🔄",
        mobileIcon: "🔄"
    },
    {
        href: "/insights",
        label: "Insights",
        icon: "📈",
        mobileIcon: "📈"
    },
    {
        href: "/settings",
        label: "Settings",
        icon: "⚙️",
        mobileIcon: "⚙️"
    }
];
// Mobile bottom nav items (first 5)
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5);
function AppHeader() {
    _s1();
    const { signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$convex$2d$dev$2f$auth$2f$dist$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthActions"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const [showMobileMenu, setShowMobileMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleSignOut = async ()=>{
        await signOut();
    };
    const isActive = (href)=>{
        if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
        return pathname.startsWith(href);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-white/10 bg-[#0a0a0f]/95 sticky top-0 z-50 backdrop-blur-lg hidden md:block",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-6 py-3 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/dashboard",
                                    className: "text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity",
                                    children: "Emailer"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                    lineNumber: 78,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                    className: "flex items-center gap-1",
                                    children: NAV_ITEMS.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: item.href,
                                            className: `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isActive(item.href) ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm",
                                                    children: item.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                                    lineNumber: 96,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "hidden lg:inline",
                                                    children: item.label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                                    lineNumber: 97,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, item.href, true, {
                                            fileName: "[project]/src/components/AuthGuard.tsx",
                                            lineNumber: 88,
                                            columnNumber: 33
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                    lineNumber: 86,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/AuthGuard.tsx",
                            lineNumber: 76,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSignOut,
                            className: "px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
                            children: "Sign Out"
                        }, void 0, false, {
                            fileName: "[project]/src/components/AuthGuard.tsx",
                            lineNumber: 103,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/AuthGuard.tsx",
                    lineNumber: 75,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/AuthGuard.tsx",
                lineNumber: 74,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b border-white/10 bg-[#0a0a0f]/95 sticky top-0 z-50 backdrop-blur-lg md:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/dashboard",
                                className: "text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",
                                children: "Emailer"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AuthGuard.tsx",
                                lineNumber: 115,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowMobileMenu(!showMobileMenu),
                                    className: "p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
                                    children: showMobileMenu ? "✕" : "☰"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                    lineNumber: 124,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/AuthGuard.tsx",
                                lineNumber: 122,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AuthGuard.tsx",
                        lineNumber: 114,
                        columnNumber: 17
                    }, this),
                    showMobileMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-full left-0 right-0 bg-[#12121f] border-b border-white/10 p-4 space-y-2",
                        children: [
                            NAV_ITEMS.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: item.href,
                                    onClick: ()=>setShowMobileMenu(false),
                                    className: `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href) ? "bg-indigo-500/20 text-indigo-400" : "text-white/60 hover:bg-white/5 hover:text-white"}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xl",
                                            children: item.icon
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthGuard.tsx",
                                            lineNumber: 146,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: item.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/AuthGuard.tsx",
                                            lineNumber: 147,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, item.href, true, {
                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                    lineNumber: 137,
                                    columnNumber: 29
                                }, this)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                className: "border-white/10 my-3"
                            }, void 0, false, {
                                fileName: "[project]/src/components/AuthGuard.tsx",
                                lineNumber: 150,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleSignOut,
                                className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xl",
                                        children: "🚪"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AuthGuard.tsx",
                                        lineNumber: 155,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: "Sign Out"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/AuthGuard.tsx",
                                        lineNumber: 156,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/AuthGuard.tsx",
                                lineNumber: 151,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/AuthGuard.tsx",
                        lineNumber: 135,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/AuthGuard.tsx",
                lineNumber: 113,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/98 backdrop-blur-lg border-t border-white/10 z-50 md:hidden pb-safe",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-around py-2 px-1",
                    children: MOBILE_NAV_ITEMS.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: item.href,
                            className: `flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all min-w-[56px] ${isActive(item.href) ? "text-indigo-400 bg-indigo-500/10" : "text-white/40"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-lg",
                                    children: item.mobileIcon
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                    lineNumber: 174,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-[10px] font-medium",
                                    children: item.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/AuthGuard.tsx",
                                    lineNumber: 175,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, item.href, true, {
                            fileName: "[project]/src/components/AuthGuard.tsx",
                            lineNumber: 166,
                            columnNumber: 25
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/components/AuthGuard.tsx",
                    lineNumber: 164,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/AuthGuard.tsx",
                lineNumber: 163,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s1(AppHeader, "CatzQaZYSSYWXWWC1tcCtZ6c7bQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$convex$2d$dev$2f$auth$2f$dist$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthActions"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c1 = AppHeader;
var _c, _c1;
__turbopack_refresh__.register(_c, "AuthGuard");
__turbopack_refresh__.register(_c1, "AppHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/templates/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: require } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>TemplatesPageWrapper)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/react/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/convex/_generated/api.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EmailEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/components/EmailEditor.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AuthGuard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/src/components/AuthGuard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/convex/dist/esm/react/client.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
;
;
;
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
</div>`
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
</table>`
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
</table>`
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
</table>`
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
</div>`
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
</div>`
    },
    {
        id: "countdown",
        name: "Urgency Banner",
        preview: "⏰",
        category: "Urgency",
        html: `<div style="background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);padding:20px;border-radius:8px;text-align:center;margin:24px 0;">
  <p style="margin:0 0 8px 0;color:#fff;font-size:18px;font-weight:600;">🔥 Limited Time Offer - Ends Soon!</p>
  <p style="margin:0;color:rgba(255,255,255,0.9);font-size:14px;">Use code <strong>SAVE20</strong> for 20% off your first month</p>
</div>`
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
</table>`
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
</table>`
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
</div>`
    }
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
    _s();
    const templates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])(__TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].campaigns.list);
    const createTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])(__TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].campaigns.create);
    const updateTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])(__TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].campaigns.update);
    const deleteTemplate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])(__TURBOPACK__imported__module__$5b$project$5d2f$convex$2f$_generated$2f$api$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].campaigns.remove);
    // Editor state
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [templateName, setTemplateName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [subject, setSubject] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [htmlContent, setHtmlContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(STARTER_HTML);
    const [showDesigns, setShowDesigns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [designCategory, setDesignCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("All");
    const categories = [
        "All",
        ...new Set(PREMIUM_DESIGNS.map((d)=>d.category))
    ];
    const filteredDesigns = designCategory === "All" ? PREMIUM_DESIGNS : PREMIUM_DESIGNS.filter((d)=>d.category === designCategory);
    const handleStartNew = ()=>{
        setIsEditing(true);
        setEditingId(null);
        setTemplateName("");
        setSubject("");
        setHtmlContent("");
    };
    const handleEdit = (template)=>{
        setIsEditing(true);
        setEditingId(template._id);
        setTemplateName(template.name);
        setSubject(template.subject);
        setHtmlContent(template.htmlContent);
    };
    const handleSave = async ()=>{
        if (!templateName.trim() || !subject.trim()) return;
        if (editingId) {
            await updateTemplate({
                id: editingId,
                name: templateName,
                subject,
                htmlContent
            });
        } else {
            await createTemplate({
                name: templateName,
                subject,
                htmlContent
            });
        }
        setIsEditing(false);
        setEditingId(null);
    };
    const handleCancel = ()=>{
        setIsEditing(false);
        setEditingId(null);
    };
    const insertDesign = (html)=>{
        // Find insertion point (before closing div/body)
        const insertPoint = htmlContent.lastIndexOf("</div>");
        if (insertPoint > 0) {
            const newHtml = htmlContent.slice(0, insertPoint) + "\n" + html + "\n" + htmlContent.slice(insertPoint);
            setHtmlContent(newHtml);
        } else {
            setHtmlContent(htmlContent + "\n" + html);
        }
    };
    const statusColors = {
        draft: "bg-zinc-600",
        scheduled: "bg-amber-600",
        sending: "bg-blue-600 animate-pulse",
        sent: "bg-green-600",
        paused: "bg-orange-600"
    };
    // Full-screen editor mode
    if (isEditing) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 bg-[#0a0a0f] z-50 flex flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "flex-shrink-0 border-b border-white/10 bg-black/60 backdrop-blur-sm",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-3 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleCancel,
                                        className: "p-2 hover:bg-white/10 rounded-lg transition-colors",
                                        children: "← Back"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 261,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-6 w-px bg-white/20"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 267,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-lg font-semibold",
                                        children: editingId ? "Edit Template" : "Create Template"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 268,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 260,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowDesigns(!showDesigns),
                                        className: `px-4 py-2 rounded-lg font-medium transition-all ${showDesigns ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50" : "bg-white/10 hover:bg-white/20"}`,
                                        children: "✨ Design Library"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 273,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleSave,
                                        disabled: !templateName.trim() || !subject.trim(),
                                        className: "px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
                                        children: editingId ? "Save Changes" : "Create Template"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 282,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 272,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/templates/page.tsx",
                        lineNumber: 259,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/templates/page.tsx",
                    lineNumber: 258,
                    columnNumber: 17
                }, this),
                showDesigns && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-shrink-0 border-b border-white/10 bg-[#12121f] p-4 max-h-40 overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4 mb-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm font-medium text-white/60",
                                    children: "Quick Insert:"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/templates/page.tsx",
                                    lineNumber: 297,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-2 flex-wrap",
                                    children: categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setDesignCategory(cat),
                                            className: `px-3 py-1 rounded-lg text-xs transition-all ${designCategory === cat ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50" : "bg-white/5 hover:bg-white/10 text-white/60"}`,
                                            children: cat
                                        }, cat, false, {
                                            fileName: "[project]/src/app/templates/page.tsx",
                                            lineNumber: 300,
                                            columnNumber: 37
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/templates/page.tsx",
                                    lineNumber: 298,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/templates/page.tsx",
                            lineNumber: 296,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 overflow-x-auto pb-1",
                            children: filteredDesigns.map((design)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>insertDesign(design.html),
                                    className: "flex-shrink-0 w-24 p-2 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all group text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-lg block mb-1",
                                            children: design.preview
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/templates/page.tsx",
                                            lineNumber: 320,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-medium text-white/80 group-hover:text-white transition-colors line-clamp-1",
                                            children: design.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/templates/page.tsx",
                                            lineNumber: 321,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, design.id, true, {
                                    fileName: "[project]/src/app/templates/page.tsx",
                                    lineNumber: 315,
                                    columnNumber: 33
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/templates/page.tsx",
                            lineNumber: 313,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/templates/page.tsx",
                    lineNumber: 295,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex min-h-0",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col min-w-0 border-r border-white/10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 p-4 border-b border-white/10 bg-[#0d0d15]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs font-medium text-white/50 mb-2",
                                                    children: "Template Name"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 338,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: templateName,
                                                    onChange: (e)=>setTemplateName(e.target.value),
                                                    placeholder: "e.g., Welcome Email",
                                                    className: "w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/templates/page.tsx",
                                            lineNumber: 337,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs font-medium text-white/50 mb-2",
                                                    children: "Email Subject"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 348,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: subject,
                                                    onChange: (e)=>setSubject(e.target.value),
                                                    placeholder: "e.g., Welcome, {{firstName}}!",
                                                    className: "w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 349,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/templates/page.tsx",
                                            lineNumber: 347,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/templates/page.tsx",
                                    lineNumber: 336,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 335,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-h-0 p-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$EmailEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    htmlBody: htmlContent,
                                    onHtmlChange: setHtmlContent,
                                    subject: subject
                                }, void 0, false, {
                                    fileName: "[project]/src/app/templates/page.tsx",
                                    lineNumber: 362,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 361,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/templates/page.tsx",
                        lineNumber: 333,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/templates/page.tsx",
                    lineNumber: 331,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/templates/page.tsx",
            lineNumber: 256,
            columnNumber: 13
        }, this);
    }
    // Template List View
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#0a0a0f] text-white pb-20 md:pb-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AuthGuard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppHeader"], {}, void 0, false, {
                fileName: "[project]/src/app/templates/page.tsx",
                lineNumber: 377,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent",
                                        children: "Email Templates"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 382,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-white/50 mt-1",
                                        children: "Create and manage your email templates"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 385,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 381,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleStartNew,
                                className: "px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-lg",
                                        children: "+"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/templates/page.tsx",
                                        lineNumber: 391,
                                        columnNumber: 25
                                    }, this),
                                    " New Template"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 387,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/templates/page.tsx",
                        lineNumber: 380,
                        columnNumber: 17
                    }, this),
                    templates === undefined ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-center py-20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
                        }, void 0, false, {
                            fileName: "[project]/src/app/templates/page.tsx",
                            lineNumber: 397,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/templates/page.tsx",
                        lineNumber: 396,
                        columnNumber: 21
                    }, this) : templates.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-4xl",
                                    children: "📝"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/templates/page.tsx",
                                    lineNumber: 402,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 401,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-semibold mb-2",
                                children: "No templates yet"
                            }, void 0, false, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 404,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-white/50 mb-6 max-w-md mx-auto",
                                children: "Create your first email template to use in campaigns."
                            }, void 0, false, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 405,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleStartNew,
                                className: "px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity",
                                children: "Create Your First Template"
                            }, void 0, false, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 408,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/templates/page.tsx",
                        lineNumber: 400,
                        columnNumber: 21
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-4",
                        children: templates.map((template)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all group cursor-pointer",
                                onClick: ()=>handleEdit(template),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3 mb-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "text-lg font-semibold group-hover:text-indigo-300 transition-colors truncate",
                                                            children: template.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/templates/page.tsx",
                                                            lineNumber: 426,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[template.status]}`,
                                                            children: template.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/templates/page.tsx",
                                                            lineNumber: 429,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 425,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-white/50 text-sm truncate",
                                                    children: template.subject
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 433,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/templates/page.tsx",
                                            lineNumber: 424,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2 ml-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        handleEdit(template);
                                                    },
                                                    className: "px-3 py-1.5 text-sm bg-white/10 rounded-lg hover:bg-white/20 transition-colors",
                                                    children: "Edit"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 436,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        deleteTemplate({
                                                            id: template._id
                                                        });
                                                    },
                                                    className: "px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors",
                                                    children: "Delete"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/templates/page.tsx",
                                                    lineNumber: 445,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/templates/page.tsx",
                                            lineNumber: 435,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/templates/page.tsx",
                                    lineNumber: 423,
                                    columnNumber: 33
                                }, this)
                            }, template._id, false, {
                                fileName: "[project]/src/app/templates/page.tsx",
                                lineNumber: 418,
                                columnNumber: 29
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/templates/page.tsx",
                        lineNumber: 416,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/templates/page.tsx",
                lineNumber: 379,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/templates/page.tsx",
        lineNumber: 376,
        columnNumber: 9
    }, this);
}
_s(TemplatesPage, "PjXQLXGAaCRTtQopaJlR4/rQII0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$convex$2f$dist$2f$esm$2f$react$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = TemplatesPage;
function TemplatesPageWrapper() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AuthGuard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthGuard"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TemplatesPage, {}, void 0, false, {
            fileName: "[project]/src/app/templates/page.tsx",
            lineNumber: 469,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/templates/page.tsx",
        lineNumber: 468,
        columnNumber: 9
    }, this);
}
_c1 = TemplatesPageWrapper;
var _c, _c1;
__turbopack_refresh__.register(_c, "TemplatesPage");
__turbopack_refresh__.register(_c1, "TemplatesPageWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/templates/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: require } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=_0d725e._.js.map