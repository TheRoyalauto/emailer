"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "details" | "verify" | "success";

export default function RegisterPage() {
    const { signIn } = useAuthActions();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();
    // Use mutation instead of action - much more reliable, no WebSocket timeout issues
    const initiateVerification = useMutation(api.emailVerification.initiateVerification);
    const verifyCode = useMutation(api.emailVerification.verifyCode);

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

            await signIn("password", {
                email,
                password,
                name,
                ...(phone ? { phone } : {}),
                flow: "signUp"
            });

            setStep("success");
            setRegistrationComplete(true);
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
        <div className="min-h-screen bg-gradient-to-br from-[#F8F9FC] to-[#F1F3F8] flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#FF6B4A]/10 to-[#F43F5E]/5 blur-3xl" />
                <div className="absolute -bottom-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#0EA5E9]/10 to-[#06B6D4]/5 blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-8">
                    {/* Logo */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gradient mb-2">
                            E-mailer
                        </h1>
                        <p className="text-[#9CA3AF]">
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
                                    ? "bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] text-white shadow-lg shadow-[#FF6B4A]/20"
                                    : ["details", "verify", "success"].indexOf(step) > i
                                        ? "bg-[#10B981] text-white"
                                        : "bg-[#F1F3F8] text-[#9CA3AF]"
                                    }`}>
                                    {["details", "verify", "success"].indexOf(step) > i ? "✓" : i + 1}
                                </div>
                                {i < 2 && <div className={`w-8 h-0.5 rounded-full ${["details", "verify", "success"].indexOf(step) > i ? "bg-[#10B981]" : "bg-[#E5E7EB]"}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Account Details */}
                    {step === "details" && (
                        <form onSubmit={handleDetailsSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-[#4B5563] mb-2">
                                    Full Name <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#4B5563] mb-2">
                                    Email Address <span className="text-[#EF4444]">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#4B5563] mb-2">
                                    Phone Number <span className="text-[#9CA3AF]">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-[#4B5563] mb-2">
                                        Password <span className="text-[#EF4444]">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#4B5563] mb-2">
                                        Confirm <span className="text-[#EF4444]">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-[#FF6B4A]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
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

                            <p className="text-center text-[#9CA3AF] text-sm">
                                By signing up, you agree to our{" "}
                                <Link href="/terms" className="text-[#FF6B4A] hover:underline">Terms</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-[#FF6B4A] hover:underline">Privacy Policy</Link>
                            </p>
                        </form>
                    )}

                    {/* Step 2: Verify Email */}
                    {step === "verify" && (
                        <form onSubmit={handleVerifySubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B4A]/10 to-[#F43F5E]/10 rounded-full flex items-center justify-center">
                                    <span className="text-3xl">📧</span>
                                </div>
                                <p className="text-[#4B5563]">
                                    We sent a 6-digit code to<br />
                                    <span className="text-[#1A1D26] font-semibold">{email}</span>
                                </p>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/20 text-[#EF4444] text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => handleOtpChange(e.target.value)}
                                    className="w-full px-4 py-4 bg-[#F8F9FC] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all text-center text-2xl tracking-[0.5em] font-mono text-[#1A1D26] placeholder:text-[#9CA3AF]"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3.5 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-[#FF6B4A]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {loading ? "Verifying..." : "Verify & Create Account"}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-[#FF6B4A] hover:text-[#F43F5E] text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Didn't receive the code? Resend
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setStep("details")}
                                className="w-full py-2 text-[#9CA3AF] hover:text-[#4B5563] text-sm transition-colors"
                            >
                                ← Back to details
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === "success" && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-6 bg-[#ECFDF5] rounded-full flex items-center justify-center">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#1A1D26] mb-2">Welcome aboard, {name}!</h2>
                            <p className="text-[#4B5563] mb-6">Your account has been created successfully.</p>
                            <p className="text-[#9CA3AF] text-sm flex items-center justify-center gap-2">
                                <span className="animate-spin w-4 h-4 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                                Redirecting to dashboard...
                            </p>
                        </div>
                    )}

                    {/* Login link */}
                    {step === "details" && (
                        <p className="text-center mt-6 text-[#9CA3AF]">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#FF6B4A] hover:text-[#F43F5E] font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-[#9CA3AF]">
                    © 2024 Emailer. Professional email campaigns.
                </p>
            </div>
        </div>
    );
}
