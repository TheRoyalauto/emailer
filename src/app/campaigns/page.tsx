"use client";

import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import CampaignSendModal from "@/components/CampaignSendModal";
import { useAuthQuery } from "../../hooks/useAuthConvex";

export default function CampaignsPage() {
    const templates = useAuthQuery(api.templates.list, {});
    const accounts = useAuthQuery(api.smtpConfigs.list);
    const batches = useAuthQuery(api.batches.list);
    const contacts = useAuthQuery(api.contacts.list, {});

    // Campaign creation state
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState<{ sent: number; total: number; failed: number } | null>(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

    const previewTemplateData = templates?.find(t => t._id === previewTemplate);

    const selectedTemplateData = templates?.find(t => t._id === selectedTemplate);
    const selectedAccountData = accounts?.find(s => s._id === selectedAccount);
    const selectedBatchData = batches?.find(b => b._id === selectedBatch);

    const batchContacts = selectedBatch
        ? contacts?.filter(c => c.batchId === selectedBatch)
        : [];

    const canStartCampaign = selectedTemplate && selectedAccount && selectedBatch && batchContacts && batchContacts.length > 0;

    const handleStartCampaign = () => {
        if (!canStartCampaign) return;
        setShowSendModal(true);
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
                <AppHeader />

                <main className="max-w-4xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">New Campaign</h1>
                        <p className="text-slate-400 mt-1">Select a template, sender, and batch to start sending emails</p>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: Select Template */}
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm">1</div>
                                    <h2 className="text-lg font-semibold font-heading text-slate-900 dark:text-white tracking-[-0.02em]">Select Email Template</h2>
                                </div>
                                {templates && templates.length > 0 && (
                                    <Link
                                        href="/templates"
                                        className="text-sm text-slate-400 hover:text-cyan-600 transition-colors flex items-center gap-1"
                                    >
                                        ← Back to Templates
                                    </Link>
                                )}
                            </div>

                            {templates === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="py-6 text-center">
                                    <p className="text-slate-400 mb-4">No templates yet</p>
                                    <Link
                                        href="/templates?action=add"
                                        className="px-5 py-2.5 bg-slate-900 rounded-lg font-semibold text-white hover:bg-slate-800 transition-all inline-block"
                                    >
                                        + Create Your First Template
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 max-h-[240px] overflow-y-auto pr-2">
                                    {templates.map((template) => (
                                        <div
                                            key={template._id}
                                            className="group relative"
                                        >
                                            <button
                                                onClick={() => setSelectedTemplate(template._id)}
                                                className={`w-full p-4 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] ${selectedTemplate === template._id
                                                    ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/50 ring-2 ring-cyan-200 dark:ring-cyan-500/20"
                                                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-md"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                    <div className="font-semibold truncate text-sm text-slate-900 dark:text-white">{template.name}</div>
                                                </div>
                                                <div className="text-xs text-slate-400 truncate">{template.subject}</div>
                                            </button>
                                            {/* Action buttons on hover */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewTemplate(template._id);
                                                    }}
                                                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg text-xs shadow-sm"
                                                    title="Preview"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                                <Link
                                                    href={`/templates?edit=${template._id}`}
                                                    className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg text-xs shadow-sm"
                                                    title="Edit Template"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 2: Select Email Account */}
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm">2</div>
                                    <h2 className="text-lg font-semibold font-heading text-slate-900 dark:text-white tracking-[-0.02em]">Select Email Account</h2>
                                </div>
                                {accounts && accounts.length > 0 && (
                                    <Link
                                        href="/accounts"
                                        className="text-sm text-slate-400 hover:text-cyan-600 transition-colors flex items-center gap-1"
                                    >
                                        Manage Accounts
                                    </Link>
                                )}
                            </div>

                            {accounts === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                </div>
                            ) : accounts.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-slate-400 mb-3">No email accounts configured</p>
                                    <Link href="/accounts" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                                        Add an email account →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {accounts.map((account) => (
                                        <button
                                            key={account._id}
                                            onClick={() => setSelectedAccount(account._id)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${selectedAccount === account._id
                                                ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/50 ring-2 ring-cyan-200 dark:ring-cyan-500/20"
                                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-md"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="font-semibold truncate text-slate-900 dark:text-white">{account.name}</div>
                                                {account.isDefault && (
                                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-md">Default</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-400 truncate">{account.fromEmail}</div>
                                            {account.host && (
                                                <div className="text-xs text-slate-300 dark:text-slate-600 mt-1 truncate">{account.host}</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 3: Select Batch */}
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm">3</div>
                                <h2 className="text-lg font-semibold font-heading text-slate-900 dark:text-white tracking-[-0.02em]">Select Contact Batch</h2>
                            </div>

                            {batches === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                </div>
                            ) : batches.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-slate-400 mb-3">No contact batches yet</p>
                                    <Link href="/contacts" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                                        Import contacts →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {batches.map((batch) => (
                                        <button
                                            key={batch._id}
                                            onClick={() => setSelectedBatch(batch._id)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${selectedBatch === batch._id
                                                ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/50 ring-2 ring-cyan-200 dark:ring-cyan-500/20"
                                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:shadow-md"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: batch.color || "#06B6D4" }}
                                                />
                                                <span className="font-semibold truncate text-slate-900 dark:text-white">{batch.name}</span>
                                            </div>
                                            <div className="text-sm text-slate-400 mt-1">
                                                {batch.contactCount} contacts
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary & Start Button */}
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-lg font-semibold font-heading text-slate-900 dark:text-white mb-4 tracking-[-0.02em]">Campaign Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Template:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{selectedTemplateData?.name || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Email Account:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{selectedAccountData?.fromEmail || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Batch:</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{selectedBatchData?.name || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                                    <span className="text-slate-400">Total emails to send:</span>
                                    <span className="text-xl font-bold font-heading text-cyan-600 tracking-[-0.04em]">
                                        {batchContacts?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {sendProgress ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span>Sending emails...</span>
                                        <span>{sendProgress.sent} / {sendProgress.total}</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 transition-all"
                                            style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStartCampaign}
                                    disabled={!canStartCampaign || isSending}
                                    className="w-full py-4 bg-slate-900 dark:bg-white rounded-xl font-semibold text-lg text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                    Start Campaign
                                </button>
                            )}

                            {!canStartCampaign && !isSending && (
                                <p className="text-center text-slate-400 text-sm mt-3">
                                    Select a template, sender, and batch to start
                                </p>
                            )}
                        </div>
                    </div>
                </main>

                {/* Send Modal */}
                {showSendModal && selectedTemplateData && selectedAccountData && batchContacts && (
                    <CampaignSendModal
                        onClose={() => setShowSendModal(false)}
                        template={{
                            _id: selectedTemplateData._id,
                            name: selectedTemplateData.name,
                            subject: selectedTemplateData.subject,
                            body: selectedTemplateData.htmlBody,
                        }}
                        account={{
                            _id: selectedAccountData._id,
                            name: selectedAccountData.name,
                            fromEmail: selectedAccountData.fromEmail,
                            fromName: selectedAccountData.fromName,
                            host: selectedAccountData.host,
                            port: selectedAccountData.port,
                            secure: selectedAccountData.secure,
                            username: selectedAccountData.username,
                            password: selectedAccountData.password,
                            provider: selectedAccountData.provider,
                        }}
                        contacts={batchContacts}
                    />
                )}

                {/* Template Preview Modal */}
                {previewTemplate && previewTemplateData && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                <div>
                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">{previewTemplateData.name}</h2>
                                    <p className="text-sm text-slate-400">Subject: {previewTemplateData.subject}</p>
                                </div>
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Email Preview */}
                            <div className="flex-1 overflow-auto bg-slate-50">
                                <iframe
                                    srcDoc={previewTemplateData.htmlBody}
                                    className="w-full h-full min-h-[400px] bg-white"
                                    title="Email Preview"
                                    sandbox="allow-same-origin"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                <Link
                                    href={`/templates?edit=${previewTemplateData._id}`}
                                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-all border border-slate-200"
                                >
                                    Edit Template
                                </Link>
                                <button
                                    onClick={() => {
                                        setSelectedTemplate(previewTemplateData._id);
                                        setPreviewTemplate(null);
                                    }}
                                    className="px-5 py-2 bg-slate-900 rounded-lg font-semibold text-sm text-white hover:bg-slate-800 transition-all"
                                >
                                    Use This Template
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
