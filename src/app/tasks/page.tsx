"use client";

import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

const PRIORITIES = [
    { id: "urgent", label: "Urgent", color: "text-red-400 bg-red-500/20" },
    { id: "high", label: "High", color: "text-orange-400 bg-orange-500/20" },
    { id: "medium", label: "Medium", color: "text-yellow-400 bg-yellow-500/20" },
    { id: "low", label: "Low", color: "text-green-400 bg-green-500/20" },
] as const;

const TASK_TYPES = [
    { id: "follow_up", label: "Follow Up", icon: "📤" },
    { id: "call", label: "Call", icon: "📞" },
    { id: "email", label: "Email", icon: "✉️" },
    { id: "meeting", label: "Meeting", icon: "📅" },
    { id: "proposal", label: "Proposal", icon: "📋" },
    { id: "other", label: "Other", icon: "📌" },
] as const;

const STATUSES = [
    { id: "pending", label: "Pending", color: "bg-slate-500" },
    { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
    { id: "completed", label: "Completed", color: "bg-emerald-500" },
] as const;

export default function TasksPage() {
    return (
        <AuthGuard>
            <TasksContent />
        </AuthGuard>
    );
}

function TasksContent() {
    const [view, setView] = useState<"list" | "kanban">("list");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const [includeCompleted, setIncludeCompleted] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        taskType: "",
        dueDate: "",
        dueTime: "",
    });

    const tasks = useAuthQuery(api.tasks.list, { includeCompleted });
    const stats = useAuthQuery(api.tasks.getStats, {});
    const upcoming = useAuthQuery(api.tasks.getUpcoming, {});

    const createTask = useAuthMutation(api.tasks.create);
    const quickComplete = useAuthMutation(api.tasks.quickComplete);
    const setStatus = useAuthMutation(api.tasks.setStatus);
    const deleteTask = useAuthMutation(api.tasks.remove);

    const resetForm = () => {
        setFormData({ title: "", description: "", priority: "medium", taskType: "", dueDate: "", dueTime: "" });
        setShowCreateModal(false);
    };

    const handleCreate = async () => {
        if (!formData.title) return;

        // Convert date string to timestamp
        let dueAt: number | undefined;
        if (formData.dueDate) {
            const d = new Date(formData.dueDate);
            if (formData.dueTime) {
                const [hours, minutes] = formData.dueTime.split(":").map(Number);
                d.setHours(hours, minutes);
            }
            dueAt = d.getTime();
        }

        await createTask({
            title: formData.title,
            description: formData.description || undefined,
            priority: formData.priority || undefined,
            taskType: formData.taskType || undefined,
            dueAt,
        });
        resetForm();
    };

    const handleComplete = async (id: Id<"tasks">) => {
        await quickComplete({ id });
    };

    const handleStatusChange = async (id: Id<"tasks">, status: string) => {
        await setStatus({ id, status });
    };

    const handleDelete = async (id: Id<"tasks">) => {
        if (confirm("Delete this task?")) {
            await deleteTask({ id });
        }
    };

    const filteredTasks = tasks?.filter(task => {
        if (filter === "all") return true;
        if (filter === "overdue" && task.dueAt && task.dueAt < Date.now()) return true;
        if (filter === task.priority) return true;
        if (filter === task.status) return true;
        return false;
    }) || [];

    const getPriorityStyle = (priority: string) => {
        return PRIORITIES.find(p => p.id === priority)?.color || "text-slate-500 bg-slate-50";
    };

    const getTaskTypeInfo = (type?: string) => {
        return TASK_TYPES.find(t => t.id === type) || { icon: "📌", label: "Task" };
    };

    const formatDueDate = (date?: number) => {
        if (!date) return null;
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.ceil((date - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: "text-red-400" };
        if (diffDays === 0) return { text: "Today", color: "text-amber-400" };
        if (diffDays === 1) return { text: "Tomorrow", color: "text-blue-400" };
        if (diffDays <= 7) return { text: `${diffDays}d`, color: "text-slate-500" };
        return { text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "text-slate-400" };
    };

    // Group tasks by status for Kanban
    const tasksByStatus = {
        pending: filteredTasks.filter(t => t.status === "pending"),
        in_progress: filteredTasks.filter(t => t.status === "in_progress"),
        completed: filteredTasks.filter(t => t.status === "completed"),
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Tasks</h1>
                        <p className="text-slate-500 text-sm">Manage follow-ups, reminders, and to-dos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex bg-white rounded-lg p-1">
                            <button
                                onClick={() => setView("list")}
                                className={`px-3 py-1 rounded text-sm font-medium transition-all ${view === "list" ? "bg-slate-50 text-white" : "text-slate-500"}`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setView("kanban")}
                                className={`px-3 py-1 rounded text-sm font-medium transition-all ${view === "kanban" ? "bg-slate-50 text-white" : "text-slate-500"}`}
                            >
                                Kanban
                            </button>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                        >
                            + Add Task
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <div className="p-4 bg-[#12121a] border border-slate-200 rounded-xl">
                        <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
                        <div className="text-sm text-slate-500">Active</div>
                    </div>
                    <div className="p-4 bg-[#12121a] border border-slate-200 rounded-xl">
                        <div className="text-2xl font-bold text-amber-400">{stats?.pending || 0}</div>
                        <div className="text-sm text-slate-500">Pending</div>
                    </div>
                    <div className="p-4 bg-[#12121a] border border-slate-200 rounded-xl">
                        <div className="text-2xl font-bold text-blue-400">{stats?.inProgress || 0}</div>
                        <div className="text-sm text-slate-500">In Progress</div>
                    </div>
                    <div className="p-4 bg-[#12121a] border border-slate-200 rounded-xl">
                        <div className="text-2xl font-bold text-red-400">{stats?.overdue || 0}</div>
                        <div className="text-sm text-slate-500">Overdue</div>
                    </div>
                    <div className="p-4 bg-[#12121a] border border-slate-200 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-400">{stats?.completedToday || 0}</div>
                        <div className="text-sm text-slate-500">Done Today</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="flex bg-white rounded-lg p-1">
                        {["all", "pending", "in_progress", "overdue"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-all ${filter === f ? "bg-slate-50 text-white" : "text-slate-500"}`}
                            >
                                {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-500">
                        <input
                            type="checkbox"
                            checked={includeCompleted}
                            onChange={(e) => setIncludeCompleted(e.target.checked)}
                            className="rounded"
                        />
                        Show Completed
                    </label>
                </div>

                {/* List View */}
                {view === "list" && (
                    <div className="space-y-2">
                        {filteredTasks.length === 0 && (
                            <div className="bg-[#12121a] border border-slate-200 rounded-xl p-12 text-center">
                                <div className="text-4xl mb-4">✅</div>
                                <h3 className="text-lg font-medium text-white mb-2">No Tasks</h3>
                                <p className="text-slate-500 text-sm mb-4">Create your first task to get started</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium"
                                >
                                    + Add Task
                                </button>
                            </div>
                        )}

                        {filteredTasks.map((task) => {
                            const dueInfo = formatDueDate(task.dueAt);
                            const typeInfo = getTaskTypeInfo(task.taskType);

                            return (
                                <div
                                    key={task._id}
                                    className={`bg-[#12121a] border border-slate-200 rounded-xl p-4 hover:border-slate-200 transition-all ${task.status === "completed" ? "opacity-60" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Complete Checkbox */}
                                        <button
                                            onClick={() => handleComplete(task._id)}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === "completed"
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-white/30 hover:border-emerald-400"
                                                }`}
                                        >
                                            {task.status === "completed" && <span className="text-xs">✓</span>}
                                        </button>

                                        {/* Task Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{typeInfo.icon}</span>
                                                <span className={`font-medium ${task.status === "completed" ? "line-through text-slate-500" : "text-white"}`}>
                                                    {task.title}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityStyle(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-slate-500 truncate">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-1 text-xs">
                                                {task.contact && (
                                                    <span className="text-slate-400">👤 {task.contact.name || task.contact.email}</span>
                                                )}
                                                {task.deal && (
                                                    <span className="text-slate-400">💼 {task.deal.name}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Due Date */}
                                        {dueInfo && (
                                            <div className={`text-sm font-medium ${dueInfo.color}`}>
                                                {dueInfo.text}
                                            </div>
                                        )}

                                        {/* Status Dropdown */}
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            className="px-2 py-1 bg-white border border-slate-200 rounded text-sm text-slate-700"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s.id} value={s.id}>{s.label}</option>
                                            ))}
                                        </select>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(task._id)}
                                            className="text-slate-400 hover:text-red-400 transition-colors"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Kanban View */}
                {view === "kanban" && (
                    <div className="grid grid-cols-3 gap-4">
                        {STATUSES.map((status) => (
                            <div key={status.id} className="bg-[#12121a] border border-slate-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                                    <span className="font-medium text-white">{status.label}</span>
                                    <span className="text-slate-400 text-sm">
                                        ({tasksByStatus[status.id as keyof typeof tasksByStatus]?.length || 0})
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {tasksByStatus[status.id as keyof typeof tasksByStatus]?.map((task) => {
                                        const dueInfo = formatDueDate(task.dueAt);
                                        const typeInfo = getTaskTypeInfo(task.taskType);

                                        return (
                                            <div
                                                key={task._id}
                                                className="p-3 bg-black/30 rounded-lg hover:bg-black/40 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-start gap-2 mb-2">
                                                    <span className="text-sm">{typeInfo.icon}</span>
                                                    <span className="text-sm font-medium text-white">{task.title}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                    {dueInfo && (
                                                        <span className={`text-xs ${dueInfo.color}`}>{dueInfo.text}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#12121a] border border-slate-200 rounded-2xl w-full max-w-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Create Task</h2>
                            <button onClick={resetForm} className="text-slate-500 hover:text-slate-900">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="What needs to be done?"
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-white placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Add more details..."
                                    rows={2}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-white placeholder:text-slate-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-white"
                                    >
                                        {PRIORITIES.map((p) => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-slate-700 mb-1">Type</label>
                                    <select
                                        value={formData.taskType}
                                        onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-white"
                                    >
                                        <option value="">Select...</option>
                                        {TASK_TYPES.map((t) => (
                                            <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={formData.dueTime}
                                        onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                            <button onClick={resetForm} className="px-4 py-2 text-slate-500 hover:text-slate-900">Cancel</button>
                            <button
                                onClick={handleCreate}
                                disabled={!formData.title}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
