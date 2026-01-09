import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';

interface ExamFooterProps {
    onPrev: () => void;
    onNext: () => void;
    onToggleFlag: () => void;
    isFlagged: boolean;
    isFirst: boolean;
    isLast: boolean;
}

export function ExamFooter({
    onPrev,
    onNext,
    onToggleFlag,
    isFlagged,
    isFirst,
    isLast
}: ExamFooterProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between max-w-3xl mx-auto w-full transition-colors duration-300">
            <button
                onClick={onPrev}
                disabled={isFirst}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
                onClick={onToggleFlag}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${isFlagged
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
            >
                <Flag size={20} className={isFlagged ? 'fill-yellow-600 dark:fill-yellow-500' : ''} />
                <span className="hidden sm:inline">{isFlagged ? 'Marcada' : 'Marcar para Revisão'}</span>
            </button>

            <button
                onClick={onNext}
                disabled={isLast}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                <span className="hidden sm:inline">Próxima</span>
                <ArrowRight size={20} />
            </button>
        </div>
    );
}
