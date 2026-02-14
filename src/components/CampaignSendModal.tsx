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

// Template variable replacement
function replaceVariables(text: string, contact: { name?: string; company?: string; email: string }) {
    return text
        .replace(/\{\{name\}\}/gi, contact.name || contact.email.split("@")[0])
        .replace(/\{\{first_name\}\}/gi, contact.name?.split(" ")[0] || contact.email.split("@")[0])
        .replace(/\{\{company\}\}/gi, contact.company || "your company")
        .replace(/\{\{email\}\}/gi, contact.email);
}

export default function CampaignSendModal({ onClose, template, sender, contacts }: CampaignSendModalProps) {
    // Saved SMTP configs
    const smtpConfigs = useAuthQuery(api.smtpConfigs.list);
    const defaultSmtp = useAuthQuery(api.smtpConfigs.getDefault);
    const markUsed = useAuthMutation(api.smtpConfigs.markUsed);

    // SMTP selection
    const [selectedSmtpId, setSelectedSmtpId] = useState<string>("");
    const [useManual, setUseManual] = useState(false);

    // Manual SMTP (fallback)
    const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
    const [smtpPort, setSmtpPort] = useState(587);
    const [smtpUser, setSmtpUser] = useState(sender.email);
    const [smtpPass, setSmtpPass] = useState("");

    // Sending state
    const [step, setStep] = useState<"configure" | "sending" | "complete">("configure");
    const [delayMs, setDelayMs] = useState(1000);
    const [results, setResults] = useState<SendResult[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Activity logging
    const logEmail = useAuthMutation(api.activities.logEmail);

    // Set default SMTP when loaded
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

            // Get SMTP config
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
                // Mark as used
                await markUsed({ id: selectedConfig._id });
            }

            // Call bulk send API
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

            // Log successful emails
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

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Send Campaign</h2>
                        <p className="text-sm text-white/50">
                            {contacts.length} recipients • {template.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        disabled={isSending}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Configure Step */}
                    {step === "configure" && (
                        <div className="space-y-6">
                            {/* SMTP Selection */}
                            <div>
                                <h3 className="text-sm font-medium text-white/70 mb-3">Email Configuration</h3>

                                {smtpConfigs === undefined ? (
                                    <div className="flex items-center gap-2 text-white/50">
                                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                        Loading saved configs...
                                    </div>
                                ) : smtpConfigs.length > 0 && !useManual ? (
                                    <div className="space-y-3">
                                        <select
                                            value={selectedSmtpId}
                                            onChange={(e) => setSelectedSmtpId(e.target.value)}
                                            className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                        >
                                            {smtpConfigs.map((config) => (
                                                <option key={config._id} value={config._id}>
                                                    {config.name} ({config.fromEmail}){config.isDefault ? " ★" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedConfig && (
                                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                                                <div className="flex items-center gap-2 text-green-400 mb-1">
                                                    <span>✓</span>
                                                    <span className="font-medium">Ready to send</span>
                                                </div>
                                                <div className="text-white/50">
                                                    From: {selectedConfig.fromName ? `${selectedConfig.fromName} <${selectedConfig.fromEmail}>` : selectedConfig.fromEmail}
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setUseManual(true)}
                                            className="text-sm text-white/40 hover:text-white/60 underline"
                                        >
                                            Use different credentials instead
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {smtpConfigs.length === 0 && (
                                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                                                <p className="text-amber-400 mb-2">No saved SMTP configs</p>
                                                <Link
                                                    href="/smtp-settings"
                                                    className="text-indigo-400 hover:underline"
                                                    onClick={onClose}
                                                >
                                                    → Set up SMTP for one-click sending
                                                </Link>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-white/50 mb-1 block">SMTP Host</label>
                                                <input
                                                    type="text"
                                                    value={smtpHost}
                                                    onChange={(e) => setSmtpHost(e.target.value)}
                                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm"
                                                    placeholder="smtp.gmail.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/50 mb-1 block">Port</label>
                                                <input
                                                    type="number"
                                                    value={smtpPort}
                                                    onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/50 mb-1 block">Username</label>
                                                <input
                                                    type="text"
                                                    value={smtpUser}
                                                    onChange={(e) => setSmtpUser(e.target.value)}
                                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/50 mb-1 block">Password</label>
                                                <input
                                                    type="password"
                                                    value={smtpPass}
                                                    onChange={(e) => setSmtpPass(e.target.value)}
                                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm"
                                                    placeholder="Enter password"
                                                />
                                            </div>
                                        </div>
                                        {smtpConfigs.length > 0 && (
                                            <button
                                                onClick={() => setUseManual(false)}
                                                className="text-sm text-indigo-400 hover:underline"
                                            >
                                                ← Use saved configuration
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sending Options */}
                            <div>
                                <h3 className="text-sm font-medium text-white/70 mb-3">Sending Options</h3>
                                <div>
                                    <label className="text-xs text-white/50 mb-1 block">Delay between emails (ms)</label>
                                    <input
                                        type="number"
                                        value={delayMs}
                                        onChange={(e) => setDelayMs(parseInt(e.target.value))}
                                        min={500}
                                        max={10000}
                                        className="w-32 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm"
                                    />
                                    <p className="text-xs text-white/40 mt-1">
                                        Higher delay = less likely to be flagged as spam
                                    </p>
                                </div>
                            </div>

                            {/* Preview */}
                            <div>
                                <h3 className="text-sm font-medium text-white/70 mb-3">Email Preview</h3>
                                <div className="p-4 bg-black/40 rounded-lg border border-white/10">
                                    <div className="text-xs text-white/50 mb-2">
                                        To: {previewContact?.email}
                                    </div>
                                    <div className="font-medium mb-2">{previewSubject}</div>
                                    <div
                                        className="text-sm text-white/70 max-h-32 overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: previewBody }}
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    ⚠️ {error}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sending Step */}
                    {step === "sending" && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6" />
                            <h3 className="text-xl font-bold mb-2">Sending Emails...</h3>
                            <p className="text-white/50">
                                Please wait, do not close this window
                            </p>
                        </div>
                    )}

                    {/* Complete Step */}
                    {step === "complete" && (
                        <div className="space-y-6">
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">
                                    {failed === 0 ? "🎉" : "⚠️"}
                                </div>
                                <h3 className="text-2xl font-bold mb-2">
                                    {failed === 0 ? "All Emails Sent!" : "Campaign Complete"}
                                </h3>
                                <p className="text-white/60">
                                    <span className="text-green-400">{successful} sent</span>
                                    {failed > 0 && <span className="text-red-400"> • {failed} failed</span>}
                                </p>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {results.map((result, i) => (
                                    <div
                                        key={i}
                                        className={`py-2 px-3 flex items-center justify-between text-sm ${i % 2 === 0 ? "bg-white/5" : ""} rounded`}
                                    >
                                        <span className="truncate">{result.email}</span>
                                        {result.success ? (
                                            <span className="text-green-400 flex-shrink-0">✓ Sent</span>
                                        ) : (
                                            <span className="text-red-400 flex-shrink-0 text-xs">
                                                ✕ {result.error?.slice(0, 30)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between">
                    {step === "configure" && (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!canSend}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send {contacts.length} Emails
                            </button>
                        </>
                    )}
                    {step === "sending" && (
                        <div className="w-full text-center text-white/50">
                            Sending in progress...
                        </div>
                    )}
                    {step === "complete" && (
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-medium"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
