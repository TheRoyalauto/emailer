"use client";

import { useState, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageTransition, FadeInContainer } from "@/components/PageTransition";
import Link from "next/link";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { useSearchParams } from "next/navigation";

type SettingsSection = "profile" | "email-config" | "sending" | "brand" | "billing";

/* ─── Plan Data ──────────────────────────────── */
const plans = [
    {
        id: "starter",
        name: "Starter",
        description: "For individuals getting started with email outreach.",
        monthlyPrice: 29,
        yearlyPrice: 24,
        features: [
            "500 emails/month",
            "1 email account",
            "Basic AI writing",
            "Email tracking",
            "Standard support",
        ],
    },
    {
        id: "professional",
        name: "Professional",
        description: "For teams scaling their outreach operations.",
        monthlyPrice: 79,
        yearlyPrice: 66,
        features: [
            "5,000 emails/month",
            "5 email accounts",
            "Advanced AI writing",
            "Smart sequences",
            "A/B testing",
            "CRM integration",
            "Priority support",
        ],
        featured: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "For organizations with advanced needs.",
        monthlyPrice: 199,
        yearlyPrice: 166,
        features: [
            "Unlimited emails",
            "Unlimited accounts",
            "Custom AI training",
            "Advanced analytics",
            "Dedicated IP",
            "Custom integrations",
            "Dedicated account manager",
            "SSO & security",
        ],
    },
];

/* ─── Sidebar Navigation ─────────────────────── */
const sidebarSections: { id: SettingsSection; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: "profile",
        label: "Profile",
        description: "Your account details",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
    },
    {
        id: "email-config",
        label: "Email Config",
        description: "SMTP & sender setup",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
    },
    {
        id: "sending",
        label: "Send Limits",
        description: "Policies & warmup",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
    },
    {
        id: "brand",
        label: "Brand Rules",
        description: "AI voice & tone",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
        ),
    },
    {
        id: "billing",
        label: "Billing & Plans",
        description: "Subscription & usage",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
        ),
    },
];

