"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";
import Link from "next/link";

function SequenceEditorPage() {
    const params = useParams();
    const sequenceId = params.id as Id<"sequences">;

    const sequence = useQuery(api.sequences.get, { id: sequenceId });
    const templates = useQuery(api.templates.list, {});
    const contacts = useQuery(api.contacts.list, {});
    const addStep = useMutation(api.sequences.addStep);
    const removeStep = useMutation(api.sequences.removeStep);
    const enrollContact = useMutation(api.sequences.enrollContact);

    const [showAddStep, setShowAddStep] = useState(false);
    const [showEnroll, setShowEnroll] = useState(false);
    const [templateId, setTemplateId] = useState("");
    const [delayDays, setDelayDays] = useState(1);
    const [delayHours, setDelayHours] = useState(0);
    const [condition, setCondition] = useState<"always" | "if_not_opened" | "if_not_clicked">("always");
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    const handleAddStep = async () => {
        if (!templateId) return;
        await addStep({
            sequenceId,
            templateId: templateId as Id<"templates">,
            delayDays,
            delayHours,
            condition,
        });
        setShowAddStep(false);
        setTemplateId("");
        setDelayDays(1);
        setDelayHours(0);
        setCondition("always");
    };

    const handleEnroll = async () => {
        for (const cId of selectedContacts) {
            await enrollContact({
                sequenceId,
                contactId: cId as Id<"contacts">,
            });
        }
        setShowEnroll(false);
        setSelectedContacts([]);
    };

    if (sequence === undefined) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (sequence === null) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
                <p className="text-white/50">Sequence not found</p>
                <Link href="/sequences" className="mt-4 text-indigo-400">← Back to Sequences</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/sequences" className="text-white/50 hover:text-white">
                        ← Back
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{sequence.name}</h1>
                        <p className="text-white/50 text-sm">{sequence.description || "No description"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${sequence.status === "active" ? "bg-green-500/20 text-green-400" :
                            sequence.status === "paused" ? "bg-amber-500/20 text-amber-400" :
                                "bg-white/10 text-white/50"
                        }`}>
                        {sequence.status}
                    </span>
                </div>

                {/* Steps Timeline */}
                <div className="bg-[#12121f] rounded-xl border border-white/10 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Sequence Steps</h2>
                        <button
                            onClick={() => setShowAddStep(true)}
                            className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm"
                        >
                            + Add Step
                        </button>
                    </div>

                    {sequence.steps.length === 0 ? (
                        <div className="text-center py-8 text-white/30">
                            <p>No steps yet. Add your first step to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sequence.steps.map((step, index) => (
                                <div key={step._id} className="flex items-start gap-4">
                                    {/* Step number */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                                            {index + 1}
                                        </div>
                                        {index < sequence.steps.length - 1 && (
                                            <div className="w-0.5 h-16 bg-white/10 mt-2" />
                                        )}
                                    </div>

                                    {/* Step content */}
                                    <div className="flex-1 bg-white/5 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="font-medium">
                                                    {step.template?.name || "Unknown template"}
                                                </div>
                                                <div className="text-sm text-white/50 mt-1">
                                                    Wait {step.delayDays}d {step.delayHours || 0}h before sending
                                                </div>
                                                {step.condition && step.condition !== "always" && (
                                                    <div className="text-xs text-amber-400 mt-1">
                                                        Condition: {step.condition.replace(/_/g, " ")}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeStep({ stepId: step._id })}
                                                className="text-red-400 hover:bg-red-500/20 p-1 rounded"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Enrollments */}
                <div className="bg-[#12121f] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Enrolled Contacts</h2>
                        <button
                            onClick={() => setShowEnroll(true)}
                            className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm"
                        >
                            + Enroll Contacts
                        </button>
                    </div>

                    {sequence.enrollments.length === 0 ? (
                        <div className="text-center py-8 text-white/30">
                            <p>No contacts enrolled yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {sequence.enrollments.map((enrollment) => (
                                <div key={enrollment._id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${enrollment.status === "active" ? "bg-green-400" :
                                                enrollment.status === "completed" ? "bg-blue-400" :
                                                    "bg-white/30"
                                            }`} />
                                        <div>
                                            <div className="text-sm">Contact ID: {enrollment.contactId}</div>
                                            <div className="text-xs text-white/40">
                                                Step {enrollment.currentStep} • {enrollment.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Step Modal */}
            {showAddStep && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Add Step</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-white/50 mb-1 block">Email Template</label>
                                <select
                                    value={templateId}
                                    onChange={(e) => setTemplateId(e.target.value)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                >
                                    <option value="">Select template</option>
                                    {templates?.map((t) => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-white/50 mb-1 block">Delay (days)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={delayDays}
                                        onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-white/50 mb-1 block">Delay (hours)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={delayHours}
                                        onChange={(e) => setDelayHours(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-white/50 mb-1 block">Condition</label>
                                <select
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                                >
                                    <option value="always">Always send</option>
                                    <option value="if_not_opened">Only if previous not opened</option>
                                    <option value="if_not_clicked">Only if previous not clicked</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowAddStep(false)} className="px-4 py-2 bg-white/10 rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={handleAddStep}
                                disabled={!templateId}
                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50"
                            >
                                Add Step
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enroll Modal */}
            {showEnroll && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#12121f] rounded-2xl border border-white/10 w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Enroll Contacts</h2>

                        <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                            {contacts?.map((contact) => (
                                <label key={contact._id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.includes(contact._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedContacts([...selectedContacts, contact._id]);
                                            } else {
                                                setSelectedContacts(selectedContacts.filter(id => id !== contact._id));
                                            }
                                        }}
                                        className="w-4 h-4 rounded"
                                    />
                                    <div>
                                        <div className="text-sm">{contact.name || contact.email}</div>
                                        <div className="text-xs text-white/40">{contact.email}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/50">{selectedContacts.length} selected</span>
                            <div className="flex gap-3">
                                <button onClick={() => setShowEnroll(false)} className="px-4 py-2 bg-white/10 rounded-lg">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEnroll}
                                    disabled={selectedContacts.length === 0}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-medium disabled:opacity-50"
                                >
                                    Enroll
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SequenceEditorWrapper() {
    return (
        <AuthGuard>
            <SequenceEditorPage />
        </AuthGuard>
    );
}
