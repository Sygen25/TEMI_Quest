import { Clock, Menu, Pause } from 'lucide-react';

interface ExamHeaderProps {
    currentIndex: number;
    totalQuestions: number;
    timeLeft: number;
    onPause: () => void;
    onFinish: () => void;
    onOpenSidebar: () => void;
}

export function ExamHeader({
    currentIndex,
    totalQuestions,
    timeLeft,
    onPause,
    onFinish,
    onOpenSidebar
}: ExamHeaderProps) {

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    title="Menu de Questões"
                >
                    <Menu size={24} />
                </button>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulado</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                        Questão {currentIndex + 1} de {totalQuestions}
                    </span>
                </div>
            </div>

            <div className={`flex items-center gap-2 font-mono text-xl font-bold transition-colors ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'
                }`}>
                <Clock size={20} />
                {formatTime(timeLeft)}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onPause}
                    className="flex items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Pausar e continuar depois"
                >
                    <Pause size={18} />
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
