"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";
import { useAuthMutation, useAuthQuery } from "../hooks/useAuthConvex";

interface CampaignSendModalProps {
    onClose: () => void;
    template: {
        _id: Id<"templates">;
        name: string;
        subject: string;
        body: string;
    };
    account: {
        _id: Id<"smtpConfigs">;
        name: string;
        fromEmail: string;
        fromName?: string;
        host?: string;
        port?: number;
        secure?: boolean;
        username?: string;
        password?: string;
        provider?: string;
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

export default function CampaignSendModal({ onClose, template, account, contacts }: CampaignSendModalProps) {
    const markUsed = useAuthMutation(api.smtpConfigs.markUsed);
    const recordSends = useAuthMutation(api.warmup.recordSends);

    // ── Send Throttle (Reputation Guard) ──
    const sendLimit = useAuthQuery(api.warmup.getSendLimit, { smtpConfigId: account._id });
    const isThrottled = sendLimit?.isRamping && contacts.length > (sendLimit?.remaining || 0);
    const effectiveContactCount = sendLimit?.isRamping
        ? Math.min(contacts.length, sendLimit?.remaining || 0)
        : contacts.length;

    const [step, setStep] = useState<"configure" | "sending" | "complete">("configure");
    const [delayMs, setDelayMs] = useState(1000);
    const [results, setResults] = useState<SendResult[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sendProgress, setSendProgress] = useState({ sent: 0, failed: 0, total: 0, currentEmail: "" });

    // Iframe ref for preview
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const logEmail = useAuthMutation(api.activities.logEmail);

    const previewContact = contacts[0];
    const previewSubject = previewContact ? replaceVariables(template.subject, previewContact) : template.subject;
    const previewBody = previewContact ? replaceVariables(template.body, previewContact) : template.body;

    // Write preview body into sandboxed iframe
    const iframeLoadHandler = useCallback(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#374151;background:#fff;}img{max-width:100%;height:auto;}a{color:#0EA5E9;}*{box-sizing:border-box;}</style></head><body>${previewBody}</body></html>`);
        doc.close();
    }, [previewBody]);

    useEffect(() => {
        // Re-write iframe content when preview body changes
        iframeLoadHandler();
    }, [iframeLoadHandler]);

    const canSend = account.host && account.username && account.password;

    const handleSend = async () => {
        if (!canSend) {
            setError("Please configure SMTP settings");
            return;
        }

        // ── Enforce send throttle ──
        if (sendLimit?.isRamping && (sendLimit?.remaining || 0) <= 0) {
            setError(`Daily send limit reached for this account (Day ${sendLimit.day + 1} of ${sendLimit.rampDays}). Try again tomorrow.`);
            return;
        }

        // Cap contacts to remaining daily limit
        const cappedContacts = sendLimit?.isRamping
            ? contacts.slice(0, sendLimit.remaining)
            : contacts;

        setStep("sending");
        setIsSending(true);
        setError(null);
        setResults([]);
        setSendProgress({ sent: 0, failed: 0, total: cappedContacts.length, currentEmail: "" });

        try {
            const emailsToSend = cappedContacts.map(contact => ({
                to: contact.email,
                subject: replaceVariables(template.subject, contact),
                html: replaceVariables(template.body, contact),
                contactId: contact._id,
            }));

            const smtp = {
                host: account.host,
                port: account.port,
                secure: account.secure,
                user: account.username,
                pass: account.password,
            };
            await markUsed({ id: account._id });

            const response = await fetch("/api/send-bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emails: emailsToSend,
                    from: {
                        name: account.fromName || account.name,
                        email: account.fromEmail,
                    },
                    smtp,
                    delayBetweenMs: delayMs,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to send emails");
            }

            // Stream NDJSON results
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            const allResults: SendResult[] = [];
            let buffer = "";

            if (!reader) throw new Error("Failed to read response stream");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        if (data.type === "result") {
                            const result: SendResult = {
                                email: data.email,
                                success: data.success,
                                error: data.error,
                                contactId: data.contactId,
                            };
                            allResults.push(result);
                            setResults([...allResults]);

                            const sent = allResults.filter(r => r.success).length;
                            const failed = allResults.filter(r => !r.success).length;
                            setSendProgress({
                                sent,
                                failed,
                                total: cappedContacts.length,
                                currentEmail: data.email,
                            });

                            // Log successful emails in real-time
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
                    } catch {
                        // Skip malformed lines
                    }
                }
            }

            // ── Record sends in throttle tracker ──
            const successCount = allResults.filter(r => r.success).length;
            if (successCount > 0) {
                try {
                    await recordSends({ smtpConfigId: account._id, count: successCount });
                } catch {
                    // Non-critical — don't block the flow
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

                            {/* ── Sending Account ── */}
                            <div className="px-6 py-5">
                                <div className={sectionTitleCls}>Sending Account</div>
                                <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 truncate">{account.name}</span>
                                            {account.provider && account.provider !== "smtp" && (
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md">{account.provider}</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-emerald-600/70 dark:text-emerald-400/60 truncate">
                                            From: {account.fromName ? `${account.fromName} <${account.fromEmail}>` : account.fromEmail}
                                        </div>
                                    </div>
                                    <Link
                                        href="/accounts"
                                        onClick={onClose}
                                        className="text-xs text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex-shrink-0"
                                    >
                                        Change
                                    </Link>
                                </div>

                                {/* ── Reputation Guard: Throttle Warning ── */}
                                {sendLimit?.isRamping && (
                                    <div className={`mt-3 flex items-start gap-3 p-3.5 rounded-xl border ${isThrottled
                                            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
                                            : "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/40"
                                        }`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isThrottled ? "bg-amber-100 dark:bg-amber-900/40" : "bg-cyan-100 dark:bg-cyan-900/40"
                                            }`}>
                                            <span className="text-sm">{isThrottled ? "⚠️" : "🛡️"}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-semibold mb-0.5 ${isThrottled ? "text-amber-700 dark:text-amber-300" : "text-cyan-700 dark:text-cyan-300"
                                                }`}>
                                                Reputation Guard · Day {sendLimit.day + 1} of {sendLimit.rampDays}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {isThrottled ? (
                                                    <>This account can send <strong className="text-amber-600 dark:text-amber-300">{sendLimit.remaining}</strong> more email{sendLimit.remaining !== 1 ? "s" : ""} today. Only the first {sendLimit.remaining} of {contacts.length} recipients will be sent now.</>
                                                ) : (
                                                    <>Daily limit: <strong className="text-cyan-600 dark:text-cyan-300">{sendLimit.dailyLimit}</strong> emails · <strong>{sendLimit.remaining}</strong> remaining today · {sendLimit.sentToday} sent</>
                                                )}
                                            </div>
                                            {/* Mini progress bar */}
                                            <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${isThrottled ? "bg-amber-500" : "bg-cyan-500"
                                                        }`}
                                                    style={{ width: `${sendLimit.dailyLimit ? Math.min(100, ((sendLimit.sentToday || 0) / sendLimit.dailyLimit) * 100) : 0}%` }}
                                                />
                                            </div>
                                        </div>
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
                                    {/* Email body — sandboxed iframe */}
                                    <iframe
                                        ref={iframeRef}
                                        sandbox="allow-same-origin"
                                        title="Email preview"
                                        className="w-full border-0 bg-white"
                                        style={{ height: "160px" }}
                                        onLoad={iframeLoadHandler}
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
                        <div className="py-10 px-6">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="relative w-16 h-16 mx-auto mb-5">
                                    <div className="w-16 h-16 border-[3px] border-[#E5E7EB] dark:border-slate-700 rounded-full" />
                                    <div className="absolute inset-0 w-16 h-16 border-[3px] border-transparent border-t-[#0EA5E9] rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-1">Sending Emails...</h3>
                                <p className="text-sm text-[#9CA3AF]">Do not close this window</p>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-[#4B5563] dark:text-slate-400">
                                        {sendProgress.sent + sendProgress.failed} of {sendProgress.total}
                                    </span>
                                    <span className="text-xs font-medium text-[#0EA5E9]">
                                        {sendProgress.total > 0 ? Math.round(((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="h-2.5 bg-[#E5E7EB] dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: sendProgress.total > 0 ? `${((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100}%` : '0%',
                                            background: sendProgress.failed > 0
                                                ? 'linear-gradient(90deg, #10B981, #F59E0B)'
                                                : 'linear-gradient(90deg, #0EA5E9, #8B5CF6)',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Live stats */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <div className="text-center p-3 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                                    <div className="text-lg font-bold text-[#0f172a] dark:text-white">{sendProgress.sent}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold">Sent</div>
                                </div>
                                <div className="text-center p-3 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                                    <div className="text-lg font-bold text-[#0f172a] dark:text-white">{sendProgress.failed}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-red-500 font-semibold">Failed</div>
                                </div>
                                <div className="text-center p-3 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                                    <div className="text-lg font-bold text-[#0f172a] dark:text-white">{sendProgress.total - sendProgress.sent - sendProgress.failed}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">Remaining</div>
                                </div>
                            </div>

                            {/* Current email */}
                            {sendProgress.currentEmail && (
                                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-800 rounded-xl border border-[#E5E7EB] dark:border-slate-700">
                                    <div className="w-2 h-2 bg-[#0EA5E9] rounded-full animate-pulse flex-shrink-0" />
                                    <span className="text-xs text-[#4B5563] dark:text-slate-400 truncate">
                                        Sending to <span className="font-medium text-[#0f172a] dark:text-white">{sendProgress.currentEmail}</span>
                                    </span>
                                </div>
                            )}
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
                                disabled={!canSend || (sendLimit?.isRamping && (sendLimit?.remaining || 0) <= 0)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#0f172a] dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0f172a]/90 dark:hover:bg-slate-100 transition-all shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send {effectiveContactCount} Email{effectiveContactCount !== 1 ? "s" : ""}
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
