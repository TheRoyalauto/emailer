"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AuthGuardProps {
    children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    <p className="text-white/50">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

// Navigation items - consolidated to core hubs
const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠", mobileIcon: "🏠" },
    { href: "/campaigns", label: "Campaigns", icon: "📧", mobileIcon: "📧" },
    { href: "/contacts", label: "Contacts", icon: "👥", mobileIcon: "👥" },
    { href: "/replies", label: "Replies", icon: "💬", mobileIcon: "💬" },
    { href: "/deals", label: "Deals", icon: "💼", mobileIcon: "💼" },
    { href: "/tasks", label: "Tasks", icon: "✅", mobileIcon: "✅" },
    { href: "/sequences", label: "Sequences", icon: "🔄", mobileIcon: "🔄" },
    { href: "/automations", label: "Automations", icon: "⚡", mobileIcon: "⚡" },
    { href: "/links", label: "Links", icon: "🔗", mobileIcon: "🔗" },
    { href: "/settings", label: "Settings", icon: "⚙️", mobileIcon: "⚙️" },
];

// Mobile bottom nav items (first 5)
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

// Unified App Header
export function AppHeader() {
    const { signOut } = useAuthActions();
    const pathname = usePathname();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const handleSignOut = async () => {
        await signOut();
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Header */}
            <header className="border-b border-white/10 bg-[#0a0a0f]/95 sticky top-0 z-50 backdrop-blur-lg hidden md:block">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo - always goes to dashboard */}
                        <Link
                            href="/dashboard"
                            className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                        >
                            Emailer
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="flex items-center gap-1">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isActive(item.href)
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <span className="text-sm">{item.icon}</span>
                                    <span className="hidden lg:inline">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Mobile Header */}
            <header className="border-b border-white/10 bg-[#0a0a0f]/95 sticky top-0 z-50 backdrop-blur-lg md:hidden">
                <div className="px-4 py-3 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                    >
                        Emailer
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* More menu button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {showMobileMenu ? "✕" : "☰"}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                {showMobileMenu && (
                    <div className="absolute top-full left-0 right-0 bg-[#12121f] border-b border-white/10 p-4 space-y-2">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowMobileMenu(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                                    ? "bg-indigo-500/20 text-indigo-400"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                        <hr className="border-white/10 my-3" />
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <span className="text-xl">🚪</span>
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Mobile Bottom Navigation - Fixed 5 items */}
            <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/98 backdrop-blur-lg border-t border-white/10 z-50 md:hidden pb-safe">
                <div className="flex items-center justify-around py-2 px-1">
                    {MOBILE_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all min-w-[56px] ${isActive(item.href)
                                ? "text-indigo-400 bg-indigo-500/10"
                                : "text-white/40"
                                }`}
                        >
                            <span className="text-lg">{item.mobileIcon}</span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    );
}
