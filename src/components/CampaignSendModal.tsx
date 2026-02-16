"use client";

import { useState, useEffect } from "react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";
import { useAuthQuery, useAuthMutation } from "../hooks/useAuthConvex";

interface CampaignSendModalProps {
    onClose: () => void;
    template: {
        _id: Id<"templates">;
        name: string;
        subject: string;
        body: string;
    };
    sender: {
        _id: Id<"senders">;
        name: string;
        email: string;
    };
    contacts: Array<{
        _id: Id<"contacts">;
        email: string;
        name?: string;
        company?: string;
    }>;
}

interface SendResult {
    email: string;
    success: boolean;
    error?: string;
    contactId?: string;
}

function replaceVariables(text: string, contact: { name?: string; company?: string; email: string }) {
    return text
        .replace(/\{\{name\}\}/gi, contact.name || contact.email.split("@")[0])
        .replace(/\{\{first_name\}\}/gi, contact.name?.split(" ")[0] || contact.email.split("@")[0])
        .replace(/\{\{company\}\}/gi, contact.company || "your company")
        .replace(/\{\{email\}\}/gi, contact.email);
}

export default function CampaignSendModal({ onClose, template, sender, contacts }: CampaignSendModalProps) {
    const smtpConfigs = useAuthQuery(api.smtpConfigs.list);
    const defaultSmtp = useAuthQuery(api.smtpConfigs.getDefault);
    const markUsed = useAuthMutation(api.smtpConfigs.markUsed);

    const [selectedSmtpId, setSelectedSmtpId] = useState<string>("");
    const [useManual, setUseManual] = useState(false);

    const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
    const [smtpPort, setSmtpPort] = useState(587);
    const [smtpUser, setSmtpUser] = useState(sender.email);
    const [smtpPass, setSmtpPass] = useState("");

    const [step, setStep] = useState<"configure" | "sending" | "complete">("configure");
    const [delayMs, setDelayMs] = useState(1000);
    const [results, setResults] = useState<SendResult[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const logEmail = useAuthMutation(api.activities.logEmail);

    useEffect(() => {
        if (defaultSmtp && !selectedSmtpId) {
            setSelectedSmtpId(defaultSmtp._id);
        }
    }, [defaultSmtp, selectedSmtpId]);

    const selectedConfig = smtpConfigs?.find((c) => c._id === selectedSmtpId);

    const previewContact = contacts[0];
    const previewSubject = previewContact ? replaceVariables(template.subject, previewContact) : template.subject;
    const previewBody = previewContact ? replaceVariables(template.body, previewContact) : template.body;

    const canSend = useManual
        ? smtpHost && smtpUser && smtpPass
        : selectedConfig;

    const handleSend = async () => {
        if (!canSend) {
            setError("Please configure SMTP settings");
            return;
        }

        setStep("sending");
        setIsSending(true);
        setError(null);
        setResults([]);

        try {
            const emailsToSend = contacts.map(contact => ({
                to: contact.email,
                subject: replaceVariables(template.subject, contact),
                html: replaceVariables(template.body, contact),
                contactId: contact._id,
            }));

            let smtp;
            if (useManual) {
                smtp = {
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpPort === 465,
                    user: smtpUser,
                    pass: smtpPass,
                };
            } else if (selectedConfig) {
                smtp = {
                    host: selectedConfig.host,
                    port: selectedConfig.port,
                    secure: selectedConfig.secure,
                    user: selectedConfig.username,
                    pass: selectedConfig.password,
                };
                await markUsed({ id: selectedConfig._id });
            }

            const response = await fetch("/api/send-bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emails: emailsToSend,
                    from: {
                        name: selectedConfig?.fromName || sender.name,
                        email: selectedConfig?.fromEmail || sender.email,
                    },
                    smtp,
                    delayBetweenMs: delayMs,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send emails");
            }

            setResults(data.results);

            for (const result of data.results) {
                if (result.success && result.contactId) {
                    try {
                        await logEmail({
                            contactId: result.contactId as Id<"contacts">,
                            campaignId: undefined,
                        });
                    } catch {
                        // Non-critical
                    }
                }
            }

            setStep("complete");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send emails");
            setStep("configure");
        } finally {
            setIsSending(false);
        }
    };

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Input classes
    const inputCls = "w-full px-3.5 py-2.5 bg-[#f8fafc] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-xl text-sm text-[#0f172a] dark:text-white placeholder:text-[#9CA3AF] focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:outline-none transition-colors";
    const labelCls = "text-xs font-medium text-[#4B5563] dark:text-slate-400 mb-1.5 block";
    const sectionTitleCls = "text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-3";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E5E7EB] dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-[slideUp_0.25s_ease-out]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ──────────────────────────────────── */}
                <div className="px-6 py-5 border-b border-[#F1F3F8] dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9]/15 to-[#8B5CF6]/15 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Send Campaign</h2>
                            <p className="text-sm text-[#9CA3AF]">
                                {contacts.length} recipient{contacts.length !== 1 ? "s" : ""} · {template.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSending}
                        className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#0f172a] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-slate-800 transition-all disabled:opacity-30"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Content ─────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">

                    {/* ═══ Configure Step ═══ */}
                    {step === "configure" && (
                        <div className="divide-y divide-[#F1F3F8] dark:divide-slate-800">

                            {/* ── SMTP Configuration Section ── */}
                            <div className="px-6 py-5">
                                <div className={sectionTitleCls}>Email Configuration</div>

                                {smtpConfigs === undefined ? (
                                    <div className="flex items-center gap-2.5 text-sm text-[#9CA3AF] py-4">
                                        <div className="animate-spin w-4 h-4 border-2 border-[#E5E7EB] dark:border-slate-700 border-t-[#0EA5E9] rounded-full" />
                                        Loading saved configs...
                                    </div>
                                ) : smtpConfigs.length > 0 && !useManual ? (
                                    <div className="space-y-3">
                                        {/* Config selector */}
                                        <div className="relative">
                                            <select
                                                value={selectedSmtpId}
                                                onChange={(e) => setSelectedSmtpId(e.target.value)}
                                                className={inputCls + " appearance-none cursor-pointer pr-10"}
                                            >
                                                {smtpConfigs.map((config) => (
                                                    <option key={config._id} value={config._id}>
                                                        {config.name} ({config.fromEmail}){config.isDefault ? " ★" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {/* Ready badge */}
                                        {selectedConfig && (
                                            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Ready to send</div>
                                                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
                                                        From: {selectedConfig.fromName ? `${selectedConfig.fromName} <${selectedConfig.fromEmail}>` : selectedConfig.fromEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setUseManual(true)}
                                            className="text-xs text-[#9CA3AF] hover:text-[#0EA5E9] transition-colors"
                                        >
                                            Use different credentials instead →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {smtpConfigs.length === 0 && (
                                            <div className="flex items-center gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-amber-700 dark:text-amber-300">No saved SMTP configs</div>
                                                    <Link
                                                        href="/smtp-settings"
                                                        onClick={onClose}
                                                        className="text-xs text-[#0EA5E9] hover:underline"
                                                    >
                                                        Set up SMTP for one-click sending →
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelCls}>SMTP Host</label>
                                                <input
                                                    type="text"
                                                    value={smtpHost}
                                                    onChange={(e) => setSmtpHost(e.target.value)}
                                                    className={inputCls}
                                                    placeholder="smtp.gmail.com"
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Port</label>
                                                <input
                                                    type="number"
                                                    value={smtpPort}
                                                    onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                                                    className={inputCls}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelCls}>Username</label>
                                                <input
                                                    type="text"
                                                    value={smtpUser}
                                                    onChange={(e) => setSmtpUser(e.target.value)}
                                                    className={inputCls}
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Password</label>
                                                <input
                                                    type="password"
                                                    value={smtpPass}
                                                    onChange={(e) => setSmtpPass(e.target.value)}
                                                    className={inputCls}
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        {smtpConfigs.length > 0 && (
                                            <button
                                                onClick={() => setUseManual(false)}
                                                className="text-xs text-[#0EA5E9] hover:underline"
                                            >
                                                ← Use saved configuration
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── Sending Options Section ── */}
                            <div className="px-6 py-5">
                                <div className={sectionTitleCls}>Sending Options</div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 max-w-[200px]">
                                        <label className={labelCls}>Delay between emails</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={delayMs}
                                                onChange={(e) => setDelayMs(parseInt(e.target.value))}
                                                min={500}
                                                max={10000}
                                                step={500}
                                                className={inputCls + " pr-10"}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">ms</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-center gap-2 mt-5">
                                        <svg className="w-3.5 h-3.5 text-[#9CA3AF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-xs text-[#9CA3AF]">Higher delay reduces spam risk</span>
                                    </div>
                                </div>

                                {/* Delay presets */}
                                <div className="flex gap-2 mt-3">
                                    {[
                                        { label: "Fast", value: 500, desc: "0.5s" },
                                        { label: "Normal", value: 1000, desc: "1s" },
                                        { label: "Safe", value: 2000, desc: "2s" },
                                        { label: "Slow", value: 5000, desc: "5s" },
                                    ].map(preset => (
                                        <button
                                            key={preset.value}
                                            onClick={() => setDelayMs(preset.value)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${delayMs === preset.value
                                                    ? "bg-[#0EA5E9]/10 border-[#0EA5E9]/30 text-[#0EA5E9]"
                                                    : "bg-[#f8fafc] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 text-[#4B5563] dark:text-slate-400 hover:border-[#9CA3AF]"
                                                }`}
                                        >
                                            {preset.label} <span className="text-[10px] opacity-60">{preset.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Email Preview Section ── */}
                            <div className="px-6 py-5">
                                <div className={sectionTitleCls}>Email Preview</div>
                                <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 overflow-hidden">
                                    {/* Fake email header */}
                                    <div className="px-4 py-3 bg-[#f8fafc] dark:bg-slate-800/80 border-b border-[#E5E7EB] dark:border-slate-700 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-[#9CA3AF] w-8">To:</span>
                                            <span className="text-[#0f172a] dark:text-white font-medium">{previewContact?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-[#9CA3AF] w-8">Subj:</span>
                                            <span className="text-[#0f172a] dark:text-white font-medium">{previewSubject}</span>
                                        </div>
                                    </div>
                                    {/* Email body */}
                                    <div
                                        className="px-4 py-4 bg-white dark:bg-slate-900 text-sm text-[#4B5563] dark:text-slate-300 max-h-40 overflow-y-auto leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: previewBody }}
                                    />
                                </div>
                                {contacts.length > 1 && (
                                    <div className="text-xs text-[#9CA3AF] mt-2 flex items-center gap-1.5">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Preview shows first recipient. Variables are personalized per contact.
                                    </div>
                                )}
                            </div>

                            {/* ── Error ── */}
                            {error && (
                                <div className="px-6 py-4">
                                    <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl">
                                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ Sending Step ═══ */}
                    {step === "sending" && (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="relative mb-8">
                                <div className="w-16 h-16 border-[3px] border-[#E5E7EB] dark:border-slate-700 rounded-full" />
                                <div className="absolute inset-0 w-16 h-16 border-[3px] border-transparent border-t-[#0EA5E9] rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-2">Sending Emails...</h3>
                            <p className="text-sm text-[#9CA3AF] mb-6">
                                Do not close this window while sending is in progress
                            </p>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                                <div className="w-2 h-2 bg-[#0EA5E9] rounded-full animate-pulse" />
                                <span className="text-xs text-[#4B5563] dark:text-slate-400">
                                    Sending to {contacts.length} recipient{contacts.length !== 1 ? "s" : ""}...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ═══ Complete Step ═══ */}
                    {step === "complete" && (
                        <div className="py-8 px-6">
                            {/* Success/Warning header */}
                            <div className="text-center mb-8">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${failed === 0
                                        ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50"
                                        : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50"
                                    }`}>
                                    {failed === 0 ? (
                                        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-2">
                                    {failed === 0 ? "All Emails Sent!" : "Campaign Complete"}
                                </h3>
                                <div className="flex items-center justify-center gap-3 text-sm">
                                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        {successful} sent
                                    </span>
                                    {failed > 0 && (
                                        <span className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                                            {failed} failed
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Results list */}
                            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 overflow-hidden">
                                <div className="px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border-b border-[#E5E7EB] dark:border-slate-700">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">Delivery Report</span>
                                </div>
                                <div className="max-h-56 overflow-y-auto divide-y divide-[#F1F3F8] dark:divide-slate-800">
                                    {results.map((result, i) => (
                                        <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#f8fafc] dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${result.success
                                                        ? "bg-emerald-100 dark:bg-emerald-900/40"
                                                        : "bg-red-100 dark:bg-red-900/40"
                                                    }`}>
                                                    {result.success ? (
                                                        <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-sm text-[#0f172a] dark:text-white truncate">{result.email}</span>
                                            </div>
                                            {result.success ? (
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex-shrink-0">Delivered</span>
                                            ) : (
                                                <span className="text-xs text-red-500 flex-shrink-0 max-w-[140px] truncate" title={result.error}>
                                                    {result.error?.slice(0, 30)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────── */}
                <div className="px-6 py-4 border-t border-[#F1F3F8] dark:border-slate-800 flex items-center justify-between bg-[#f8fafc]/50 dark:bg-slate-800/30">
                    {step === "configure" && (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 text-sm font-medium text-[#4B5563] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!canSend}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send {contacts.length} Email{contacts.length !== 1 ? "s" : ""}
                            </button>
                        </>
                    )}
                    {step === "sending" && (
                        <div className="w-full flex items-center justify-center gap-2 text-sm text-[#9CA3AF]">
                            <div className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full animate-pulse" />
                            Sending in progress...
                        </div>
                    )}
                    {step === "complete" && (
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
