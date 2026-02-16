"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { PageTransition, FadeInContainer } from "@/components/PageTransition";
import Link from "next/link";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { useFeatureGate, getTierDisplayName, type Tier } from "@/hooks/useFeatureGate";

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
    const { userName, userEmail } = useAuth();
    const [activeSection, setActiveSection] = useState<SettingsSection>(
        (tabParam as SettingsSection) || "profile"
    );

    // Queries
    const smtpConfigs = useAuthQuery(api.smtpConfigs.list);
    const senders = useAuthQuery(api.senders.list);
    const sendPolicies = useAuthQuery(api.sendPolicies.list, {});
    const todayUsage = useAuthQuery(api.sendPolicies.getTodayUsage, {});
    const brandRules = useAuthQuery(api.brandRules.list);

    // Send Policy mutations
    const createPolicy = useAuthMutation(api.sendPolicies.create);
    const updatePolicy = useAuthMutation(api.sendPolicies.update);
    const togglePolicy = useAuthMutation(api.sendPolicies.toggle);
    const deletePolicy = useAuthMutation(api.sendPolicies.remove);

    // Brand Rules mutations
    const createBrandRule = useAuthMutation(api.brandRules.create);
    const updateBrandRule = useAuthMutation(api.brandRules.update);
    const deleteBrandRule = useAuthMutation(api.brandRules.remove);

    // Profile state — wired to real user data
    const [profileName, setProfileName] = useState("");
    const [profileCompany, setProfileCompany] = useState("");
    const [profileSaved, setProfileSaved] = useState(false);
    const [showEmailTicketModal, setShowEmailTicketModal] = useState(false);
    const [emailTicketReason, setEmailTicketReason] = useState("");
    const [emailTicketNewEmail, setEmailTicketNewEmail] = useState("");
    const [emailTicketSent, setEmailTicketSent] = useState(false);

    // Sync profile from auth
    useEffect(() => {
        if (userName) setProfileName(userName);
    }, [userName]);

    // Brand Rules state
    const [showBrandForm, setShowBrandForm] = useState(false);
    const [editingBrandRule, setEditingBrandRule] = useState<Id<"emailBrandRules"> | null>(null);
    const [brandForm, setBrandForm] = useState({
        name: "Default",
        voiceDescription: "",
        forbiddenPhrases: "",
        requiredPhrases: "",
        companyName: "",
        senderPersona: "",
        productFacts: "",
        maxParagraphs: 4,
        maxSubjectLength: 60,
        signatureTemplate: "",
        isDefault: true,
    });

    const resetBrandForm = useCallback(() => {
        setBrandForm({ name: "Default", voiceDescription: "", forbiddenPhrases: "", requiredPhrases: "", companyName: "", senderPersona: "", productFacts: "", maxParagraphs: 4, maxSubjectLength: 60, signatureTemplate: "", isDefault: true });
        setEditingBrandRule(null);
    }, []);

    const handleSaveBrandRule = async () => {
        const forbiddenArr = brandForm.forbiddenPhrases.split("\n").map(s => s.trim()).filter(Boolean);
        const requiredArr = brandForm.requiredPhrases.split("\n").map(s => s.trim()).filter(Boolean);
        const factsArr = brandForm.productFacts.split("\n").map(s => s.trim()).filter(Boolean).map(f => ({ fact: f }));

        if (editingBrandRule) {
            await updateBrandRule({ id: editingBrandRule, name: brandForm.name, voiceDescription: brandForm.voiceDescription, forbiddenPhrases: forbiddenArr, requiredPhrases: requiredArr, productFacts: factsArr, companyName: brandForm.companyName, senderPersona: brandForm.senderPersona, maxParagraphs: brandForm.maxParagraphs, maxSubjectLength: brandForm.maxSubjectLength, signatureTemplate: brandForm.signatureTemplate, isDefault: brandForm.isDefault });
        } else {
            await createBrandRule({ name: brandForm.name, voiceDescription: brandForm.voiceDescription, forbiddenPhrases: forbiddenArr, requiredPhrases: requiredArr, productFacts: factsArr, companyName: brandForm.companyName, senderPersona: brandForm.senderPersona, maxParagraphs: brandForm.maxParagraphs, maxSubjectLength: brandForm.maxSubjectLength, signatureTemplate: brandForm.signatureTemplate, isDefault: brandForm.isDefault });
        }
        setShowBrandForm(false);
        resetBrandForm();
    };

    const handleEditBrandRule = (rule: NonNullable<typeof brandRules>[0]) => {
        setBrandForm({
            name: rule.name,
            voiceDescription: rule.voiceDescription || "",
            forbiddenPhrases: (rule.forbiddenPhrases || []).join("\n"),
            requiredPhrases: (rule.requiredPhrases || []).join("\n"),
            companyName: rule.companyName || "",
            senderPersona: rule.senderPersona || "",
            productFacts: (rule.productFacts || []).map((f: { fact: string }) => f.fact).join("\n"),
            maxParagraphs: rule.maxParagraphs || 4,
            maxSubjectLength: rule.maxSubjectLength || 60,
            signatureTemplate: rule.signatureTemplate || "",
            isDefault: rule.isDefault || false,
        });
        setEditingBrandRule(rule._id);
        setShowBrandForm(true);
    };

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

    // Billing state — wired to real user profile
    const [isYearly, setIsYearly] = useState(false);
    const featureGate = useFeatureGate();
    const currentPlan = featureGate.tier;

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0">
            <AppHeader />

            <PageTransition>
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <FadeInContainer>
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                Settings
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Manage your account, email infrastructure, and billing.</p>
                        </div>

                        {/* Two-column layout — sidebar + content */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* ─── Left Sidebar ─── */}
                            <aside className="lg:w-56 flex-shrink-0">
                                <nav className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                    {sidebarSections.map((section, i) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${i > 0 ? "border-t border-slate-100 dark:border-slate-800" : ""
                                                } ${activeSection === section.id
                                                    ? "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 border-l-[3px] border-l-cyan-500"
                                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-l-[3px] border-l-transparent"
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
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-6">Profile Information</h2>
                                            <div className="space-y-5">
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                                        <input
                                                            type="text"
                                                            value={profileName}
                                                            onChange={(e) => { setProfileName(e.target.value); setProfileSaved(false); }}
                                                            placeholder="Your name"
                                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                                                        <div className="relative">
                                                            <input
                                                                type="email"
                                                                value={userEmail || ""}
                                                                className="w-full px-3.5 py-2.5 pr-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                                                                disabled
                                                            />
                                                            <button
                                                                onClick={() => setShowEmailTicketModal(true)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded-md text-xs font-semibold hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 mt-1">Email changes require support verification</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company</label>
                                                    <input
                                                        type="text"
                                                        value={profileCompany}
                                                        onChange={(e) => { setProfileCompany(e.target.value); setProfileSaved(false); }}
                                                        placeholder="Your company"
                                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-end gap-3 pt-2">
                                                    {profileSaved && (
                                                        <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                            Saved
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => setProfileSaved(true)}
                                                        className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98]"
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm p-6">
                                            <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">Danger Zone</h3>
                                            <p className="text-sm text-slate-500 mb-4">
                                                Permanently delete your account and all associated data. This action cannot be undone.
                                            </p>
                                            <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                                Delete Account
                                            </button>
                                        </div>

                                        {/* Email Change Support Ticket Modal */}
                                        {showEmailTicketModal && (
                                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowEmailTicketModal(false); setEmailTicketSent(false); }}>
                                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                                                    {emailTicketSent ? (
                                                        <div className="text-center py-4">
                                                            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center mb-4">
                                                                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                                            </div>
                                                            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Request Submitted</h3>
                                                            <p className="text-sm text-slate-500 mt-2">Our support team will verify your identity and process the email change within 24–48 hours.</p>
                                                            <button onClick={() => { setShowEmailTicketModal(false); setEmailTicketSent(false); setEmailTicketReason(""); setEmailTicketNewEmail(""); }} className="mt-5 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                                                                Done
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center justify-between mb-5">
                                                                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Request Email Change</h3>
                                                                <button onClick={() => setShowEmailTicketModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg mb-5">
                                                                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">⚠️ For security, email changes are processed by our support team with identity verification.</p>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Email</label>
                                                                    <input type="email" value={userEmail || ""} disabled className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed text-sm" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Email Address</label>
                                                                    <input type="email" value={emailTicketNewEmail} onChange={(e) => setEmailTicketNewEmail(e.target.value)} placeholder="new@email.com" className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Reason for change</label>
                                                                    <textarea value={emailTicketReason} onChange={(e) => setEmailTicketReason(e.target.value)} placeholder="Let us know why you need to change your email..." rows={3} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm resize-none" />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                                <button onClick={() => setShowEmailTicketModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
                                                                <button
                                                                    onClick={() => setEmailTicketSent(true)}
                                                                    disabled={!emailTicketNewEmail.trim()}
                                                                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Submit Request
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* === EMAIL CONFIG === */}
                                {activeSection === "email-config" && (
                                    <div className="space-y-6">
                                        {/* SMTP Configs */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">SMTP Configurations</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">Connect your email providers</p>
                                                </div>
                                                <Link
                                                    href="/accounts"
                                                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                                                >
                                                    + Add Config
                                                </Link>
                                            </div>

                                            {smtpConfigs === undefined ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                                </div>
                                            ) : smtpConfigs.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                                    <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                    </svg>
                                                    <p className="text-slate-500 font-medium">No email configurations yet</p>
                                                    <Link href="/accounts" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium mt-2 inline-block">
                                                        Add your first config →
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {smtpConfigs.map((config) => (
                                                        <div key={config._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                                                                    <span className="text-lg">
                                                                        {config.provider === "resend" ? "📮" :
                                                                            config.provider === "sendgrid" ? "📬" :
                                                                                config.provider === "mailgun" ? "📨" : "📧"}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{config.name}</div>
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
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Sender Identities</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">Your &quot;From&quot; addresses</p>
                                                </div>
                                                <Link
                                                    href="/senders"
                                                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                                                >
                                                    + Add Sender
                                                </Link>
                                            </div>

                                            {senders === undefined ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                                </div>
                                            ) : senders.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                                    <p className="text-slate-500 font-medium">No senders configured</p>
                                                    <Link href="/senders" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium mt-2 inline-block">
                                                        Add your first sender →
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {senders.map((sender) => (
                                                        <div key={sender._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 transition-colors">
                                                            <div>
                                                                <div className="font-semibold text-sm text-slate-900 dark:text-white">{sender.name}</div>
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
                                                <div key={stat.label} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    <div className={`text-2xl font-bold font-heading tracking-[-0.03em] ${stat.color}`}>{stat.value}</div>
                                                    <div className="text-xs text-slate-400 font-medium mt-1">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Policy Form */}
                                        {showPolicyForm && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">{editingPolicy ? "Edit" : "Create"} Send Policy</h3>
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
                                                    <button onClick={handleSavePolicy} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98]">
                                                        {editingPolicy ? "Save Changes" : "Create Policy"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Policy List */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Send Policies</h2>
                                                {!showPolicyForm && (
                                                    <button
                                                        onClick={() => setShowPolicyForm(true)}
                                                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
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
                                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                                    <p className="text-slate-500 font-medium">No send policies configured</p>
                                                    <button onClick={() => setShowPolicyForm(true)} className="text-cyan-500 hover:text-cyan-600 text-sm font-medium mt-2">
                                                        Create your first policy →
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {sendPolicies.map((policy) => (
                                                        <div key={policy._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => togglePolicy({ id: policy._id })}
                                                                        className={`relative w-10 h-[22px] rounded-full transition-all ${policy.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                                                                    >
                                                                        <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all ${policy.isActive ? "left-[22px]" : "left-[3px]"}`} />
                                                                    </button>
                                                                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{policy.name}</span>
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
                                    <div className="space-y-6">
                                        {/* Brand Form */}
                                        {showBrandForm && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">{editingBrandRule ? "Edit" : "Create"} Brand Rule</h3>
                                                    <button onClick={() => { setShowBrandForm(false); resetBrandForm(); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                                <div className="space-y-5">
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rule Name</label>
                                                            <input type="text" value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} placeholder="e.g. Professional Outreach" className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                                                            <input type="text" value={brandForm.companyName} onChange={(e) => setBrandForm({ ...brandForm, companyName: e.target.value })} placeholder="Your company" className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">🎨 Voice & Tone</label>
                                                        <textarea value={brandForm.voiceDescription} onChange={(e) => setBrandForm({ ...brandForm, voiceDescription: e.target.value })} placeholder="Describe your brand voice. E.g. 'Professional but approachable, confident without being pushy. Use data-driven language.'" rows={3} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm resize-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">👤 Sender Persona</label>
                                                        <input type="text" value={brandForm.senderPersona} onChange={(e) => setBrandForm({ ...brandForm, senderPersona: e.target.value })} placeholder="e.g. Sales Director, Growth Consultant" className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm" />
                                                    </div>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">🚫 Forbidden Phrases <span className="text-slate-400 font-normal">(one per line)</span></label>
                                                            <textarea value={brandForm.forbiddenPhrases} onChange={(e) => setBrandForm({ ...brandForm, forbiddenPhrases: e.target.value })} placeholder={"synergy\ntouch base\nlow-hanging fruit"} rows={4} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm resize-none font-mono" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">✅ Required Phrases <span className="text-slate-400 font-normal">(one per line)</span></label>
                                                            <textarea value={brandForm.requiredPhrases} onChange={(e) => setBrandForm({ ...brandForm, requiredPhrases: e.target.value })} placeholder={"Your brand name\nKey product term"} rows={4} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm resize-none font-mono" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">📋 Product Facts <span className="text-slate-400 font-normal">(one per line)</span></label>
                                                        <textarea value={brandForm.productFacts} onChange={(e) => setBrandForm({ ...brandForm, productFacts: e.target.value })} placeholder={"We help customers save 30% on average\nAI-powered automation included\nTrusted by 500+ businesses"} rows={4} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm resize-none font-mono" />
                                                    </div>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max Paragraphs</label>
                                                            <input type="number" min={1} max={10} value={brandForm.maxParagraphs} onChange={(e) => setBrandForm({ ...brandForm, maxParagraphs: parseInt(e.target.value) || 4 })} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max Subject Length</label>
                                                            <input type="number" min={10} max={200} value={brandForm.maxSubjectLength} onChange={(e) => setBrandForm({ ...brandForm, maxSubjectLength: parseInt(e.target.value) || 60 })} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">✍️ Signature Template</label>
                                                        <textarea value={brandForm.signatureTemplate} onChange={(e) => setBrandForm({ ...brandForm, signatureTemplate: e.target.value })} placeholder={"Best regards,\n{{name}}\n{{company}}"} rows={3} className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-sm resize-none font-mono" />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button onClick={() => setBrandForm({ ...brandForm, isDefault: !brandForm.isDefault })} className={`relative w-11 h-6 rounded-full transition-colors ${brandForm.isDefault ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${brandForm.isDefault ? "translate-x-6" : "translate-x-1"}`} />
                                                        </button>
                                                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Set as default rule</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                    <button onClick={() => { setShowBrandForm(false); resetBrandForm(); }} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
                                                    <button onClick={handleSaveBrandRule} disabled={!brandForm.name.trim()} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {editingBrandRule ? "Save Changes" : "Create Rule"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Brand Rules List */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-5">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Brand Rules</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">Configure AI voice, tone, and content rules</p>
                                                </div>
                                                {!showBrandForm && (
                                                    <button onClick={() => setShowBrandForm(true)} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                                                        + Add Rule
                                                    </button>
                                                )}
                                            </div>

                                            {!brandRules ? (
                                                <div className="flex justify-center py-8"><div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full" /></div>
                                            ) : brandRules.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                                    <span className="text-3xl">🎨</span>
                                                    <p className="text-slate-500 font-medium mt-3">No brand rules configured</p>
                                                    <p className="text-xs text-slate-400 mt-1">Brand rules tell AI how to write emails in your voice</p>
                                                    <button onClick={() => setShowBrandForm(true)} className="text-cyan-500 hover:text-cyan-600 text-sm font-medium mt-3">Create your first rule →</button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {brandRules.map((rule) => (
                                                        <div key={rule._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-slate-200 transition-colors">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{rule.name}</span>
                                                                    {rule.isDefault && <span className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded text-xs font-semibold">Default</span>}
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <button onClick={() => handleEditBrandRule(rule)} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Edit</button>
                                                                    <button onClick={() => deleteBrandRule({ id: rule._id })} className="text-red-400 hover:text-red-500 text-sm font-medium">Delete</button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap gap-3 text-xs text-slate-400 font-medium">
                                                                {rule.voiceDescription && <span className="truncate max-w-[200px]">🎨 {rule.voiceDescription}</span>}
                                                                {rule.forbiddenPhrases && rule.forbiddenPhrases.length > 0 && <span>🚫 {rule.forbiddenPhrases.length} forbidden</span>}
                                                                {rule.productFacts && rule.productFacts.length > 0 && <span>📋 {rule.productFacts.length} facts</span>}
                                                                {rule.companyName && <span>🏢 {rule.companyName}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* === BILLING & PLANS === */}
                                {activeSection === "billing" && (
                                    <div className="space-y-6">
                                        {/* Current Plan */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Current Plan</h2>
                                                    <p className="text-sm text-slate-400 mt-0.5">You&apos;re on the <span className="font-semibold text-cyan-600">{getTierDisplayName(currentPlan)}</span> plan</p>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Daily Limit</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                                        {featureGate.dailyLimit === Infinity ? "∞" : featureGate.dailyLimit}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Monthly Limit</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                                        {featureGate.monthlyLimit === Infinity ? "∞" : featureGate.monthlyLimit.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Email Accounts</div>
                                                    <div className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.03em]">
                                                        {featureGate.emailAccountCount}/{featureGate.emailAccountLimit === Infinity ? "∞" : featureGate.emailAccountLimit}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-medium">Tier</div>
                                                    <div className="text-xl font-bold font-heading text-cyan-600 dark:text-cyan-400 tracking-[-0.03em] capitalize">
                                                        {currentPlan}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Usage Meters */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {/* Daily Usage */}
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">📤 Daily Emails</h3>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {featureGate.emailsSentToday} / {featureGate.dailyLimit === Infinity ? "∞" : featureGate.dailyLimit}
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${featureGate.dailyUsagePercent > 90 ? "bg-red-500" : featureGate.dailyUsagePercent > 70 ? "bg-amber-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`}
                                                        style={{ width: `${Math.min(100, featureGate.dailyUsagePercent)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {featureGate.dailyLimit === Infinity ? "Unlimited sending" : `${Math.max(0, featureGate.dailyLimit - featureGate.emailsSentToday)} emails remaining today`}
                                                </p>
                                            </div>

                                            {/* Monthly Usage */}
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">📊 Monthly Emails</h3>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {featureGate.emailsSentThisMonth.toLocaleString()} / {featureGate.monthlyLimit === Infinity ? "∞" : featureGate.monthlyLimit.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${featureGate.monthlyUsagePercent > 90 ? "bg-red-500" : featureGate.monthlyUsagePercent > 70 ? "bg-amber-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`}
                                                        style={{ width: `${Math.min(100, featureGate.monthlyUsagePercent)}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {featureGate.monthlyLimit === Infinity ? "Unlimited sending" : `${Math.max(0, featureGate.monthlyLimit - featureGate.emailsSentThisMonth).toLocaleString()} emails remaining this month`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Plan Comparison */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Available Plans</h2>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-medium ${!isYearly ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>Monthly</span>
                                                    <button
                                                        onClick={() => setIsYearly(!isYearly)}
                                                        className={`relative w-11 h-6 rounded-full transition-colors ${isYearly ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600"}`}
                                                    >
                                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isYearly ? "translate-x-6" : "translate-x-1"}`} />
                                                    </button>
                                                    <span className={`text-sm font-medium ${isYearly ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
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
                                                            className={`relative rounded-xl p-5 border transition-all ${isCurrent
                                                                ? "border-cyan-300 dark:border-cyan-700 bg-cyan-50/30 dark:bg-cyan-950/20 ring-1 ring-cyan-200/50 dark:ring-cyan-800/30"
                                                                : plan.featured
                                                                    ? "border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-sm"
                                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                                                                }`}
                                                        >
                                                            {isCurrent && (
                                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500 text-white text-[10px] font-bold tracking-wider rounded-full uppercase">
                                                                    Current
                                                                </div>
                                                            )}
                                                            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white tracking-[-0.02em]">{plan.name}</h3>
                                                            <p className="text-xs text-slate-400 mt-1 mb-4">{plan.description}</p>

                                                            <div className="mb-4">
                                                                <span className="font-heading text-3xl font-bold text-slate-900 dark:text-white tracking-[-0.04em]">
                                                                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                                                </span>
                                                                <span className="text-xs text-slate-400 ml-1">/mo</span>
                                                            </div>

                                                            <button
                                                                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] ${isCurrent
                                                                    ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-default"
                                                                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-md hover:shadow-cyan-500/20"
                                                                    }`}
                                                                disabled={isCurrent}
                                                            >
                                                                {isCurrent ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                                                            </button>

                                                            <ul className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                                                                {plan.features.map((feature, j) => (
                                                                    <li key={j} className="flex items-center gap-2">
                                                                        <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                        <span className="text-xs text-slate-600 dark:text-slate-400">{feature}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Payment — Coming Soon */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Payment & Billing</h2>
                                                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Coming Soon</span>
                                            </div>
                                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                                <svg className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                                </svg>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Stripe integration coming soon</p>
                                                <p className="text-xs text-slate-400 mt-1">Self-serve billing, invoices, and payment management will appear here</p>
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
