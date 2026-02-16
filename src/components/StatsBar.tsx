"use client";

interface StatItem {
    value: string | number;
    label: string;
    color?: string;
    style?: React.CSSProperties;
}

interface StatsBarProps {
    items: StatItem[];
    columns?: 2 | 3 | 4 | 5 | 6;
}

const GRID_COLS: Record<number, string> = {
    2: "grid grid-cols-2 gap-3 mb-6",
    3: "grid grid-cols-3 gap-4 mb-6",
    4: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6",
    5: "grid grid-cols-2 md:grid-cols-5 gap-3 mb-6",
    6: "grid grid-cols-2 md:grid-cols-6 gap-3 mb-6",
};

export function StatsBar({ items, columns }: StatsBarProps) {
    const cols = columns || items.length;
    const gridClass = GRID_COLS[cols] || GRID_COLS[4];

    return (
        <div className={gridClass}>
            {items.map((item, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-slate-900 border border-slate-200 rounded-xl p-4"
                >
                    <div
                        className={`text-2xl font-bold ${item.color || "text-slate-900 dark:text-white"}`}
                        style={item.style}
                    >
                        {item.value}
                    </div>
                    <div className="text-xs text-slate-500">{item.label}</div>
                </div>
            ))}
        </div>
    );
}
