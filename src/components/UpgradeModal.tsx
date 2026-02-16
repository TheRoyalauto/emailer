"use client";

import Link from "next/link";
import { GatedFeature, getFeatureLabel, getFeatureDescription, getRequiredTier, getTierDisplayName } from "@/hooks/useFeatureGate";

interface UpgradeModalProps {
    feature: GatedFeature;
    currentTier: string;
    onClose: () => void;
}

const TIER_ICONS: Record<string, string> = {
    free: "🆓",
    starter: "🚀",
    professional: "⚡",
    enterprise: "🏢",
};

export default function UpgradeModal({ feature, currentTier, onClose }: UpgradeModalProps) {
    const requiredTier = getRequiredTier(feature);
    const label = getFeatureLabel(feature);
    const description = getFeatureDescription(feature);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient header */}
                <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent dark:from-cyan-500/20 dark:via-blue-500/10">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        ✕
                    </button>

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/25 mb-5">
                        🔒
                    </div>

                    <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.02em] mb-2">
                        Upgrade to unlock {label}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Tier comparison */}
                <div className="px-8 py-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex-1">
                            <span className="text-lg">{TIER_ICONS[currentTier] || "🆓"}</span>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Current</div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{getTierDisplayName(currentTier as any)}</div>
                            </div>
                        </div>

                        <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>

                        <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-xl flex-1">
                            <span className="text-lg">{TIER_ICONS[requiredTier] || "🚀"}</span>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-cyan-500 font-semibold">Required</div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{getTierDisplayName(requiredTier)}</div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/settings?tab=billing"
                        className="block w-full py-3 text-center font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all"
                        onClick={onClose}
                    >
                        View Plans & Upgrade
                    </Link>

                    <button
                        onClick={onClose}
                        className="block w-full py-2.5 text-center text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-2 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Full-page upgrade gate — replaces the entire page content when feature is locked.
 * Use this instead of a modal when the entire page is gated.
 */
export function UpgradeGate({ feature, currentTier }: { feature: GatedFeature; currentTier: string }) {
    const requiredTier = getRequiredTier(feature);
    const label = getFeatureLabel(feature);
    const description = getFeatureDescription(feature);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md w-full text-center px-6">
                {/* Animated lock icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/25">
                        🔒
                    </div>
                </div>

                <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white tracking-[-0.02em] mb-3">
                    {label} — {getTierDisplayName(requiredTier)}+
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
                    {description}
                </p>

                {/* What you get */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6 text-left">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Included with {getTierDisplayName(requiredTier)}
                    </div>
                    <ul className="space-y-2.5">
                        {getUpgradePerks(requiredTier).map((perk, i) => (
                            <li key={i} className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-slate-600 dark:text-slate-300">{perk}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-2">
                    <Link
                        href="/settings?tab=billing"
                        className="block w-full py-3 text-center font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all"
                    >
                        Upgrade to {getTierDisplayName(requiredTier)} →
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">
                        You&apos;re currently on the <span className="font-semibold">{getTierDisplayName(currentTier as any)}</span> plan
                    </p>
                </div>
            </div>
        </div>
    );
}

function getUpgradePerks(tier: string): string[] {
    switch (tier) {
        case "starter":
            return [
                "100 emails/day, 3,000/month",
                "3 email accounts",
                "Smart sequences & follow-ups",
                "A/B testing",
                "Advanced AI writing",
                "50 scrape credits/month",
            ];
        case "professional":
            return [
                "350 emails/day, 10,000/month",
                "10 email accounts",
                "CRM integration (Salesforce, HubSpot)",
                "Advanced analytics & reports",
                "A/B testing & optimization",
                "200 scrape credits/month",
                "Priority support",
            ];
        case "enterprise":
            return [
                "Unlimited emails",
                "Unlimited email accounts",
                "Custom AI training & prompts",
                "API access & webhooks",
                "Dedicated account manager",
                "SSO & advanced security",
            ];
        default:
            return [];
    }
}
