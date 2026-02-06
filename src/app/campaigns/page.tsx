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
    const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

    const previewTemplateData = templates?.find(t => t._id === previewTemplate);

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
            <div className="min-h-screen bg-[#F8F9FC] pb-20 md:pb-0">
                <AppHeader />

                <main className="max-w-4xl mx-auto px-6 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#1A1D26]">New Campaign</h1>
                        <p className="text-[#9CA3AF] mt-1">Select a template, sender, and batch to start sending emails</p>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: Select Template */}
                        <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#FF6B4A]/20">1</div>
                                    <h2 className="text-lg font-semibold text-[#1A1D26]">Select Email Template</h2>
                                </div>
                                {templates && templates.length > 0 && (
                                    <Link
                                        href="/templates"
                                        className="text-sm text-[#9CA3AF] hover:text-[#FF6B4A] transition-colors flex items-center gap-1"
                                    >
                                        ← Back to Templates
                                    </Link>
                                )}
                            </div>

                            {templates === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="py-6 text-center">
                                    <p className="text-[#9CA3AF] mb-4">No templates yet</p>
                                    <Link
                                        href="/templates?action=add"
                                        className="px-4 py-2 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-lg font-medium text-white hover:shadow-lg hover:shadow-[#FF6B4A]/25 transition-all inline-block"
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
                                                    ? "bg-[#FF6B4A]/5 border-[#FF6B4A]/30 ring-2 ring-[#FF6B4A]/20"
                                                    : "bg-[#F8F9FC] border-[#E5E7EB] hover:border-[#FF6B4A]/20 hover:shadow-md"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">📝</span>
                                                    <div className="font-semibold truncate text-sm text-[#1A1D26]">{template.name}</div>
                                                </div>
                                                <div className="text-xs text-[#9CA3AF] truncate">{template.subject}</div>
                                            </button>
                                            {/* Action buttons on hover */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewTemplate(template._id);
                                                    }}
                                                    className="p-1.5 bg-white border border-[#E5E7EB] hover:border-[#FF6B4A] hover:bg-[#FF6B4A]/5 rounded-lg text-xs shadow-sm"
                                                    title="Preview"
                                                >
                                                    👁️
                                                </button>
                                                <Link
                                                    href={`/templates?edit=${template._id}`}
                                                    className="p-1.5 bg-white border border-[#E5E7EB] hover:border-[#FF6B4A] hover:bg-[#FF6B4A]/5 rounded-lg text-xs shadow-sm"
                                                    title="Edit Template"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    ✏️
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 2: Select Sender */}
                        <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#FF6B4A]/20">2</div>
                                <h2 className="text-lg font-semibold text-[#1A1D26]">Select Sender Account</h2>
                            </div>

                            {senders === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                                </div>
                            ) : senders.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-[#9CA3AF] mb-3">No sender accounts configured</p>
                                    <Link href="/senders" className="text-[#FF6B4A] hover:text-[#F43F5E] font-medium transition-colors">
                                        Add a sender account →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {senders.map((sender) => (
                                        <button
                                            key={sender._id}
                                            onClick={() => setSelectedSender(sender._id)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${selectedSender === sender._id
                                                ? "bg-[#FF6B4A]/5 border-[#FF6B4A]/30 ring-2 ring-[#FF6B4A]/20"
                                                : "bg-[#F8F9FC] border-[#E5E7EB] hover:border-[#FF6B4A]/20 hover:shadow-md"
                                                }`}
                                        >
                                            <div className="font-semibold truncate text-[#1A1D26]">{sender.name}</div>
                                            <div className="text-sm text-[#9CA3AF] truncate mt-1">{sender.email}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Step 3: Select Batch */}
                        <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#FF6B4A]/20">3</div>
                                <h2 className="text-lg font-semibold text-[#1A1D26]">Select Contact Batch</h2>
                            </div>

                            {batches === undefined ? (
                                <div className="py-4 flex items-center justify-center">
                                    <div className="animate-spin w-6 h-6 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                                </div>
                            ) : batches.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-[#9CA3AF] mb-3">No contact batches yet</p>
                                    <Link href="/contacts" className="text-[#FF6B4A] hover:text-[#F43F5E] font-medium transition-colors">
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
                                                ? "bg-[#FF6B4A]/5 border-[#FF6B4A]/30 ring-2 ring-[#FF6B4A]/20"
                                                : "bg-[#F8F9FC] border-[#E5E7EB] hover:border-[#FF6B4A]/20 hover:shadow-md"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: batch.color || "#FF6B4A" }}
                                                />
                                                <span className="font-semibold truncate text-[#1A1D26]">{batch.name}</span>
                                            </div>
                                            <div className="text-sm text-[#9CA3AF] mt-1">
                                                {batch.contactCount} contacts
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary & Start Button */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-[#FF6B4A]/5 to-[#F43F5E]/5 border border-[#FF6B4A]/10">
                            <h2 className="text-lg font-semibold text-[#1A1D26] mb-4">Campaign Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9CA3AF]">Template:</span>
                                    <span className="font-semibold text-[#1A1D26]">{selectedTemplateData?.name || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9CA3AF]">Sender:</span>
                                    <span className="font-semibold text-[#1A1D26]">{selectedSenderData?.email || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#9CA3AF]">Batch:</span>
                                    <span className="font-semibold text-[#1A1D26]">{selectedBatchData?.name || "Not selected"}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3">
                                    <span className="text-[#9CA3AF]">Total emails to send:</span>
                                    <span className="text-xl font-bold text-[#FF6B4A]">
                                        {batchContacts?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {sendProgress ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm text-[#4B5563]">
                                        <span>Sending emails...</span>
                                        <span>{sendProgress.sent} / {sendProgress.total}</span>
                                    </div>
                                    <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] transition-all"
                                            style={{ width: `${(sendProgress.sent / sendProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleStartCampaign}
                                    disabled={!canStartCampaign || isSending}
                                    className="w-full py-4 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-lg text-white hover:shadow-xl hover:shadow-[#FF6B4A]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <span className="text-xl">🚀</span>
                                    Start Campaign
                                </button>
                            )}

                            {!canStartCampaign && !isSending && (
                                <p className="text-center text-[#9CA3AF] text-sm mt-3">
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

                {/* Template Preview Modal */}
                {previewTemplate && previewTemplateData && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                                <div>
                                    <h2 className="text-lg font-bold text-[#1A1D26]">{previewTemplateData.name}</h2>
                                    <p className="text-sm text-[#9CA3AF]">Subject: {previewTemplateData.subject}</p>
                                </div>
                                <button
                                    onClick={() => setPreviewTemplate(null)}
                                    className="p-2 hover:bg-[#F1F3F8] rounded-lg transition-colors text-[#9CA3AF] hover:text-[#1A1D26]"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Email Preview */}
                            <div className="flex-1 overflow-auto bg-[#F8F9FC]">
                                <iframe
                                    srcDoc={previewTemplateData.htmlBody}
                                    className="w-full h-full min-h-[400px] bg-white"
                                    title="Email Preview"
                                    sandbox="allow-same-origin"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-[#F8F9FC]">
                                <Link
                                    href={`/templates?edit=${previewTemplateData._id}`}
                                    className="px-4 py-2 text-sm text-[#9CA3AF] hover:text-[#1A1D26] hover:bg-white rounded-lg transition-all border border-[#E5E7EB]"
                                >
                                    ✏️ Edit Template
                                </Link>
                                <button
                                    onClick={() => {
                                        setSelectedTemplate(previewTemplateData._id);
                                        setPreviewTemplate(null);
                                    }}
                                    className="px-5 py-2 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-lg font-semibold text-sm text-white hover:shadow-lg hover:shadow-[#FF6B4A]/25 transition-all"
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
