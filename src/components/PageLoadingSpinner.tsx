"use client";

export function PageLoadingSpinner() {
    return (
        <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
        </div>
    );
}
