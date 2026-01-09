import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ResultStatsProps {
    correct: number;
    incorrect: number;
    unanswered: number;
    timeSpent: string;
}

export function ResultStats({ correct, incorrect, unanswered, timeSpent }: ResultStatsProps) {
    return (
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-5 border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">{correct}</div>
                <div className="text-xs text-green-600/80 uppercase font-bold tracking-wide">Questões Corretas</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-5 border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center text-center">
                <XCircle className="w-8 h-8 text-red-600 mb-2" />
                <div className="text-3xl font-bold text-red-700 dark:text-red-400">{incorrect}</div>
                <div className="text-xs text-red-600/80 uppercase font-bold tracking-wide">Questões Erradas</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">{unanswered}</div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">Não Respondidas</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{timeSpent}</div>
                <div className="text-xs text-blue-600/80 uppercase font-bold tracking-wide">Tempo Total</div>
            </div>
        </div>
    );
}
