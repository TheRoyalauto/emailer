"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

interface ContactDetailProps {
    contactId: Id<"contacts">;
    onClose: () => void;
}

const CALL_OUTCOMES = [
    { value: "answered", label: "✅ Answered", color: "#22c55e" },
    { value: "voicemail", label: "📞 Voicemail", color: "#f59e0b" },
    { value: "no_answer", label: "❌ No Answer", color: "#ef4444" },
    { value: "busy", label: "🔴 Busy", color: "#f97316" },
    { value: "wrong_number", label: "⚠️ Wrong Number", color: "#6b7280" },
    { value: "callback_requested", label: "🔄 Callback Requested", color: "#3b82f6" },
] as const;

const SALES_STAGES = [
    { value: "new", label: "New", color: "#6b7280" },
    { value: "contacted", label: "Contacted", color: "#3b82f6" },
    { value: "follow_up", label: "Follow Up", color: "#f59e0b" },
    { value: "qualified", label: "Qualified", color: "#8b5cf6" },
    { value: "closed_won", label: "Closed Won", color: "#22c55e" },
    { value: "closed_lost", label: "Closed Lost", color: "#ef4444" },
] as const;

export default function ContactDetail({ contactId, onClose }: ContactDetailProps) {
    const contact = useQuery(api.contacts.get, { id: contactId });
    const activities = useQuery(api.activities.getContactActivities, { contactId, limit: 50 });

    const logCall = useMutation(api.activities.logCall);
    const addNote = useMutation(api.activities.addNote);
    const updateStage = useMutation(api.activities.updateSalesStage);
    const scheduleFollowUp = useMutation(api.activities.scheduleFollowUp);

    // UI State
    const [showCallLog, setShowCallLog] = useState(false);
    const [callOutcome, setCallOutcome] = useState<typeof CALL_OUTCOMES[number]["value"]>("answered");
    const [callNotes, setCallNotes] = useState("");
    const [callFollowUp, setCallFollowUp] = useState("");
    const [loggingCall, setLoggingCall] = useState(false);

    const [showAddNote, setShowAddNote] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [addingNote, setAddingNote] = useState(false);

    const [showFollowUp, setShowFollowUp] = useState(false);
    const [followUpDate, setFollowUpDate] = useState("");
    const [followUpNotes, setFollowUpNotes] = useState("");
    const [schedulingFollowUp, setSchedulingFollowUp] = useState(false);

    if (!contact) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-[#12121f] rounded-2xl p-8">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    const handleLogCall = async () => {
        setLoggingCall(true);
        try {
            await logCall({
                contactId,
                outcome: callOutcome,
                notes: callNotes || undefined,
                followUpAt: callFollowUp ? new Date(callFollowUp).getTime() : undefined,
            });
            setShowCallLog(false);
            setCallNotes("");
            setCallFollowUp("");
        } catch (err) {
            console.error(err);
        } finally {
            setLoggingCall(false);
        }
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        setAddingNote(true);
        try {
            await addNote({ contactId, notes: noteText.trim() });
            setShowAddNote(false);
            setNoteText("");
        } catch (err) {
            console.error(err);
        } finally {
            setAddingNote(false);
        }
    };

    const handleScheduleFollowUp = async () => {
        if (!followUpDate) return;
        setSchedulingFollowUp(true);
        try {
            await scheduleFollowUp({
                contactId,
                followUpAt: new Date(followUpDate).getTime(),
                notes: followUpNotes || undefined,
            });
            setShowFollowUp(false);
            setFollowUpDate("");
            setFollowUpNotes("");
        } catch (err) {
            console.error(err);
        } finally {
            setSchedulingFollowUp(false);
        }
    };

    const handleStageChange = async (stage: typeof SALES_STAGES[number]["value"]) => {
        await updateStage({ contactId, stage });
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - timestamp;

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return date.toLocaleDateString();
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "email_sent": return "📧";
            case "email_opened": return "👁️";
            case "email_clicked": return "🔗";
            case "call_made": return "📞";
            case "voicemail_left": return "📞";
            case "note_added": return "📝";
            case "status_changed": return "🔄";
            case "follow_up_scheduled": return "⏰";
            default: return "•";
        }
    };

    const currentStage = SALES_STAGES.find(s => s.value === (contact.salesStage || "new")) || SALES_STAGES[0];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#12121f] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold">
                                {(contact.name || contact.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{contact.name || "Unknown"}</h2>
                                <p className="text-white/60">{contact.email}</p>
                                {contact.company && <p className="text-white/40 text-sm">{contact.company}</p>}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            ✕
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {/* Click to Call */}
                        {contact.phone && (
                            <a
                                href={`tel:${contact.phone}`}
                                onClick={() => setShowCallLog(true)}
                                className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2"
                            >
                                📞 Call {contact.phone}
                            </a>
                        )}
                        {/* Click to Email */}
                        <a
                            href={`mailto:${contact.email}`}
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                        >
                            📧 Email
                        </a>
                        {/* Add Note */}
                        <button
                            onClick={() => setShowAddNote(true)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            📝 Add Note
                        </button>
                        {/* Schedule Follow-up */}
                        <button
                            onClick={() => setShowFollowUp(true)}
                            className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-colors flex items-center gap-2"
                        >
                            ⏰ Follow-up
                        </button>
                    </div>
                </div>

                {/* Stats & Stage */}
                <div className="p-4 border-b border-white/10 flex-shrink-0 bg-white/[0.02]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{contact.emailCount || 0}</div>
                            <div className="text-xs text-white/50">Emails Sent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{contact.callCount || 0}</div>
                            <div className="text-xs text-white/50">Calls Made</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-medium">{contact.lastEmailAt ? formatDate(contact.lastEmailAt) : "Never"}</div>
                            <div className="text-xs text-white/50">Last Email</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-medium">{contact.lastCallAt ? formatDate(contact.lastCallAt) : "Never"}</div>
                            <div className="text-xs text-white/50">Last Call</div>
                        </div>
                    </div>

                    {/* Sales Stage */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white/50">Stage:</span>
                        {SALES_STAGES.map((stage) => (
                            <button
                                key={stage.value}
                                onClick={() => handleStageChange(stage.value)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${contact.salesStage === stage.value || (!contact.salesStage && stage.value === "new")
                                    ? "ring-2 ring-offset-2 ring-offset-[#12121f]"
                                    : "opacity-50 hover:opacity-100"
                                    }`}
                                style={{
                                    backgroundColor: `${stage.color}20`,
                                    color: stage.color,
                                }}
                            >
                                {stage.label}
                            </button>
                        ))}
                    </div>

                    {/* Next Follow-up Warning */}
                    {contact.nextFollowUpAt && (
                        <div className="mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm flex items-center gap-2">
                            ⏰ Follow-up scheduled: {new Date(contact.nextFollowUpAt).toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Activity Timeline */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-sm font-medium text-white/50 mb-4">Activity Timeline</h3>

                    {activities && activities.length > 0 ? (
                        <div className="space-y-3">
                            {activities.map((activity) => (
                                <div key={activity._id} className="flex gap-3 text-sm">
                                    <div className="text-lg">{getActivityIcon(activity.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium capitalize">
                                                {activity.type.replace(/_/g, " ")}
                                            </span>
                                            {activity.callOutcome && (
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs"
                                                    style={{
                                                        backgroundColor: `${CALL_OUTCOMES.find(o => o.value === activity.callOutcome)?.color}20`,
                                                        color: CALL_OUTCOMES.find(o => o.value === activity.callOutcome)?.color,
                                                    }}
                                                >
                                                    {activity.callOutcome.replace(/_/g, " ")}
                                                </span>
                                            )}
                                            <span className="text-white/40">{formatDate(activity.createdAt)}</span>
                                        </div>
                                        {activity.notes && (
                                            <p className="text-white/60 mt-1">{activity.notes}</p>
                                        )}
                                        {activity.followUpAt && (
                                            <p className="text-amber-400 text-xs mt-1">
                                                Follow-up: {new Date(activity.followUpAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-white/40">
                            <p className="text-4xl mb-2">📋</p>
                            <p>No activity yet</p>
                            <p className="text-sm">Call or email this contact to start tracking</p>
                        </div>
                    )}
                </div>

                {/* Call Log Modal */}
                {showCallLog && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-md border border-white/10">
                            <h3 className="text-lg font-bold mb-4">Log Call Outcome</h3>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {CALL_OUTCOMES.map((outcome) => (
                                    <button
                                        key={outcome.value}
                                        onClick={() => setCallOutcome(outcome.value)}
                                        className={`p-3 rounded-lg text-sm font-medium transition-all ${callOutcome === outcome.value
                                            ? "ring-2 ring-offset-2 ring-offset-[#1a1a2e]"
                                            : "opacity-60 hover:opacity-100"
                                            }`}
                                        style={{
                                            backgroundColor: `${outcome.color}20`,
                                            color: outcome.color,
                                        }}
                                    >
                                        {outcome.label}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                placeholder="Call notes (optional)"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg mb-4 resize-none h-24"
                            />

                            <div className="mb-4">
                                <label className="text-sm text-white/50 mb-1 block">Schedule follow-up</label>
                                <input
                                    type="datetime-local"
                                    value={callFollowUp}
                                    onChange={(e) => setCallFollowUp(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCallLog(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogCall}
                                    disabled={loggingCall}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {loggingCall ? "Saving..." : "Save Call Log"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Note Modal */}
                {showAddNote && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-md border border-white/10">
                            <h3 className="text-lg font-bold mb-4">Add Note</h3>

                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Enter your note..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg mb-4 resize-none h-32"
                                autoFocus
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddNote(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddNote}
                                    disabled={addingNote || !noteText.trim()}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {addingNote ? "Saving..." : "Save Note"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Follow-up Modal */}
                {showFollowUp && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4">
                        <div className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-md border border-white/10">
                            <h3 className="text-lg font-bold mb-4">Schedule Follow-up</h3>

                            <div className="mb-4">
                                <label className="text-sm text-white/50 mb-1 block">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={followUpDate}
                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                                />
                            </div>

                            <textarea
                                value={followUpNotes}
                                onChange={(e) => setFollowUpNotes(e.target.value)}
                                placeholder="Reminder notes (optional)"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg mb-4 resize-none h-24"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowFollowUp(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScheduleFollowUp}
                                    disabled={schedulingFollowUp || !followUpDate}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {schedulingFollowUp ? "Scheduling..." : "Schedule"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
