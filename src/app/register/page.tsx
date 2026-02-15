"use client";

import { useState, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../contexts/AuthContext";
import { useAuthMutation } from "../../hooks/useAuthConvex";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "details" | "verify" | "success";

export default function RegisterPage() {
    const { isAuthenticated, isLoading, register: authRegister } = useAuth();
    const router = useRouter();
    const initiateVerification = useAuthMutation(api.emailVerification.initiateVerification);
    const verifyCode = useAuthMutation(api.emailVerification.verifyCode);

    // Form state
    const [step, setStep] = useState<Step>("details");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");

    // UI state
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    // Redirect when authenticated after registration
    useEffect(() => {
        if (registrationComplete && isAuthenticated && !isLoading) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, isLoading, registrationComplete, router]);

    // Step 1: Submit account details and send verification email
    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Please enter your name");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            console.log("[Register Debug] Calling initiateVerification...", {
                email,
                name,
                convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
            });

            // Timeout wrapper — never let the spinner hang forever
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out after 15 seconds. Please check your internet connection and try again.")), 15000)
            );

            // Use mutation-first pattern - stores OTP and schedules email in one call
            const result = await Promise.race([
                initiateVerification({
                    email,
                    name,
                    ...(phone ? { phone } : {}),
                }),
                timeoutPromise,
            ]);

            console.log("[Register Debug] initiateVerification returned:", result);

            if (!result.success) {
                setError("Failed to send verification email");
                setLoading(false);
                return;
            }

            setStep("verify");
        } catch (err: any) {
            console.error("[Register Debug] Signup error:", err);
            setError(err.message || "Failed to send verification email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and create account
    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (otp.length !== 6) {
            setError("Please enter the 6-digit code");
            return;
        }

        setLoading(true);

        try {
            const verifyResult = await verifyCode({ email, code: otp });

            if (!verifyResult.success) {
                setError(verifyResult.error || "Verification failed");
                setLoading(false);
                return;
            }

            // Register with custom auth system via AuthContext
            const regResult = await authRegister(email, password, name, phone || undefined);

            if (!regResult.success) {
                setError(regResult.error || "Registration failed");
                setLoading(false);
                return;
            }

            // Auth context handles token storage — redirect to dashboard
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Account creation error:", err);
            if (err.message?.includes("already exists")) {
                setError("An account with this email already exists");
            } else {
                setError(err.message || "Failed to create account");
            }
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setError("");
        setLoading(true);
        try {
            await initiateVerification({
                email,
                name,
                ...(phone ? { phone } : {}),
            });
        } catch (err: any) {
            setError("Failed to resend code");
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 6);
        setOtp(cleaned);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-cyan-500/10 to-sky-500/5 blur-3xl" />
                <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-sky-500/10 to-cyan-500/5 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    {/* Logo */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <img src="/logo.png" alt="E-mailer" className="h-8 w-auto" />
                        </div>
                        <p className="text-slate-400">
                            {step === "details" && "Create your account"}
                            {step === "verify" && "Verify your email"}
                            {step === "success" && "You're all set!"}
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {["details", "verify", "success"].map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === s
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : ["details", "verify", "success"].indexOf(step) > i
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-100 text-slate-400"
                                    }`}>
                                    {["details", "verify", "success"].indexOf(step) > i ? "✓" : i + 1}
                                </div>
                                {i < 2 && <div className={`w-8 h-0.5 rounded-full ${["details", "verify", "success"].indexOf(step) > i ? "bg-emerald-500" : "bg-slate-200"}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Account Details */}
                    {step === "details" && (
                        <form onSubmit={handleDetailsSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-500 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-500 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-500 mb-2">
                                    Phone Number <span className="text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-500 mb-2">
                                        Confirm <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-slate-900 rounded-xl font-semibold text-white hover:bg-slate-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        Sending verification...
                                    </span>
                                ) : (
                                    "Continue"
                                )}
                            </button>

                            <p className="text-center text-slate-400 text-sm">
                                By signing up, you agree to our{" "}
                                <Link href="/terms" className="text-cyan-600 hover:underline">Terms</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-cyan-600 hover:underline">Privacy Policy</Link>
                            </p>
                        </form>
                    )}

                    {/* Step 2: Verify Email */}
                    {step === "verify" && (
                        <form onSubmit={handleVerifySubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-cyan-50 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">📧</span>
                                </div>
                                <p className="text-slate-500">
                                    We sent a 6-digit code to<br />
                                    <span className="text-slate-900 font-semibold">{email}</span>
                                </p>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-500/20 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => handleOtpChange(e.target.value)}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-center text-2xl tracking-[0.5em] font-mono text-slate-900 placeholder:text-slate-400"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3.5 bg-slate-900 rounded-xl font-semibold text-white hover:bg-slate-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? "Verifying..." : "Verify & Create Account"}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Didn't receive the code? Resend
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep("details")}
                                className="w-full py-2 text-slate-400 hover:text-slate-500 text-sm transition-colors"
                            >
                                ← Back to details
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === "success" && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 rounded-full flex items-center justify-center">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome aboard, {name}!</h2>
                            <p className="text-slate-500 mb-6">Your account has been created successfully.</p>
                            <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full" />
                                Redirecting to dashboard...
                            </p>
                        </div>
                    )}

                    {/* Login link */}
                    {step === "details" && (
                        <p className="text-center mt-6 text-slate-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-slate-400">
                    © 2024 Emailer. Professional email campaigns.
                </p>
            </div>
        </div>
    );
}
