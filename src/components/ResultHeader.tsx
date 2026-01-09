import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResultHeaderProps {
    percentage: number;
    timeSpent: string;
    totalQuestions: number;
}

export function ResultHeader({ percentage, timeSpent, totalQuestions }: ResultHeaderProps) {
    const navigate = useNavigate();
    const isPassing = percentage >= 60;

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sticky top-0 z-20 shadow-sm transition-colors duration-300">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resultado do Simulado</h1>
                        <p className="text-xs text-slate-500">{timeSpent} • {totalQuestions} Questões</p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${isPassing ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {percentage}% Aprov
                </div>
            </div>
        </header>
    );
}
