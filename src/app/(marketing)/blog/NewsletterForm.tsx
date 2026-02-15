"use client";

export default function NewsletterForm() {
    return (
        <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
        >
            <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 px-4 py-3.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:border-white/30 focus:ring-1 focus:ring-white/30 focus:outline-none transition-colors"
            />
            <button
                type="submit"
                className="px-6 py-3.5 bg-white text-slate-900 font-semibold rounded-lg text-sm hover:bg-slate-100 active:scale-[0.98] transition-all"
            >
                Subscribe
            </button>
        </form>
    );
}
