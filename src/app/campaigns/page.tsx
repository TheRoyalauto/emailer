"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import CampaignSendModal from "@/components/CampaignSendModal";

export default function CampaignsPage() {
    const templates = useQuery(api.templates.list, {});
    const senders = useQuery(api.senders.list);
    const batches = useQuery(api.batches.list);
    const contacts = useQuery(api.contacts.list, {});

    // Campaign creation state
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [selectedSender, setSelectedSender] = useState<string>("");
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState<{ sent: number; total: number; failed: number } | null>(null);
    const [showSendModal, setShowSendModal] = useState(false);

    const selectedTemplateData = templates?.find(t => t._id === selectedTemplate);
    const selectedSenderData = senders?.find(s => s._id === selectedSender);
    const selectedBatchData = batches?.find(b => b._id === selectedBatch);

    const batchContacts = selectedBatch
        ? contacts?.filter(c => c.batchId === selectedBatch)
        : [];

    const canStartCampaign = selectedTemplate && selectedSender && selectedBatch && batchContacts && batchContacts.length > 0;

    const handleStartCampaign = () => {
        if (!canStartCampaign) return;
        setShowSendModal(true);
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#0a0a0f] text-white">
                <AppHeader />

                <main className="max-w-4xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">New Campaign</h1>
                        <p className="text-white/50 mt-1">Select a template, sender, and batch to start sending emails</p>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: Select Template */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">1</div>
                                    <h2 className="text-lg font-semibold">Select Email Template</h2>
                                </div>
                                {templates && templates.length > 0 && (
                                    <Link
                                        href="/templates"
                                        className="text-sm text-white/50 hover:text-indigo-400 transition-colors flex items-center gap-1"
                                    >
                                        ← Back to Templates
                                    </Link>
                                )}
                            </div>

                            {templates === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="py-6 text-center">
                                    <p className="text-white/50 mb-4">No templates yet</p>
                                    <Link
                                        href="/templates?action=add"
                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity inline-block"
                                    >
                                        + Create Your First Template
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                                    {templates.map((template) => (
                                        <div
                                            key={template._id}
                                            className="group relative"
                                        >
                                            <button
                                                onClick={() => setSelectedTemplate(template._id)}
                                                className={`w-full p-4 rounded-lg border text-left transition-all hover:scale-[1.02] ${selectedTemplate === template._id
                                                    ? "bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30"
                                                    : "bg-black/20 border-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">📝</span>
                                                    <div className="font-medium truncate text-sm">{template.name}</div>
                                                </div>
                                                <div className="text-xs text-white/50 truncate">{template.subject}</div>
                                            </button>
                                            {/* Edit button on hover */}
                                            <Link
                                                href={`/templates?edit=${template._id}`}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/60 hover:bg-indigo-500/40 rounded-lg transition-all text-xs"
                                                title="Edit Template"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                ✏️
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 2: Select Sender */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">2</div>
                                <h2 className="text-lg font-semibold">Select Sender Account</h2>
                            </div>

                            {senders === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                </div>
                            ) : senders.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-white/50 mb-3">No sender accounts configured</p>
                                    <Link href="/senders" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Add a sender account →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {senders.map((sender) => (
                                        <button
                                            key={sender._id}
                                            onClick={() => setSelectedSender(sender._id)}
                                            className={`p-4 rounded-lg border text-left transition-all ${selectedSender === sender._id
                                                ? "bg-indigo-500/20 border-indigo-500/50"
                                                : "bg-black/20 border-white/10 hover:border-white/20"
                                                }`}
                                        >
                                            <div className="font-medium truncate">{sender.name}</div>
                                            <div className="text-sm text-white/50 truncate mt-1">{sender.email}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 3: Select Batch */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">3</div>
                                <h2 className="text-lg font-semibold">Select Contact Batch</h2>
                            </div>

                            {batches === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                </div>
                            ) : batches.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-white/50 mb-3">No contact batches yet</p>
                                    <Link href="/contacts" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                        Import contacts →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {batches.map((batch) => (
                                        <button
                                            key={batch._id}
                                            onClick={() => setSelectedBatch(batch._id)}
                                            className={`p-4 rounded-lg border text-left transition-all ${selectedBatch === batch._id
                                                ? "bg-indigo-500/20 border-indigo-500/50"
                                                : "bg-black/20 border-white/10 hover:border-white/20"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: batch.color || "#6366f1" }}
                                                />
                                                <span className="font-medium truncate">{batch.name}</span>
                                            </div>
                                            <div className="text-sm text-white/50 mt-1">
                                                {batch.contactCount} contacts
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary & Start Button */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                            <h2 className="text-lg font-semibold mb-4">Campaign Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Template:</span>
                                    <span className="font-medium">{selectedTemplateData?.name || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Sender:</span>
                                    <span className="font-medium">{selectedSenderData?.email || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/60">Batch:</span>
                                    <span className="font-medium">{selectedBatchData?.name || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                                    <span className="text-white/60">Total emails to send:</span>
                                    <span className="text-xl font-bold text-indigo-400">
                                        {batchContacts?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {sendProgress ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Sending emails...</span>
                                        <span>{sendProgress.sent} / {sendProgress.total}</span>
                                    </div>
                                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                            style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStartCampaign}
                                    disabled={!canStartCampaign || isSending}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <span className="text-xl">🚀</span>
                                    Start Campaign
                                </button>
                            )}

                            {!canStartCampaign && !isSending && (
                                <p className="text-center text-white/40 text-sm mt-3">
                                    Select a template, sender, and batch to start
                                </p>
                            )}
                        </div>
                    </div>
                </main>

                {/* Send Modal */}
                {showSendModal && selectedTemplateData && selectedSenderData && batchContacts && (
                    <CampaignSendModal
                        onClose={() => setShowSendModal(false)}
                        template={{
                            _id: selectedTemplateData._id,
                            name: selectedTemplateData.name,
                            subject: selectedTemplateData.subject,
                            body: selectedTemplateData.htmlBody,
                        }}
                        sender={{
                            _id: selectedSenderData._id,
                            name: selectedSenderData.name,
                            email: selectedSenderData.email,
                        }}
                        contacts={batchContacts}
                    />
                )}
            </div>
        </AuthGuard>
    );
}
