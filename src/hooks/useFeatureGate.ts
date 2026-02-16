"use client";

import { api } from "../../convex/_generated/api";
import { useAuthQuery } from "./useAuthConvex";

export type Tier = "free" | "starter" | "professional" | "enterprise";

const TIER_RANK: Record<Tier, number> = {
    free: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
};

export interface FeatureGate {
    /** User's current tier */
    tier: Tier;
    /** Whether profile data has loaded */
    isLoading: boolean;

    // Feature access booleans
    canUseSequences: boolean;
    canUseABTesting: boolean;
    canUseScraper: boolean;
    canUseCRM: boolean;
    canUseAdvancedAnalytics: boolean;
    canUseCustomAI: boolean;
    canUseAPI: boolean;

    // Usage data
    emailsSentToday: number;
    emailsSentThisMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
    emailAccountLimit: number;
    emailAccountCount: number;

    // Computed
    dailyUsagePercent: number;
    monthlyUsagePercent: number;

    /** Check if a feature requiring a minimum tier is accessible */
    hasMinTier: (requiredTier: Tier) => boolean;

    /** Get the minimum tier name needed for a feature */
    tierNameForFeature: (feature: GatedFeature) => string;
}

export type GatedFeature =
    | "sequences"
    | "ab_testing"
    | "scraper"
    | "crm"
    | "advanced_analytics"
    | "custom_ai"
    | "api";

const FEATURE_MIN_TIER: Record<GatedFeature, Tier> = {
    sequences: "starter",
    ab_testing: "starter",
    scraper: "free", // accessible to all, but credits are limited
    crm: "professional",
    advanced_analytics: "professional",
    custom_ai: "enterprise",
    api: "enterprise",
};

const FEATURE_LABELS: Record<GatedFeature, string> = {
    sequences: "Smart Sequences",
    ab_testing: "A/B Testing",
    scraper: "AI Lead Scraper",
    crm: "CRM Integration",
    advanced_analytics: "Advanced Analytics",
    custom_ai: "Custom AI Training",
    api: "API Access",
};

const FEATURE_DESCRIPTIONS: Record<GatedFeature, string> = {
    sequences: "Create automated multi-step email sequences with smart follow-ups, conditional branching, and timezone-aware scheduling.",
    ab_testing: "Test subject lines, body copy, and CTAs across multiple variants to optimize your open and reply rates.",
    scraper: "Find and extract verified business leads — including emails, phone numbers, and social profiles — directly from the web.",
    crm: "Sync your contacts and deals with Salesforce, HubSpot, Pipedrive, and more.",
    advanced_analytics: "Deep-dive into your outreach performance with custom dashboards, cohort analysis, and deliverability reports.",
    custom_ai: "Train the AI on your brand voice, product knowledge, and past successful emails for hyper-personalized outreach.",
    api: "Programmatic access to your account for custom integrations, webhooks, and workflow automation.",
};

export function getFeatureLabel(feature: GatedFeature): string {
    return FEATURE_LABELS[feature];
}

export function getFeatureDescription(feature: GatedFeature): string {
    return FEATURE_DESCRIPTIONS[feature];
}

export function getRequiredTier(feature: GatedFeature): Tier {
    return FEATURE_MIN_TIER[feature];
}

export function getTierDisplayName(tier: Tier): string {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function useFeatureGate(): FeatureGate {
    const profile = useAuthQuery(api.userProfiles.getMyProfile);

    const tier: Tier = (profile?.tier as Tier) || "free";
    const isLoading = profile === undefined;

    const rank = TIER_RANK[tier];

    const hasMinTier = (requiredTier: Tier): boolean => {
        return rank >= TIER_RANK[requiredTier];
    };

    const emailsSentToday = profile?.emailsSentToday || 0;
    const emailsSentThisMonth = profile?.emailsSentThisMonth || 0;
    const dailyLimit = profile?.limits?.dailyEmails || 30;
    const monthlyLimit = profile?.limits?.monthlyEmails || 900;
    const emailAccountLimit = profile?.limits?.emailAccounts || 1;
    const emailAccountCount = profile?.emailAccountCount || 0;

    const dailyUsagePercent = dailyLimit === Infinity ? 0 : Math.min(100, (emailsSentToday / dailyLimit) * 100);
    const monthlyUsagePercent = monthlyLimit === Infinity ? 0 : Math.min(100, (emailsSentThisMonth / monthlyLimit) * 100);

    return {
        tier,
        isLoading,

        canUseSequences: hasMinTier("starter"),
        canUseABTesting: hasMinTier("starter"),
        canUseScraper: true, // accessible to all, credits limit usage
        canUseCRM: hasMinTier("professional"),
        canUseAdvancedAnalytics: hasMinTier("professional"),
        canUseCustomAI: hasMinTier("enterprise"),
        canUseAPI: hasMinTier("enterprise"),

        emailsSentToday,
        emailsSentThisMonth,
        dailyLimit,
        monthlyLimit,
        emailAccountLimit,
        emailAccountCount,

        dailyUsagePercent,
        monthlyUsagePercent,

        hasMinTier,
        tierNameForFeature: (feature: GatedFeature) => getTierDisplayName(FEATURE_MIN_TIER[feature]),
    };
}
