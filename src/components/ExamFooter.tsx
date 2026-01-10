import { ArrowLeft, ArrowRight, Flag, CheckCircle } from 'lucide-react';

interface ExamFooterProps {
    onPrev: () => void;
    onNext: () => void;
    onToggleFlag: () => void;
    onFinish?: () => void;
    isFlagged: boolean;
    isFirst: boolean;
    isLast: boolean;
}

export function ExamFooter({
    onPrev,
    onNext,
    onToggleFlag,
    onFinish,
    isFlagged,
    isFirst,
    isLast
}: ExamFooterProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between max-w-3xl mx-auto w-full transition-colors">
            <button
                onClick={onPrev}
                disabled={isFirst}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
                onClick={onToggleFlag}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${isFlagged
                    ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
            >
                <Flag size={20} className={isFlagged ? 'fill-amber-600 dark:fill-amber-500' : ''} />
                <span className="hidden sm:inline">{isFlagged ? 'Marcada' : 'Revisar'}</span>
            </button>

            {isLast && onFinish ? (
                <button
                    onClick={onFinish}
                    className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95"
                >
                    <span className="hidden sm:inline">Finalizar</span>
                    <CheckCircle size={20} />
                </button>
            ) : (
                <button
                    onClick={onNext}
                    disabled={isLast}
                    className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <span className="hidden sm:inline">Próxima</span>
                    <ArrowRight size={20} />
                </button>
            )}
        </div>
    );
}
