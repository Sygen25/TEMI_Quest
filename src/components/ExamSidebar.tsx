import { useExam } from '../contexts/ExamContext';
import { Flag, X } from 'lucide-react';

interface ExamSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ExamSidebar({ isOpen, onClose }: ExamSidebarProps) {
    const { questions, currentIndex, answers, flags, jumpToQuestion } = useExam();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Mapa da Prova</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                    <X size={20} />
                </button>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        const isAnswered = !!answers[q.id];
                        const isFlagged = flags.includes(q.id);
                        const isCurrent = idx === currentIndex;

                        let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                        if (isAnswered) bgClass = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                        if (isFlagged) bgClass = 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
                        if (isCurrent) bgClass += ' ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900';

                        return (
                            <button
                                key={q.id}
                                onClick={() => {
                                    jumpToQuestion(idx);
                                    // Optional: Don't close on click, let user navigate freely
                                }}
                                className={`
                                    relative h-10 w-10 rounded-lg text-sm font-bold flex items-center justify-center border transition-all
                                    ${bgClass}
                                    ${!isAnswered && !isFlagged ? 'border-transparent hover:border-slate-300 dark:hover:border-slate-600' : ''}
                                `}
                            >
                                {idx + 1}
                                {isFlagged && (
                                    <div className="absolute -top-1 -right-1">
                                        <Flag size={10} className="fill-yellow-500 text-yellow-500" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                    <span>Respondida</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200"></div>
                    <span>Marcada para Revisão</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
                    <span>Não Respondida</span>
                </div>
            </div>
        </div>
    );
}
