"use client";

import { api } from "@/../convex/_generated/api";
import { useState } from "react";
import { AuthGuard, AppHeader } from "@/components/AuthGuard";
import { Id } from "@/../convex/_generated/dataModel";
import { useAuthQuery, useAuthMutation } from "../../hooks/useAuthConvex";

// Preset SMTP configurations
const SMTP_PRESETS = [
    { name: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
    { name: "Outlook", host: "smtp-mail.outlook.com", port: 587, secure: false },
    { name: "Yahoo", host: "smtp.mail.yahoo.com", port: 587, secure: false },
    { name: "iCloud", host: "smtp.mail.me.com", port: 587, secure: false },
    { name: "Zoho", host: "smtp.zoho.com", port: 587, secure: false },
    { name: "Private Email", host: "mail.privateemail.com", port: 587, secure: false },
    { name: "SendGrid", host: "smtp.sendgrid.net", port: 587, secure: false },
    { name: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { name: "Custom", host: "", port: 587, secure: false },
];

function SMTPSettingsPage() {
    const configs = useAuthQuery(api.smtpConfigs.list);
    const createConfig = useAuthMutation(api.smtpConfigs.create);
    const setDefault = useAuthMutation(api.smtpConfigs.setDefault);
    const removeConfig = useAuthMutation(api.smtpConfigs.remove);

    const [showAdd, setShowAdd] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [testing, setTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Form state
    const [preset, setPreset] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState(587);
    const [secure, setSecure] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [makeDefault, setMakeDefault] = useState(true);

    const handlePresetChange = (presetName: string) => {
        setPreset(presetName);
        const presetConfig = SMTP_PRESETS.find(p => p.name === presetName);
        if (presetConfig) {
            setHost(presetConfig.host);
            setPort(presetConfig.port);
            setSecure(presetConfig.secure);
        }
    };

    const handleCreate = async () => {
        await createConfig({
            name: displayName || preset || "SMTP Config",
            host,
            port,
            secure,
            username,
            password,
            fromEmail: fromEmail || username,
            fromName: displayName,
            isDefault: makeDefault,
        });
        setShowAdd(false);
        resetForm();
    };

    const resetForm = () => {
        setPreset("");
        setHost("");
        setPort(587);
        setSecure(false);
        setUsername("");
        setPassword("");
        setFromEmail("");
        setDisplayName("");
        setMakeDefault(true);
        setWizardStep(1);
    };

    const handleTest = async (configId: Id<"smtpConfigs">) => {
        setTesting(configId);
        setTestResult(null);

        const config = configs?.find(c => c._id === configId);
        if (!config) {
            setTestResult({ success: false, message: "Config not found" });
            setTesting(null);
            return;
        }

        try {
            const response = await fetch("/api/test-smtp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    configId,
                    host: config.host,
                    port: config.port,
                    secure: config.secure,
                    user: config.username,
                    pass: config.password,
                    from: config.fromEmail,
                    fromName: config.fromName,
                }),
            });
            const data = await response.json();
            setTestResult(data);
        } catch (error) {
            setTestResult({ success: false, message: "Test failed" });
        } finally {
            setTesting(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FC] pb-20 md:pb-0">
            <AppHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Hero Section */}
                <div className="relative mb-8 rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-[#FF6B4A]/5" />

                    <div className="relative p-8 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center text-2xl shadow-lg shadow-[#8B5CF6]/25">
                                    📧
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-[#1A1D26]">Account Center</h1>
                                    <p className="text-[#9CA3AF]">Manage your email sending accounts</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="group px-5 py-3 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white shadow-lg shadow-[#FF6B4A]/25 hover:shadow-xl hover:shadow-[#FF6B4A]/30 transition-all hover:scale-105"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg">+</span>
                                Add Account
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Accounts", value: configs?.length ?? 0, icon: "📧", color: "#8B5CF6" },
                        { label: "Default Account", value: configs?.find(c => c.isDefault)?.name ?? "None", icon: "⭐", color: "#F59E0B" },
                        { label: "Ready to Send", value: configs?.length ?? 0, icon: "✅", color: "#10B981" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="group p-4 bg-white rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: `${stat.color}15` }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-[#1A1D26] truncate max-w-[120px]">
                                        {typeof stat.value === 'number' ? stat.value : stat.value}
                                    </div>
                                    <div className="text-xs text-[#9CA3AF]">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Accounts Grid */}
                {configs === undefined ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin w-8 h-8 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                    </div>
                ) : configs.length === 0 ? (
                    <div className="relative overflow-hidden text-center py-20 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
                        <div className="relative">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/10 to-[#FF6B4A]/10 border border-[#E5E7EB] flex items-center justify-center text-4xl">
                                📧
                            </div>
                            <h2 className="text-2xl font-bold text-[#1A1D26] mb-2">No Email Accounts Yet</h2>
                            <p className="text-[#9CA3AF] mb-6 max-w-md mx-auto">
                                Connect your email accounts to start sending campaigns. We support Gmail, Outlook, Yahoo, and more.
                            </p>
                            <button
                                onClick={() => setShowAdd(true)}
                                className="px-6 py-3 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white shadow-lg shadow-[#FF6B4A]/25 hover:shadow-xl hover:scale-105 transition-all"
                            >
                                + Add Your First Account
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {configs.map((config, index) => (
                            <div
                                key={config._id}
                                className={`group relative bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${config.isDefault
                                    ? "border-[#8B5CF6]/30 shadow-lg shadow-[#8B5CF6]/10"
                                    : "border-[#E5E7EB] hover:border-[#8B5CF6]/20"
                                    }`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {config.isDefault && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-[#FF6B4A]/5" />
                                )}

                                <div className="relative p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${config.isDefault
                                                ? "bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white shadow-lg shadow-[#8B5CF6]/25"
                                                : "bg-[#F1F3F8] text-[#4B5563]"
                                                }`}>
                                                {config.fromName?.charAt(0).toUpperCase() || config.name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-[#1A1D26] flex items-center gap-2">
                                                    {config.name}
                                                    {config.isDefault && (
                                                        <span className="px-2 py-0.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs rounded-full font-medium">
                                                            Default
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-[#9CA3AF]">{config.fromEmail}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#10B981]/10 rounded-full">
                                            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                                            <span className="text-xs text-[#10B981] font-medium">Ready</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-[#F8F9FC] rounded-lg mb-4 font-mono text-xs text-[#9CA3AF]">
                                        {config.host}:{config.port} • {config.secure ? "SSL" : "TLS"}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTest(config._id)}
                                            disabled={testing === config._id}
                                            className="flex-1 px-3 py-2 bg-[#F8F9FC] hover:bg-[#F1F3F8] border border-[#E5E7EB] rounded-lg text-sm text-[#4B5563] transition-all hover:scale-[1.02] disabled:opacity-50"
                                        >
                                            {testing === config._id ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-[#9CA3AF] border-t-[#1A1D26] rounded-full animate-spin" />
                                                    Testing...
                                                </span>
                                            ) : "🔌 Test"}
                                        </button>
                                        {!config.isDefault && (
                                            <button
                                                onClick={() => setDefault({ id: config._id })}
                                                className="px-3 py-2 bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 rounded-lg text-sm font-medium hover:bg-[#8B5CF6]/20 transition-all hover:scale-[1.02]"
                                            >
                                                ⭐ Set Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removeConfig({ id: config._id })}
                                            className="px-3 py-2 bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20 rounded-lg text-sm hover:bg-[#EF4444]/20 transition-all hover:scale-[1.02]"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {testResult && testing === null && (
                                        <div className={`mt-3 p-3 rounded-lg text-sm ${testResult.success
                                            ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20"
                                            : "bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20"
                                            }`}>
                                            {testResult.success ? "✅ " : "❌ "}{testResult.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setShowAdd(true)}
                            className="group p-8 bg-white rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#FF6B4A]/50 transition-all hover:bg-[#FF6B4A]/5 flex flex-col items-center justify-center gap-3 min-h-[200px]"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#F1F3F8] group-hover:bg-[#FF6B4A]/20 flex items-center justify-center text-2xl transition-all group-hover:scale-110 text-[#9CA3AF] group-hover:text-[#FF6B4A]">
                                +
                            </div>
                            <span className="text-[#9CA3AF] group-hover:text-[#FF6B4A] font-medium transition-colors">Add Another Account</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Add Account Wizard Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-lg overflow-hidden shadow-2xl">
                        {/* Progress Bar */}
                        <div className="flex border-b border-[#E5E7EB]">
                            {[{ n: 1, l: "Provider" }, { n: 2, l: "Setup" }, { n: 3, l: "Credentials" }, { n: 4, l: "Finish" }].map((step) => (
                                <div
                                    key={step.n}
                                    className={`flex-1 py-3 text-center text-sm font-medium transition-all ${wizardStep === step.n
                                        ? "bg-[#FF6B4A]/10 text-[#FF6B4A] border-b-2 border-[#FF6B4A]"
                                        : wizardStep > step.n
                                            ? "text-[#4B5563] bg-[#F8F9FC]"
                                            : "text-[#9CA3AF]"
                                        }`}
                                >
                                    {step.l}
                                </div>
                            ))}
                        </div>

                        <div className="p-6">
                            {/* Step 1: Choose Provider */}
                            {wizardStep === 1 && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-xl font-bold text-[#1A1D26] mb-2">Choose Your Email Provider</h2>
                                    <p className="text-[#9CA3AF] text-sm mb-6">Select your email service to auto-configure settings</p>

                                    <div className="grid grid-cols-3 gap-3">
                                        {SMTP_PRESETS.map((p) => (
                                            <button
                                                key={p.name}
                                                onClick={() => {
                                                    handlePresetChange(p.name);
                                                    const needsInstructions = ["Gmail", "Yahoo", "iCloud"].includes(p.name);
                                                    setWizardStep(needsInstructions ? 2 : 3);
                                                }}
                                                className={`p-4 rounded-xl border text-center transition-all hover:scale-[1.02] hover:border-[#FF6B4A]/50 ${preset === p.name
                                                    ? "border-[#FF6B4A] bg-[#FF6B4A]/10"
                                                    : "border-[#E5E7EB] bg-[#F8F9FC] hover:bg-white"
                                                    }`}
                                            >
                                                <div className="text-2xl mb-2">
                                                    {p.name === "Gmail" && "📧"}
                                                    {p.name === "Outlook" && "📬"}
                                                    {p.name === "Yahoo" && "📨"}
                                                    {p.name === "iCloud" && "☁️"}
                                                    {p.name === "Zoho" && "📋"}
                                                    {p.name === "Private Email" && "📩"}
                                                    {p.name === "SendGrid" && "📤"}
                                                    {p.name === "Mailgun" && "🔫"}
                                                    {p.name === "Custom" && "⚙️"}
                                                </div>
                                                <div className="font-medium text-sm text-[#1A1D26]">{p.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Provider Setup Instructions */}
                            {wizardStep === 2 && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-xl font-bold text-[#1A1D26] mb-2">📱 {preset} Setup Required</h2>
                                    <p className="text-[#9CA3AF] text-sm mb-6">
                                        {preset} requires an App Password for security. Follow these steps:
                                    </p>

                                    <div className="bg-[#F8F9FC] rounded-xl p-5 border border-[#E5E7EB]">
                                        <ol className="space-y-3 text-sm">
                                            {preset === "Gmail" && (
                                                <>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">1</span>
                                                        <span className="text-[#4B5563]">Go to <a href="https://myaccount.google.com" target="_blank" className="text-[#FF6B4A] hover:underline">myaccount.google.com</a></span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">2</span>
                                                        <span className="text-[#4B5563]">Enable 2-Factor Authentication if not already enabled</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">3</span>
                                                        <span className="text-[#4B5563]">Go to Security → 2-Step Verification → App passwords</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">4</span>
                                                        <span className="text-[#4B5563]">Generate a new app password for "Mail"</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-xs font-bold">5</span>
                                                        <span className="text-[#4B5563]">Use that <strong className="text-[#10B981]">16-character password</strong> in the next step</span>
                                                    </li>
                                                </>
                                            )}
                                            {preset === "Yahoo" && (
                                                <>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">1</span>
                                                        <span className="text-[#4B5563]">Go to <a href="https://login.yahoo.com/account/security" target="_blank" className="text-[#FF6B4A] hover:underline">Yahoo Account Security</a></span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">2</span>
                                                        <span className="text-[#4B5563]">Click "Generate app password"</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">3</span>
                                                        <span className="text-[#4B5563]">Select "Other App" and enter a name</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-xs font-bold">4</span>
                                                        <span className="text-[#4B5563]">Use that app password in the next step</span>
                                                    </li>
                                                </>
                                            )}
                                            {preset === "iCloud" && (
                                                <>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">1</span>
                                                        <span className="text-[#4B5563]">Go to <a href="https://appleid.apple.com" target="_blank" className="text-[#FF6B4A] hover:underline">appleid.apple.com</a></span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">2</span>
                                                        <span className="text-[#4B5563]">Sign in and go to Security section</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#FF6B4A]/20 text-[#FF6B4A] flex items-center justify-center text-xs font-bold">3</span>
                                                        <span className="text-[#4B5563]">Click "Generate Password" under App-Specific Passwords</span>
                                                    </li>
                                                    <li className="flex gap-3">
                                                        <span className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-xs font-bold">4</span>
                                                        <span className="text-[#4B5563]">Use that app password in the next step</span>
                                                    </li>
                                                </>
                                            )}
                                        </ol>
                                    </div>

                                    <div className="mt-4 p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg text-sm text-[#B45309]">
                                        ⚠️ Never use your main {preset} password. App passwords are safer and can be revoked anytime.
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Login Credentials */}
                            {wizardStep === 3 && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-xl font-bold text-[#1A1D26] mb-2">Enter Your Login</h2>
                                    <p className="text-[#9CA3AF] text-sm mb-6">
                                        {preset === "Gmail"
                                            ? "Use an App Password (not your Gmail password)"
                                            : `Enter your ${preset || "email"} credentials`
                                        }
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-[#4B5563] mb-1 block font-medium">Email Address</label>
                                            <input
                                                type="email"
                                                value={username}
                                                onChange={(e) => {
                                                    setUsername(e.target.value);
                                                    if (!fromEmail) setFromEmail(e.target.value);
                                                }}
                                                className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-lg text-[#1A1D26] focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-colors"
                                                placeholder="your@email.com"
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm text-[#4B5563] mb-1 block font-medium">
                                                {["Gmail", "Yahoo", "iCloud"].includes(preset) ? "App Password" : "Password"}
                                            </label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-lg text-[#1A1D26] focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-colors"
                                                placeholder={["Gmail", "Yahoo", "iCloud"].includes(preset) ? "xxxx xxxx xxxx xxxx" : "••••••••"}
                                            />
                                        </div>

                                        {preset === "Custom" && (
                                            <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-sm text-[#4B5563] mb-1 block font-medium">SMTP Server</label>
                                                        <input
                                                            type="text"
                                                            value={host}
                                                            onChange={(e) => setHost(e.target.value)}
                                                            className="w-full px-3 py-2 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-[#1A1D26] focus:border-[#FF6B4A] focus:outline-none"
                                                            placeholder="smtp.example.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-[#4B5563] mb-1 block font-medium">Port</label>
                                                        <input
                                                            type="number"
                                                            value={port}
                                                            onChange={(e) => setPort(parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-[#1A1D26] focus:border-[#FF6B4A] focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={secure}
                                                        onChange={(e) => setSecure(e.target.checked)}
                                                        className="w-4 h-4 rounded accent-[#FF6B4A]"
                                                    />
                                                    <span className="text-sm text-[#4B5563]">Use SSL (port 465)</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Display Name */}
                            {wizardStep === 4 && (
                                <div className="animate-in fade-in">
                                    <h2 className="text-xl font-bold text-[#1A1D26] mb-2">Almost Done!</h2>
                                    <p className="text-[#9CA3AF] text-sm mb-6">How should your name appear in emails?</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-[#4B5563] mb-1 block font-medium">Display Name</label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl text-lg text-[#1A1D26] focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 focus:outline-none transition-colors"
                                                placeholder="Your Name or Company"
                                                autoFocus
                                            />
                                            <p className="text-xs text-[#9CA3AF] mt-2">
                                                Recipients will see: {displayName || "Your Name"} &lt;{fromEmail || "your@email.com"}&gt;
                                            </p>
                                        </div>

                                        <div className="p-4 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl">
                                            <div className="text-sm font-medium text-[#8B5CF6] mb-2">Account Summary</div>
                                            <div className="space-y-1 text-sm text-[#4B5563]">
                                                <div>Provider: <span className="text-[#1A1D26] font-medium">{preset || "Custom"}</span></div>
                                                <div>Email: <span className="text-[#1A1D26] font-medium">{username}</span></div>
                                                <div>Server: <span className="text-[#1A1D26] font-medium">{host}:{port}</span></div>
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-3 p-3 bg-[#F8F9FC] rounded-xl cursor-pointer hover:bg-[#F1F3F8] transition-colors border border-[#E5E7EB]">
                                            <input
                                                type="checkbox"
                                                checked={makeDefault}
                                                onChange={(e) => setMakeDefault(e.target.checked)}
                                                className="w-5 h-5 rounded accent-[#FF6B4A]"
                                            />
                                            <div>
                                                <div className="font-medium text-[#1A1D26]">Set as default account</div>
                                                <div className="text-xs text-[#9CA3AF]">Use this account for new campaigns</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer with Navigation */}
                        <div className="flex justify-between items-center p-6 border-t border-[#E5E7EB] bg-[#F8F9FC]">
                            <button
                                onClick={() => {
                                    if (wizardStep === 1) {
                                        setShowAdd(false);
                                        resetForm();
                                    } else if (wizardStep === 3) {
                                        const needsInstructions = ["Gmail", "Yahoo", "iCloud"].includes(preset);
                                        setWizardStep(needsInstructions ? 2 : 1);
                                    } else {
                                        setWizardStep(wizardStep - 1);
                                    }
                                }}
                                className="px-4 py-2 text-[#9CA3AF] hover:text-[#1A1D26] transition-colors"
                            >
                                {wizardStep === 1 ? "Cancel" : "← Back"}
                            </button>

                            {wizardStep < 4 ? (
                                <button
                                    onClick={() => setWizardStep(wizardStep + 1)}
                                    disabled={wizardStep === 3 && (!username || !password)}
                                    className="px-6 py-2 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#FF6B4A]/25"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={handleCreate}
                                    disabled={!host || !username || !password || !fromEmail}
                                    className="px-6 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#10B981]/25"
                                >
                                    ✓ Add Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SMTPSettingsWrapper() {
    return (
        <AuthGuard>
            <SMTPSettingsPage />
        </AuthGuard>
    );
}
