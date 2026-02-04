"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";

const TRIGGER_TYPES = [
    { id: "reply_positive", label: "Positive Reply", icon: "😊", description: "When lead responds positively" },
    { id: "reply_objection", label: "Objection Reply", icon: "🤔", description: "When lead raises an objection" },
    { id: "reply_not_now", label: "Not Now Reply", icon: "⏰", description: "When lead says timing is wrong" },
    { id: "reply_price", label: "Price Objection", icon: "💰", description: "When lead mentions price concerns" },
    { id: "reply_competitor", label: "Competitor Mention", icon: "🏢", description: "When lead mentions competitor" },
    { id: "reply_angry", label: "Angry Reply", icon: "😠", description: "When lead responds angrily" },
    { id: "no_reply_after", label: "No Reply After", icon: "📭", description: "After X days without reply" },
    { id: "demo_no_show", label: "Demo No-Show", icon: "🚫", description: "When lead misses scheduled demo" },
    { id: "proposal_sent", label: "Proposal Sent", icon: "📄", description: "When proposal is sent" },
    { id: "proposal_viewed", label: "Proposal Viewed", icon: "👀", description: "When proposal is viewed" },
    { id: "proposal_accepted", label: "Proposal Accepted", icon: "✅", description: "When proposal is accepted" },
    { id: "stage_change", label: "Stage Changed", icon: "🔄", description: "When deal stage changes" },
] as const;

const ACTION_TYPES = [
    { id: "create_deal", label: "Create Deal", icon: "💼", description: "Create a new deal in pipeline" },
    { id: "send_sequence", label: "Start Sequence", icon: "📧", description: "Enroll contact in sequence" },
    { id: "update_stage", label: "Update Stage", icon: "📊", description: "Move deal to different stage" },
    { id: "add_task", label: "Add Task", icon: "✅", description: "Create a follow-up task" },
    { id: "send_booking_link", label: "Send Booking Link", icon: "📅", description: "Send calendar booking link" },
    { id: "send_email", label: "Send Email", icon: "✉️", description: "Send a specific template" },
    { id: "notify_user", label: "Notify User", icon: "🔔", description: "Send notification to user" },
] as const;

function AutomationsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [editingRule, setEditingRule] = useState<Id<"automationRules"> | null>(null);
    const [showLogs, setShowLogs] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [triggerType, setTriggerType] = useState<string>("");
    const [actionType, setActionType] = useState<string>("");
    const [triggerConfig, setTriggerConfig] = useState<any>({});
    const [actionConfig, setActionConfig] = useState<any>({});

    const rules = useQuery(api.automations.list, {});
    const logs = useQuery(api.automations.getLogs, { limit: 50 });
    const stats = useQuery(api.automations.getStats, {});

    const createRule = useMutation(api.automations.create);
    const updateRule = useMutation(api.automations.update);
    const toggleRule = useMutation(api.automations.toggle);
    const deleteRule = useMutation(api.automations.remove);

    const resetForm = () => {
        setName("");
        setDescription("");
        setTriggerType("");
        setActionType("");
        setTriggerConfig({});
        setActionConfig({});
        setEditingRule(null);
        setShowCreate(false);
    };

    const handleEdit = (rule: any) => {
        setName(rule.name);
        setDescription(rule.description || "");
        setTriggerType(rule.triggerType);
        setActionType(rule.actionType);
        setTriggerConfig(rule.triggerConfig || {});
        setActionConfig(rule.actionConfig || {});
        setEditingRule(rule._id);
        setShowCreate(true);
    };

    const handleSave = async () => {
        if (!name || !triggerType || !actionType) return;

        if (editingRule) {
            await updateRule({
                id: editingRule,
                name,
                description: description || undefined,
                triggerType,
                actionType,
                triggerConfig,
                actionConfig,
            });
        } else {
            await createRule({
                name,
                description: description || undefined,
                triggerType,
                actionType,
                triggerConfig,
                actionConfig,
            });
        }
        resetForm();
    };

    const getTriggerInfo = (id: string) => TRIGGER_TYPES.find(t => t.id === id);
    const getActionInfo = (id: string) => ACTION_TYPES.find(a => a.id === id);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Automations</h1>
                        <p className="text-white/50 text-sm">Configure trigger-action rules for automatic pipeline updates</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showLogs
                                ? "bg-blue-600 text-white"
                                : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                        >
                            📋 Logs
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                        >
                            + New Rule
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
                        <div className="text-xs text-white/50">Total Rules</div>
                    </div>
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-green-400">{stats?.active || 0}</div>
                        <div className="text-xs text-white/50">Active</div>
                    </div>
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-blue-400">{stats?.executionsLast24h || 0}</div>
                        <div className="text-xs text-white/50">Executions (24h)</div>
                    </div>
                    <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold text-emerald-400">{stats?.successRate || 100}%</div>
                        <div className="text-xs text-white/50">Success Rate</div>
                    </div>
                </div>

                {showLogs ? (
                    /* Logs View */
                    <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h2 className="font-semibold text-white">Execution Log</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {logs?.length === 0 && (
                                <div className="text-center py-12 text-white/50">
                                    No automation executions yet
                                </div>
                            )}
                            {logs?.map((log) => (
                                <div key={log._id} className="p-4 hover:bg-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${log.success ? "bg-green-500" : "bg-red-500"}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{log.rule?.name || "Unknown Rule"}</span>
                                                <span className="text-white/40 text-sm">→</span>
                                                <span className="text-white/60 text-sm">{log.actionTaken}</span>
                                            </div>
                                            <div className="text-sm text-white/40 mt-1">
                                                Trigger: {log.triggerType} • Contact: {log.contact?.email || "Unknown"}
                                            </div>
                                        </div>
                                        <div className="text-sm text-white/40">{formatDate(log.triggeredAt)}</div>
                                    </div>
                                    {log.error && (
                                        <div className="mt-2 text-sm text-red-400 bg-red-500/10 rounded p-2">
                                            {log.error}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Rules List */
                    <div className="space-y-3">
                        {!rules && (
                            <div className="text-center py-12 text-white/50">Loading rules...</div>
                        )}

                        {rules?.length === 0 && (
                            <div className="text-center py-12 bg-[#12121a] border border-white/10 rounded-xl">
                                <div className="text-4xl mb-3">⚡</div>
                                <div className="text-white/50 mb-4">No automation rules yet</div>
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                                >
                                    Create Your First Rule
                                </button>
                            </div>
                        )}

                        {rules?.map((rule) => {
                            const trigger = getTriggerInfo(rule.triggerType);
                            const action = getActionInfo(rule.actionType);

                            return (
                                <div
                                    key={rule._id}
                                    className="bg-[#12121a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Toggle */}
                                        <button
                                            onClick={() => toggleRule({ id: rule._id })}
                                            className={`w-12 h-7 rounded-full transition-all relative ${rule.isActive ? "bg-green-600" : "bg-white/10"
                                                }`}
                                        >
                                            <div className={`absolute w-5 h-5 rounded-full bg-white top-1 transition-all ${rule.isActive ? "left-6" : "left-1"
                                                }`} />
                                        </button>

                                        {/* Flow Display */}
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg">
                                                <span className="text-lg">{trigger?.icon}</span>
                                                <span className="text-white text-sm">{trigger?.label}</span>
                                            </div>

                                            <div className="text-white/30">→</div>

                                            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">
                                                <span className="text-lg">{action?.icon}</span>
                                                <span className="text-blue-400 text-sm">{action?.label}</span>
                                            </div>
                                        </div>

                                        {/* Name & Actions */}
                                        <div className="text-right">
                                            <div className="text-white font-medium">{rule.name}</div>
                                            {rule.description && (
                                                <div className="text-white/40 text-sm">{rule.description}</div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(rule)}
                                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteRule({ id: rule._id })}
                                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Create/Edit Modal */}
                {showCreate && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">
                                    {editingRule ? "Edit Rule" : "Create Automation Rule"}
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Rule Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Positive Reply → Create Deal"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Description (optional)</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What does this rule do?"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                    />
                                </div>

                                {/* Trigger Type */}
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">When This Happens (Trigger)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {TRIGGER_TYPES.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTriggerType(t.id)}
                                                className={`p-3 rounded-lg text-left transition-all border ${triggerType === t.id
                                                    ? "bg-blue-500/20 border-blue-500/50"
                                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className="text-lg mb-1">{t.icon}</div>
                                                <div className="text-sm text-white font-medium">{t.label}</div>
                                                <div className="text-xs text-white/40 line-clamp-2">{t.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Trigger Config (for specific triggers) */}
                                {triggerType === "no_reply_after" && (
                                    <div>
                                        <label className="block text-sm text-white/70 mb-2">Days Without Reply</label>
                                        <input
                                            type="number"
                                            value={triggerConfig.days || ""}
                                            onChange={(e) => setTriggerConfig({ ...triggerConfig, days: parseInt(e.target.value) })}
                                            placeholder="3"
                                            className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                        />
                                    </div>
                                )}

                                {/* Action Type */}
                                <div>
                                    <label className="block text-sm text-white/70 mb-2">Do This (Action)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {ACTION_TYPES.map((a) => (
                                            <button
                                                key={a.id}
                                                onClick={() => setActionType(a.id)}
                                                className={`p-3 rounded-lg text-left transition-all border ${actionType === a.id
                                                    ? "bg-green-500/20 border-green-500/50"
                                                    : "bg-white/5 border-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className="text-lg mb-1">{a.icon}</div>
                                                <div className="text-sm text-white font-medium">{a.label}</div>
                                                <div className="text-xs text-white/40 line-clamp-2">{a.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Config (for specific actions) */}
                                {actionType === "update_stage" && (
                                    <div>
                                        <label className="block text-sm text-white/70 mb-2">Target Stage</label>
                                        <select
                                            value={actionConfig.targetStage || ""}
                                            onChange={(e) => setActionConfig({ ...actionConfig, targetStage: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500/50 focus:outline-none"
                                        >
                                            <option value="">Select stage...</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="replied">Replied</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="demo_booked">Demo Booked</option>
                                            <option value="proposal_sent">Proposal Sent</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="closed_won">Closed Won</option>
                                            <option value="closed_lost">Closed Lost</option>
                                        </select>
                                    </div>
                                )}

                                {actionType === "add_task" && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm text-white/70 mb-2">Task Title</label>
                                            <input
                                                type="text"
                                                value={actionConfig.taskTitle || ""}
                                                onChange={(e) => setActionConfig({ ...actionConfig, taskTitle: e.target.value })}
                                                placeholder="Follow up with contact"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-white/70 mb-2">Due in (days)</label>
                                            <input
                                                type="number"
                                                value={actionConfig.dueDays || ""}
                                                onChange={(e) => setActionConfig({ ...actionConfig, dueDays: parseInt(e.target.value) })}
                                                placeholder="1"
                                                className="w-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {actionType === "create_deal" && (
                                    <div>
                                        <label className="block text-sm text-white/70 mb-2">Default Deal Value ($)</label>
                                        <input
                                            type="number"
                                            value={actionConfig.dealValue || ""}
                                            onChange={(e) => setActionConfig({ ...actionConfig, dealValue: parseInt(e.target.value) })}
                                            placeholder="1000"
                                            className="w-48 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!name || !triggerType || !actionType}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
                                >
                                    {editingRule ? "Save Changes" : "Create Rule"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function AutomationsPageWrapper() {
    return (
        <AuthGuard>
            <AutomationsPage />
        </AuthGuard>
    );
}
