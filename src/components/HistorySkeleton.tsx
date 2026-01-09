export function HistorySkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700/50" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-1/3" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-1/4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
