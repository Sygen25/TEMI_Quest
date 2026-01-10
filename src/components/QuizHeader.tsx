import { ArrowLeft } from 'lucide-react';
import { FontSizeControls } from './FontSizeControls';

interface QuizHeaderProps {
    topic: string | undefined;
    currentIndex: number;
    onBack: () => void;
}

export function QuizHeader({
    topic,
    currentIndex,
    onBack
}: QuizHeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate uppercase tracking-widest">
                            {topic || 'Quiz'}
                        </h1>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                            Questão {currentIndex + 1}
                        </p>
                    </div>
                </div>

                <FontSizeControls />
            </div>
        </header>
    );
}
