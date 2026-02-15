"use client";

import { useAuthQuery, useAuthMutation } from "../hooks/useAuthConvex";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../contexts/AuthContext";

/**
 * Impersonation Banner — shows at the top of every page when
 * viewing as another user. Provides a one-click "End Session" button.
 *
 * Drop this inside your root layout or AuthGuard so it renders globally.
 */
export function ImpersonationBanner() {
    const impersonation = useAuthQuery(api.superAdmin.checkImpersonation);
    const { sessionToken, logout } = useAuth();

    if (!impersonation?.isImpersonation) return null;

    const handleEndImpersonation = async () => {
        // Clear the impersonation session from localStorage and reload
        // The admin's original token should be stored in sessionStorage
        const adminToken = typeof window !== "undefined"
            ? sessionStorage.getItem("claimory_admin_token")
            : null;

        if (adminToken) {
            // Restore admin session
            localStorage.setItem("claimory_session_token", adminToken);
            sessionStorage.removeItem("claimory_admin_token");
            window.location.href = "/admin";
        } else {
            // Fallback: just log out
            await logout();
            window.location.href = "/login";
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm font-bold">👁</div>
                <div>
                    <span className="font-semibold text-sm">Impersonation Mode</span>
                    <span className="mx-2 text-white/60">|</span>
                    <span className="text-sm text-white/90">
                        Viewing as <strong>{impersonation.targetEmail}</strong>
                    </span>
                    {impersonation.expiresAt && (
                        <span className="ml-2 text-xs text-white/60">
                            (expires {new Date(impersonation.expiresAt).toLocaleTimeString()})
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-white/70">
                    Admin: {impersonation.adminEmail}
                </span>
                <button
                    onClick={handleEndImpersonation}
                    className="px-4 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-semibold transition-colors border border-white/20"
                >
                    ✕ End Session
                </button>
            </div>
        </div>
    );
}
