"use client";

import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import { ImpersonationBanner } from "./ImpersonationBanner";

interface AuthGuardProps {
    children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <ImpersonationBanner />
            {children}
        </>
    );
}

// Navigation items — core hubs with SVG icons
const NAV_ITEMS = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        href: "/campaigns",
        label: "Campaigns",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
        ),
    },
    {
        href: "/contacts",
        label: "Contacts",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
    },
    {
        href: "/templates",
        label: "Templates",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
    },
    {
        href: "/scraper",
        label: "Leads",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
        ),
    },
    {
        href: "/accounts",
        label: "Accounts",
        icon: (
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

// Mobile bottom nav items (first 5)
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 5);

// Unified App Header — matches marketing Navbar style
export function AppHeader() {
    const { logout, userName, userEmail } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("emailer_dark_mode");
        if (stored === "true") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    // Close user menu on outside click
    useEffect(() => {
        const close = () => setShowUserMenu(false);
        if (showUserMenu) {
            document.addEventListener("click", close);
            return () => document.removeEventListener("click", close);
        }
    }, [showUserMenu]);

    const handleSignOut = async () => {
        await logout();
    };

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem("emailer_dark_mode", String(next));
        if (next) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/" || pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    // User initials for avatar
    const initials = (userName || userEmail || "U")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    // User dropdown menu items
    const menuItems = [
        {
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            label: "Settings",
            onClick: () => { router.push("/settings"); setShowUserMenu(false); },
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
            ),
            label: "Billing & Plans",
            onClick: () => { router.push("/settings?tab=billing"); setShowUserMenu(false); },
        },
        {
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
            ),
            label: "Help & Support",
            onClick: () => { router.push("/faq"); setShowUserMenu(false); },
        },
    ];

    // User avatar component (shared between desktop and mobile)
    const UserAvatar = ({ size = "md" }: { size?: "sm" | "md" }) => (
        <button
            onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
            className={`relative flex items-center gap-2.5 rounded-xl transition-all duration-200 ${showUserMenu
                ? "bg-slate-100 ring-2 ring-cyan-200"
                : "hover:bg-slate-50"
                } ${size === "sm" ? "p-1.5" : "pl-3 pr-2 py-1.5"}`}
        >
            {size === "md" && (
                <div className="text-right hidden lg:block">
                    <div className="text-[13px] font-semibold text-slate-900 leading-tight tracking-[-0.01em]">
                        {userName || "User"}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                        {userEmail || ""}
                    </div>
                </div>
            )}
            <div className={`rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-semibold shadow-sm ${size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"}`}>
                {initials}
            </div>
            <svg className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""} ${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </button>
    );

    // User dropdown panel
    const UserDropdown = () => (
        <div
            className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            {/* User info header */}
            <div className="px-4 py-3.5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{userName || "User"}</div>
                        <div className="text-[11px] text-slate-400 truncate">{userEmail || ""}</div>
                    </div>
                </div>
            </div>

            {/* Dark mode toggle */}
            <div className="px-2 py-2 border-b border-slate-100">
                <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                            {darkMode ? (
                                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                            {darkMode ? "Light Mode" : "Dark Mode"}
                        </span>
                    </div>
                    {/* Toggle switch */}
                    <div className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${darkMode ? "bg-cyan-500" : "bg-slate-200"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${darkMode ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                </button>
            </div>

            {/* Menu items */}
            <div className="px-2 py-2">
                {menuItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors text-slate-400 group-hover:text-slate-600">
                            {item.icon}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Sign out */}
            <div className="px-2 py-2 border-t border-slate-100">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all group"
                >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Header */}
            <header className="border-b border-slate-200/80 bg-white/90 sticky top-0 z-50 backdrop-blur-xl hidden md:block shadow-sm">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo — matches marketing nav */}
                        <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                            <img
                                src="/logo.png"
                                alt="E-Mailer"
                                className="h-11 w-auto object-contain"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="flex items-center gap-1">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 flex items-center gap-2 tracking-[-0.01em] ${isActive(item.href)
                                        ? "bg-cyan-50 text-cyan-600"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                >
                                    {item.icon}
                                    <span className="hidden lg:inline">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* User Avatar Dropdown */}
                    <div className="relative">
                        <UserAvatar size="md" />
                        {showUserMenu && <UserDropdown />}
                    </div>
                </div>
            </header>

            {/* Mobile Header */}
            <header className="border-b border-slate-200/80 bg-white/90 sticky top-0 z-50 backdrop-blur-xl md:hidden shadow-sm">
                <div className="px-4 py-2.5 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="E-Mailer"
                            className="h-9 w-auto object-contain"
                        />
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* User avatar on mobile */}
                        <div className="relative">
                            <UserAvatar size="sm" />
                            {showUserMenu && <UserDropdown />}
                        </div>

                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {showMobileMenu ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                {showMobileMenu && (
                    <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 space-y-1 shadow-lg animate-slideUp">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setShowMobileMenu(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.href)
                                    ? "bg-cyan-50 text-cyan-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-slate-200 z-50 md:hidden pb-safe shadow-lg">
                <div className="flex items-center justify-around py-2 px-1">
                    {MOBILE_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all min-w-[56px] ${isActive(item.href)
                                ? "text-cyan-600 bg-cyan-50"
                                : "text-slate-400"
                                }`}
                        >
                            {item.icon}
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    );
}
