

interface ResultChartProps {
    percentage: number;
    correct: number;
    incorrect: number;
    skipped: number;
    total: number;
}

export function ResultChart({ percentage, correct, incorrect, skipped, total }: ResultChartProps) {
    const isPassing = percentage >= 60;
    const circumference = 2 * Math.PI * 40; // r=40

    // Calculate dashes
    const correctDash = (correct / total) * circumference;
    const incorrectDash = (incorrect / total) * circumference;
    const skippedDash = (skipped / total) * circumference;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative">
            <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-700" />

                    {/* Incorrect (Red) */}
                    <circle
                        cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12"
                        strokeDasharray={`${incorrectDash} ${circumference}`}
                        strokeDashoffset={-correctDash}
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* Skipped (Gray) */}
                    <circle
                        cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" strokeWidth="12"
                        strokeDasharray={`${skippedDash} ${circumference}`}
                        strokeDashoffset={-(correctDash + incorrectDash)}
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* Correct (Green) */}
                    <circle
                        cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="12"
                        strokeDasharray={`${correctDash} ${circumference}`}
                        strokeDashoffset="0"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                        {percentage}%
                    </span>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Acertos</span>
                </div>
            </div>

            <div className="flex gap-4 mt-4 text-xs font-medium">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Acertos</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Erros</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Pulos</div>
            </div>
        </div>
    );
}
