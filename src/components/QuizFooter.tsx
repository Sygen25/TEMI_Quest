import { ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizFooterProps {
    isReviewMode: boolean;
    onNext: () => void;
    onPrevious?: () => void;
    hasPrevious?: boolean;
    onBack?: () => void;
    isAnswered?: boolean;
}

export function QuizFooter({
    isReviewMode,
    onNext,
    onPrevious,
    hasPrevious = false,
    onBack,
    isAnswered = false
}: QuizFooterProps) {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-40 transition-colors duration-300">
            <div className="flex justify-around items-center h-16 px-2 w-full max-w-4xl mx-auto gap-1">
                {isReviewMode ? (
                    <button
                        onClick={onBack}
                        className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-800 dark:text-white transition-colors hover:text-primary active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Voltar ao Histórico</span>
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors active:scale-95
                                ${hasPrevious
                                    ? 'text-slate-600 dark:text-slate-300 hover:text-primary'
                                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            <ArrowLeft className="w-6 h-6" />
                            <span className="text-[10px] font-bold">Voltar</span>
                        </button>

                        <button
                            onClick={onNext}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors active:scale-95
                                ${isAnswered
                                    ? 'text-primary'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-primary'
                                }`}
                        >
                            <ArrowRight className="w-6 h-6" />
                            <span className={`text-[10px] font-bold`}>
                                {isAnswered ? 'Próxima' : 'Pular'}
                            </span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
