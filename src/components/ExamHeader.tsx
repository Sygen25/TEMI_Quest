import { Clock, Menu, PauseCircle } from 'lucide-react';
import { FontSizeControls } from './FontSizeControls';

interface ExamHeaderProps {
    currentIndex: number;
    totalQuestions: number;
    timeLeft: number | null;
    onPause: () => void;
    onFinish: () => void;
    onOpenSidebar: () => void;
    hideTotal?: boolean;
}

export function ExamHeader({
    currentIndex,
    totalQuestions,
    timeLeft,
    onPause,
    onFinish,
    onOpenSidebar,
    hideTotal = false
}: ExamHeaderProps) {

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 px-4 md:px-6 flex items-center justify-between gap-4 shadow-sm/50 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Menu size={22} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Questão
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white leading-none">
                        {currentIndex + 1}
                        {!hideTotal && <span className="text-slate-300 dark:text-slate-600 font-normal">/ {totalQuestions}</span>}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <FontSizeControls />

                {timeLeft !== null && (
                    <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Clock size={16} className={`${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                        <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onPause}
                    className="flex items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Pausar e continuar depois"
                >
                    <PauseCircle size={18} />
                    <span className="hidden sm:inline text-sm font-medium">Pausar</span>
                </button>
                <button
                    onClick={onFinish}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/10"
                >
                    Finalizar
                </button>
            </div>
        </header>
    );
}
