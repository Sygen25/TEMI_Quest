import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';

interface ExamSession {
    id: string;
    created_at: string;
    score: number;
    total_questions: number;
}

interface ExamHistoryItemProps {
    session: ExamSession;
}

export function ExamHistoryItem({ session }: ExamHistoryItemProps) {
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number | null) => {
        if (score == null) return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
        if (score >= 70) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (score >= 50) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    };

    return (
        <div
            onClick={() => navigate(`/exam/results?session=${session.id}`)}
            className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${getScoreColor(session.score)}`}>
                    {session.score != null ? `${Math.round(session.score)}%` : '—'}
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Simulado Oficial</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.created_at)}</span>
                    </div>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
        </div>
    );
}