function SettingsPage() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [activeSection, setActiveSection] = useState<SettingsSection>(
        (tabParam as SettingsSection) || "profile"
    );

    // Queries
    const smtpConfigs = useAuthQuery(api.smtpConfigs.list);
    const senders = useAuthQuery(api.senders.list);
    const sendPolicies = useAuthQuery(api.sendPolicies.list, {});
    const todayUsage = useAuthQuery(api.sendPolicies.getTodayUsage, {});

    // Send Policy mutations
    const createPolicy = useAuthMutation(api.sendPolicies.create);
    const updatePolicy = useAuthMutation(api.sendPolicies.update);
    const togglePolicy = useAuthMutation(api.sendPolicies.toggle);
    const deletePolicy = useAuthMutation(api.sendPolicies.remove);

    // Policy form state
    const [showPolicyForm, setShowPolicyForm] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Id<"sendPolicies"> | null>(null);
    const [policyForm, setPolicyForm] = useState({
        name: "Default Policy",
        dailySendLimit: 100,
        hourlySendLimit: 20,
        cooldownMinutes: 2,
        timezone: "America/New_York",
        businessHoursStart: 9,
        businessHoursEnd: 17,
        businessDays: [1, 2, 3, 4, 5],
        isWarmupMode: false,
        warmupDailyIncrement: 10,
        warmupMaxDaily: 500,
        maxBounceRate: 5,
        autoPauseOnBounce: true,
    });

    // Billing state
    const [isYearly, setIsYearly] = useState(false);
    const currentPlan = "starter"; // Would come from user subscription data

    // Sync URL param
    useEffect(() => {
        if (tabParam && sidebarSections.some(s => s.id === tabParam)) {
            setActiveSection(tabParam as SettingsSection);
        }
    }, [tabParam]);

    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const toggleDay = (day: number) => {
        const days = policyForm.businessDays.includes(day)
            ? policyForm.businessDays.filter(d => d !== day)
            : [...policyForm.businessDays, day].sort();
        setPolicyForm({ ...policyForm, businessDays: days });
    };

    const handleSavePolicy = async () => {
        if (editingPolicy) {
            await updatePolicy({ id: editingPolicy, ...policyForm, isActive: true });
        } else {
            await createPolicy({ ...policyForm, isActive: true });
        }
        setShowPolicyForm(false);
        setEditingPolicy(null);
    };

    const handleEditPolicy = (policy: NonNullable<typeof sendPolicies>[0]) => {
        setPolicyForm({
            name: policy.name,
            dailySendLimit: policy.dailySendLimit,
            hourlySendLimit: policy.hourlySendLimit || 20,
            cooldownMinutes: policy.cooldownMinutes || 2,
            timezone: policy.timezone,
            businessHoursStart: policy.businessHoursStart || 9,
            businessHoursEnd: policy.businessHoursEnd || 17,
            businessDays: policy.businessDays || [1, 2, 3, 4, 5],
            isWarmupMode: policy.isWarmupMode || false,
            warmupDailyIncrement: policy.warmupDailyIncrement || 10,
            warmupMaxDaily: policy.warmupMaxDaily || 500,
            maxBounceRate: policy.maxBounceRate || 5,
            autoPauseOnBounce: policy.autoPauseOnBounce ?? true,
        });
        setEditingPolicy(policy._id);
        setShowPolicyForm(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            <AppHeader />

            <PageTransition>
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <FadeInContainer>
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-[-0.03em]">
                                Settings
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Manage your account, email infrastructure, and billing.</p>
                        </div>

                        {/* Two-column layout — sidebar + content */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* ─── Left Sidebar ─── */}
                            <aside className="lg:w-56 flex-shrink-0">
                                <nav className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    {sidebarSections.map((section, i) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${i > 0 ? "border-t border-slate-100" : ""
                                                } ${activeSection === section.id
                                                    ? "bg-cyan-50 text-cyan-700 border-l-[3px] border-l-cyan-500"
                                                    : "text-slate-600 hover:bg-slate-50 border-l-[3px] border-l-transparent"
                                                }`}
                                        >
                                            <span className={activeSection === section.id ? "text-cyan-500" : "text-slate-400"}>
                                                {section.icon}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold truncate">{section.label}</div>
                                                <div className={`text-[11px] truncate ${activeSection === section.id ? "text-cyan-500/70" : "text-slate-400"}`}>
                                                    {section.description}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            {/* ─── Main Content ─── */}
                            <div className="flex-1 min-w-0">
                                {/* === PROFILE === */}
                                {activeSection === "profile" && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <h2 className="text-lg font-bold font-heading text-slate-900 mb-6">Profile Information</h2>
                                            <div className="space-y-5">
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Your name"
                                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                                        <input
                                                            type="email"
                                                            placeholder="your@email.com"
                                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Your company"
                                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                    />
                                                </div>
                                                <div className="flex justify-end pt-2">
                                                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors active:scale-[0.98]">
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
                                            <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">Danger Zone</h3>
                                            <p className="text-sm text-slate-500 mb-4">
                                                Permanently delete your account and all associated data. This action cannot be undone.
                                            </p>
                                            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* === EMAIL CONFIG === */}
                                {activeSection === "email-config" && (
                                    <div className="space-y-6">
                                        {/* SMTP Configs */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900">SMTP Configurations</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">Connect your email providers</p>
                                                </div>
                                                <Link
                                                    href="/smtp-settings"
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                                >
                                                    + Add Config
                                                </Link>
                                            </div>

                                            {smtpConfigs === undefined ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                                </div>
                                            ) : smtpConfigs.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                    <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                    </svg>
                                                    <p className="text-slate-500 font-medium">No email configurations yet</p>
                                                    <Link href="/smtp-settings" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium mt-2 inline-block">
                                                        Add your first config →
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {smtpConfigs.map((config) => (
                                                        <div key={config._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                                                                    <span className="text-lg">
                                                                        {config.provider === "resend" ? "📮" :
                                                                            config.provider === "sendgrid" ? "📬" :
                                                                                config.provider === "mailgun" ? "📨" : "📧"}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-sm text-slate-900">{config.name}</div>
                                                                    <div className="text-xs text-slate-400">{config.fromEmail}</div>
                                                                </div>
                                                            </div>
                                                            {config.isDefault && (
                                                                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 rounded-md text-xs font-semibold">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sender Identities */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900">Sender Identities</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">Your &quot;From&quot; addresses</p>
                                                </div>
                                                <Link
                                                    href="/senders"
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                                >
                                                    + Add Sender
                                                </Link>
                                            </div>

                                            {senders === undefined ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                                </div>
                                            ) : senders.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                    <p className="text-slate-500 font-medium">No senders configured</p>
                                                    <Link href="/senders" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium mt-2 inline-block">
                                                        Add your first sender →
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {senders.map((sender) => (
                                                        <div key={sender._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                            <div>
                                                                <div className="font-semibold text-sm text-slate-900">{sender.name}</div>
                                                                <div className="text-xs text-slate-400">{sender.email}</div>
                                                            </div>
                                                            {sender.isDefault && (
                                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-semibold">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* === SENDING / POLICIES === */}
                                {activeSection === "sending" && (
                                    <div className="space-y-6">
                                        {/* Usage Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { label: "Sent Today", value: todayUsage?.sent || 0, color: "text-emerald-500" },
                                                { label: "Remaining", value: todayUsage?.remaining || 0, color: "text-sky-500" },
                                                { label: "Policies", value: sendPolicies?.length || 0, color: "text-violet-500" },
                                                { label: "Active", value: sendPolicies?.filter(p => p.isActive).length || 0, color: "text-amber-500" },
                                            ].map((stat) => (
                                                <div key={stat.label} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                    <div className={`text-2xl font-bold font-heading tracking-[-0.03em] ${stat.color}`}>{stat.value}</div>
                                                    <div className="text-xs text-slate-400 font-medium mt-1">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Policy Form */}
                                        {showPolicyForm && (
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h3 className="text-lg font-bold font-heading text-slate-900">{editingPolicy ? "Edit" : "Create"} Send Policy</h3>
                                                    <button onClick={() => { setShowPolicyForm(false); setEditingPolicy(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Policy Name</label>
                                                            <input
                                                                type="text"
                                                                value={policyForm.name}
                                                                onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Daily Limit</label>
                                                                <input type="number" value={policyForm.dailySendLimit} onChange={(e) => setPolicyForm({ ...policyForm, dailySendLimit: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hourly Limit</label>
                                                                <input type="number" value={policyForm.hourlySendLimit} onChange={(e) => setPolicyForm({ ...policyForm, hourlySendLimit: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cooldown (min)</label>
                                                                <input type="number" value={policyForm.cooldownMinutes} onChange={(e) => setPolicyForm({ ...policyForm, cooldownMinutes: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Bounce %</label>
                                                                <input type="number" value={policyForm.maxBounceRate} onChange={(e) => setPolicyForm({ ...policyForm, maxBounceRate: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                            </div>
                                                        </div>

                                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                                            <input type="checkbox" checked={policyForm.autoPauseOnBounce} onChange={(e) => setPolicyForm({ ...policyForm, autoPauseOnBounce: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500/30" />
                                                            <span className="text-sm text-slate-700">Auto-pause on high bounce rate</span>
                                                        </label>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-2">Business Days</label>
                                                            <div className="flex gap-1.5">
                                                                {DAYS.map((day, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => toggleDay(i)}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${policyForm.businessDays.includes(i)
                                                                            ? "bg-cyan-50 text-cyan-600 border border-cyan-200"
                                                                            : "bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300"
                                                                            }`}
                                                                    >
                                                                        {day}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Hour</label>
                                                                <input type="number" min={0} max={23} value={policyForm.businessHoursStart} onChange={(e) => setPolicyForm({ ...policyForm, businessHoursStart: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">End Hour</label>
                                                                <input type="number" min={0} max={23} value={policyForm.businessHoursEnd} onChange={(e) => setPolicyForm({ ...policyForm, businessHoursEnd: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                            </div>
                                                        </div>

                                                        <div className="pt-2 border-t border-slate-200">
                                                            <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                                                                <input type="checkbox" checked={policyForm.isWarmupMode} onChange={(e) => setPolicyForm({ ...policyForm, isWarmupMode: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500/30" />
                                                                <span className="text-sm text-slate-700 font-medium">🔥 Warmup Mode</span>
                                                            </label>
                                                            {policyForm.isWarmupMode && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Daily Increment</label>
                                                                        <input type="number" value={policyForm.warmupDailyIncrement} onChange={(e) => setPolicyForm({ ...policyForm, warmupDailyIncrement: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Daily</label>
                                                                        <input type="number" value={policyForm.warmupMaxDaily} onChange={(e) => setPolicyForm({ ...policyForm, warmupMaxDaily: parseInt(e.target.value) || 0 })} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                                                    <button onClick={() => { setShowPolicyForm(false); setEditingPolicy(null); }} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
                                                    <button onClick={handleSavePolicy} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors active:scale-[0.98]">
                                                        {editingPolicy ? "Save Changes" : "Create Policy"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Policy List */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <h2 className="text-lg font-bold font-heading text-slate-900">Send Policies</h2>
                                                {!showPolicyForm && (
                                                    <button
                                                        onClick={() => setShowPolicyForm(true)}
                                                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                                    >
                                                        + Add Policy
                                                    </button>
                                                )}
                                            </div>

                                            {sendPolicies === undefined ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                                </div>
                                            ) : sendPolicies.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                    <p className="text-slate-500 font-medium">No send policies configured</p>
                                                    <button onClick={() => setShowPolicyForm(true)} className="text-cyan-500 hover:text-cyan-600 text-sm font-medium mt-2">
                                                        Create your first policy →
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {sendPolicies.map((policy) => (
                                                        <div key={policy._id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => togglePolicy({ id: policy._id })}
                                                                        className={`relative w-10 h-[22px] rounded-full transition-all ${policy.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                                                                    >
                                                                        <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all ${policy.isActive ? "left-[22px]" : "left-[3px]"}`} />
                                                                    </button>
                                                                    <span className="font-semibold text-sm text-slate-900">{policy.name}</span>
                                                                    {policy.isWarmupMode && (
                                                                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-semibold">🔥 Warmup</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <button onClick={() => handleEditPolicy(policy)} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Edit</button>
                                                                    <button onClick={() => deletePolicy({ id: policy._id })} className="text-red-400 hover:text-red-500 text-sm font-medium">Delete</button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                                                                <span>📤 {policy.dailySendLimit}/day</span>
                                                                <span>⏰ {policy.businessHoursStart || 9}–{policy.businessHoursEnd || 17}h</span>
                                                                <span>🌍 {policy.timezone}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* === BRAND RULES === */}
                                {activeSection === "brand" && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-lg font-bold font-heading text-slate-900">Brand Rules</h2>
                                                <p className="text-sm text-slate-400 mt-0.5">Configure AI voice, tone, and content rules</p>
                                            </div>
                                            <Link
                                                href="/brand-rules"
                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                            >
                                                Open Brand Rules →
                                            </Link>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            {[
                                                { icon: "🎨", title: "Voice & Tone", desc: "Define your brand personality" },
                                                { icon: "🚫", title: "Forbidden Phrases", desc: "Words AI should never use" },
                                                { icon: "📋", title: "Product Facts", desc: "Key info for accurate copy" },
                                            ].map((item) => (
                                                <div key={item.title} className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-center hover:border-slate-200 transition-colors">
                                                    <span className="text-2xl">{item.icon}</span>
                                                    <h4 className="font-semibold text-sm text-slate-900 mt-2">{item.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* === BILLING & PLANS === */}
                                {activeSection === "billing" && (
                                    <div className="space-y-6">
                                        {/* Current Plan */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900">Current Plan</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">You&apos;re on the <span className="font-semibold text-cyan-600">Starter</span> plan</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-semibold text-emerald-600">Active</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Monthly cost</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 tracking-[-0.03em]">$29</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Emails/month</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 tracking-[-0.03em]">500</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Next billing</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 tracking-[-0.03em]">Mar 1</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Plan Comparison */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-lg font-bold font-heading text-slate-900">Available Plans</h2>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-medium ${!isYearly ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
                                                    <button
                                                        onClick={() => setIsYearly(!isYearly)}
                                                        className={`relative w-11 h-6 rounded-full transition-colors ${isYearly ? "bg-cyan-500" : "bg-slate-300"}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isYearly ? "translate-x-6" : "translate-x-1"}`} />
                                                    </button>
                                                    <span className={`text-sm font-medium ${isYearly ? "text-slate-900" : "text-slate-400"}`}>
                                                        Yearly
                                                        <span className="ml-1 text-xs text-cyan-500 font-semibold">Save 17%</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4">
                                                {plans.map((plan) => {
                                                    const isCurrent = plan.id === currentPlan;
                                                    return (
                                                        <div
                                                            key={plan.id}
                                                            className={`relative rounded-xl p-5 border transition-all ${plan.featured
                                                                    ? "border-cyan-300 bg-cyan-50/30 shadow-md ring-1 ring-cyan-200/50"
                                                                    : isCurrent
                                                                        ? "border-slate-300 bg-slate-50"
                                                                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                                                                }`}
                                                        >
                                                            {plan.featured && (
                                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500 text-white text-[10px] font-bold tracking-wider rounded-full uppercase">
                                                                    Popular
                                                                </div>
                                                            )}
                                                            <h3 className="font-heading text-base font-bold text-slate-900 tracking-[-0.02em]">{plan.name}</h3>
                                                            <p className="text-xs text-slate-400 mt-1 mb-4">{plan.description}</p>

                                                            <div className="mb-4">
                                                                <span className="font-heading text-3xl font-bold text-slate-900 tracking-[-0.04em]">
                                                                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                                                </span>
                                                                <span className="text-xs text-slate-400 ml-1">/mo</span>
                                                            </div>

                                                            <button
                                                                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] ${isCurrent
                                                                        ? "bg-slate-200 text-slate-500 cursor-default"
                                                                        : plan.featured
                                                                            ? "bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm"
                                                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                                                    }`}
                                                                disabled={isCurrent}
                                                            >
                                                                {isCurrent ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                                                            </button>

                                                            <ul className="mt-4 pt-4 border-t border-slate-200 space-y-2.5">
                                                                {plan.features.map((feature, j) => (
                                                                    <li key={j} className="flex items-center gap-2">
                                                                        <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span className="text-xs text-slate-600">{feature}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-bold font-heading text-slate-900">Payment Method</h2>
                                                <button className="text-cyan-500 hover:text-cyan-600 text-sm font-medium">Update</button>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="w-12 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded flex items-center justify-center">
                                                    <span className="text-white text-[10px] font-bold">VISA</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">•••• •••• •••• 4242</div>
                                                    <div className="text-xs text-slate-400">Expires 12/2027</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Billing History */}
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                            <h2 className="text-lg font-bold font-heading text-slate-900 mb-4">Billing History</h2>
                                            <div className="text-center py-8">
                                                <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                                <p className="text-sm text-slate-500 font-medium">No invoices yet</p>
                                                <p className="text-xs text-slate-400 mt-1">Your billing history will appear here</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeInContainer>
                </main>
            </PageTransition>
        </div>
    );
}

export default function SettingsPageWrapper() {
    return (
        <AuthGuard>
            <SettingsPage />
        </AuthGuard>
    );
}
