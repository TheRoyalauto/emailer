"use client";

interface PageEmptyStateProps {
    icon: string;
    title?: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    buttonClassName?: string;
}

export function PageEmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    buttonClassName = "px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium",
}: PageEmptyStateProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">{icon}</div>
            {title && (
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {title}
                </h3>
            )}
            <p className="text-slate-500 text-sm mb-4">{description}</p>
            {onAction && actionLabel && (
                <button onClick={onAction} className={buttonClassName}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
