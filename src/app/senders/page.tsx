"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SendersRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/accounts");
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
                <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-cyan-500 rounded-full" />
                <span className="text-sm">Redirecting to Email Accounts...</span>
            </div>
        </div>
    );
}
