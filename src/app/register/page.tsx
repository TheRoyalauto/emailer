"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "details" | "verify" | "success";

export default function RegisterPage() {
    const { signIn } = useAuthActions();
    const router = useRouter();
    const sendVerificationEmail = useAction(api.emailVerification.sendVerificationEmail);
    const createVerification = useMutation(api.emailVerification.createVerification);
    const verifyCode = useMutation(api.emailVerification.verifyCode);

    // Form state
    const [step, setStep] = useState<Step>("details");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [devCode, setDevCode] = useState<string | null>(null);

    // UI state
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
            // Send verification email and get code
            const result = await sendVerificationEmail({
                email,
                name,
                ...(phone ? { phone } : {}),
            });

            if (!result.success) {
                setError(result.error || "Failed to send verification email");
                setLoading(false);
                return;
            }

            // Store verification code in database
            if (result.code) {
                await createVerification({
                    email,
                    name,
                    code: result.code,
                    ...(phone ? { phone } : {}),
                });
                setDevCode(result.code);
            }

            setStep("verify");
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.message || "Failed to send verification email");
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
            // Verify the code
            const verifyResult = await verifyCode({ email, code: otp });

            if (!verifyResult.success) {
                setError(verifyResult.error || "Verification failed");
                setLoading(false);
                return;
            }

            // Code verified - now create the account
            await signIn("password", {
                email,
                password,
                name,
                ...(phone ? { phone } : {}),
                flow: "signUp"
            });

            setStep("success");

            // Redirect after brief success message
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
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
            const result = await sendVerificationEmail({
                email,
                name,
                phone: phone || undefined,
            });
            if (result.code) {
                setDevCode(result.code);
            }
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
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        E-mailer
                    </h1>
                    <p className="text-white/50">
                        {step === "details" && "Create your account"}
                        {step === "verify" && "Verify your email"}
                        {step === "success" && "You're all set!"}
                    </p>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {["details", "verify", "success"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step === s
                                ? "bg-indigo-500 text-white"
                                : ["details", "verify", "success"].indexOf(step) > i
                                    ? "bg-green-500 text-white"
                                    : "bg-white/10 text-white/40"
                                }`}>
                                {["details", "verify", "success"].indexOf(step) > i ? "✓" : i + 1}
                            </div>
                            {i < 2 && <div className={`w-8 h-0.5 ${["details", "verify", "success"].indexOf(step) > i ? "bg-green-500" : "bg-white/10"}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Account Details */}
                {step === "details" && (
                    <form onSubmit={handleDetailsSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Phone Number <span className="text-white/30">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Password <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">
                                    Confirm <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Sending verification...
                                </span>
                            ) : (
                                "Continue"
                            )}
                        </button>

                        <p className="text-center text-white/40 text-sm">
                            By signing up, you agree to our{" "}
                            <Link href="/terms" className="text-indigo-400 hover:underline">Terms</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>
                        </p>
                    </form>
                )}

                {/* Step 2: Verify Email */}
                {step === "verify" && (
                    <form onSubmit={handleVerifySubmit} className="space-y-6">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-white/60">
                                We sent a 6-digit code to<br />
                                <span className="text-white font-medium">{email}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => handleOtpChange(e.target.value)}
                                className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-center text-2xl tracking-[0.5em] font-mono"
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Verify & Create Account"}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={loading}
                                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors disabled:opacity-50"
                            >
                                Didn't receive the code? Resend
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setStep("details")}
                            className="w-full py-2 text-white/50 hover:text-white text-sm transition-colors"
                        >
                            ← Back to details
                        </button>
                    </form>
                )}

                {/* Step 3: Success */}
                {step === "success" && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Welcome aboard, {name}!</h2>
                        <p className="text-white/60 mb-6">Your account has been created successfully.</p>
                        <p className="text-white/40 text-sm">Redirecting to dashboard...</p>
                    </div>
                )}

                {/* Login link */}
                {step === "details" && (
                    <p className="text-center mt-6 text-white/50">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
