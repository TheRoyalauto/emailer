"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { colors } from "@/config/theme";

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
            <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-8 h-8 border-2 border-[#FF6B4A] border-t-transparent rounded-full" />
                    <p className="text-[#9CA3AF]">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

// Navigation items - simplified to core hubs only
const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠", mobileIcon: "🏠" },
    { href: "/campaigns", label: "Campaigns", icon: "📧", mobileIcon: "📧" },
    { href: "/contacts", label: "Contacts", icon: "👥", mobileIcon: "👥" },
    { href: "/templates", label: "Templates", icon: "📝", mobileIcon: "📝" },
    { href: "/scraper", label: "Leads", icon: "🔎", mobileIcon: "🔎" },
    { href: "/accounts", label: "Accounts", icon: "⚙️", mobileIcon: "⚙️" },
];

// Mobile bottom nav items (first 5 - Accounts accessible via menu)
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

// Unified App Header - LIGHT MODE
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
            <header className="border-b border-[#E5E7EB] bg-white/95 sticky top-0 z-50 backdrop-blur-lg hidden md:block shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link
                            href="/dashboard"
                            className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity"
                        >
                            Emailer
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="flex items-center gap-1">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive(item.href)
                                            ? "bg-[#FF6B4A]/10 text-[#FF6B4A]"
                                            : "text-[#4B5563] hover:text-[#1A1D26] hover:bg-[#F1F3F8]"
                                        }`}
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span className="hidden lg:inline">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#1A1D26] hover:bg-[#F1F3F8] rounded-lg transition-all duration-200"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Mobile Header */}
            <header className="border-b border-[#E5E7EB] bg-white/95 sticky top-0 z-50 backdrop-blur-lg md:hidden shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="text-xl font-bold text-gradient"
                    >
                        Emailer
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* More menu button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-[#4B5563] hover:text-[#1A1D26] hover:bg-[#F1F3F8] rounded-lg transition-colors"
                        >
                            {showMobileMenu ? "✕" : "☰"}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                {showMobileMenu && (
                    <div className="absolute top-full left-0 right-0 bg-white border-b border-[#E5E7EB] p-4 space-y-2 shadow-lg animate-slideUp">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowMobileMenu(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.href)
                                        ? "bg-[#FF6B4A]/10 text-[#FF6B4A]"
                                        : "text-[#4B5563] hover:bg-[#F1F3F8] hover:text-[#1A1D26]"
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                        <hr className="border-[#E5E7EB] my-3" />
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                        >
                            <span className="text-xl">🚪</span>
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-[#E5E7EB] z-50 md:hidden pb-safe shadow-lg">
                <div className="flex items-center justify-around py-2 px-1">
                    {MOBILE_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all min-w-[56px] ${isActive(item.href)
                                    ? "text-[#FF6B4A] bg-[#FF6B4A]/10"
                                    : "text-[#9CA3AF]"
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
