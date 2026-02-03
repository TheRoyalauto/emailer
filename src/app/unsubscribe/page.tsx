"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
    const [reason, setReason] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleUnsubscribe = async () => {
        if (!email) return;
        setStatus("loading");

        try {
            const response = await fetch("/api/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, reason }),
            });

            if (response.ok) {
                setStatus("success");
                setSubmitted(true);
            } else {
                setStatus("error");
            }
        } catch {
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#12121f] rounded-2xl border border-white/10 p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Emailer
                    </h1>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-xl font-semibold mb-2">You{"'"}ve Been Unsubscribed</h2>
                        <p className="text-white/50">
                            {email} has been removed from our mailing list.
                        </p>
                        <p className="text-white/40 text-sm mt-4">
                            You will no longer receive emails from us.
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold text-center mb-2">Unsubscribe</h2>
                        <p className="text-white/50 text-center mb-6">
                            You are about to unsubscribe:
                        </p>

                        <div className="p-4 bg-white/5 rounded-lg mb-6">
                            <div className="text-center font-mono text-sm text-indigo-400">
                                {email || "No email provided"}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-sm text-white/50 mb-2 block">
                                Why are you unsubscribing? (optional)
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm"
                            >
                                <option value="">Select a reason...</option>
                                <option value="too_many">Too many emails</option>
                                <option value="not_relevant">Not relevant to me</option>
                                <option value="never_signed_up">Never signed up</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <button
                            onClick={handleUnsubscribe}
                            disabled={!email || status === "loading"}
                            className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === "loading" ? "Processing..." : "Confirm Unsubscribe"}
                        </button>

                        {status === "error" && (
                            <p className="text-red-400 text-sm text-center mt-4">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <p className="text-white/30 text-xs text-center mt-6">
                            If you unsubscribe by mistake, contact support to resubscribe.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
