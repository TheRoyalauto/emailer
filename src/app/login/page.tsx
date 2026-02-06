"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { signIn } = useAuthActions();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [attemptingLogin, setAttemptingLogin] = useState(false);

    // Redirect when authenticated
    useEffect(() => {
        if (attemptingLogin && isAuthenticated && !isLoading) {
            router.push("/campaigns");
        }
    }, [isAuthenticated, isLoading, attemptingLogin, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setAttemptingLogin(true);

        try {
            console.log("Attempting sign in with email:", email);
            await signIn("password", { email, password, flow: "signIn" });
        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Invalid email or password");
            setAttemptingLogin(false);
        } finally {
            setLoading(false);
        }
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
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gradient mb-2">
                            Emailer
                        </h1>
                        <p className="text-[#9CA3AF]">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-center gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-[#4B5563] mb-2">
                                Email
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
                                Password
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-[#FF6B4A] to-[#F43F5E] rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-[#FF6B4A]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-[#9CA3AF]">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-[#FF6B4A] hover:text-[#F43F5E] font-semibold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-[#9CA3AF]">
                    © 2024 Emailer. Professional email campaigns.
                </p>
            </div>
        </div>
    );
}
