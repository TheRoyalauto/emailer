"use client";

import { useAuthQuery } from "../hooks/useAuthConvex";
import { api } from "../../convex/_generated/api";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Floating Super Admin access button — appears on all pages
 * when the current user is a super admin. Subtle, non-intrusive,
 * positioned bottom-right with a shield icon.
 */
export function SuperAdminFab() {
    const isSuperAdmin = useAuthQuery(api.superAdmin.checkSuperAdmin);
    const pathname = usePathname();
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    // Don't show on the admin page itself, or if not super admin
    if (!isSuperAdmin?.isSuperAdmin) return null;
    if (pathname === "/admin") return null;

    return (
        <button
            onClick={() => router.push("/admin")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-6 right-6 z-[9998] group transition-all duration-300 ease-out"
            title="Super Admin Panel"
        >
            <div className={`
                flex items-center gap-2 px-3 py-3 rounded-2xl shadow-lg border transition-all duration-300 ease-out
                bg-slate-900/90 backdrop-blur-xl border-slate-700/50
                hover:bg-slate-800 hover:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/30
                ${isHovered ? "pr-5" : ""}
            `}>
                {/* Shield Icon */}
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                </div>
                {/* Label — expands on hover */}
                <span className={`text-white text-xs font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-out ${isHovered ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0"}`}>
                    Admin
                </span>
            </div>
            {/* Subtle pulse ring */}
            <div className="absolute inset-0 rounded-2xl border border-cyan-400/20 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: "3s" }} />
        </button>
    );
}
