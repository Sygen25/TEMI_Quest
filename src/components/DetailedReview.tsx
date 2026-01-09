import { useState } from 'react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import type { QuestionDetail } from '../types/exam';
import QuestionDisplay from './QuestionDisplay';

interface DetailedReviewProps {
    questions: QuestionDetail[];
}

export function DetailedReview({ questions }: DetailedReviewProps) {
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    const filteredQuestions = questions.filter(q => {
        if (filter === 'all') return true;
        if (filter === 'correct') return q.isCorrect;
        if (filter === 'incorrect') return !q.isCorrect && !q.isSkipped;
        if (filter === 'skipped') return q.isSkipped;
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Revisão Detalhada
                </h2>
                <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {(['all', 'correct', 'incorrect', 'skipped'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filter === f
                                ? 'bg-slate-100 dark:bg-slate-700 text-primary'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {f === 'all' && 'Todas'}
                            {f === 'correct' && 'Acertos'}
                            {f === 'incorrect' && 'Erros'}
                            {f === 'skipped' && 'Pulos'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filteredQuestions.map((q, index) => (
                    <div
                        key={q.id}
                        className={`bg-white dark:bg-slate-800 rounded-xl border transition-all overflow-hidden ${q.isCorrect ? 'border-l-4 border-l-green-500 border-slate-200 dark:border-slate-700' :
                            q.isSkipped ? 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-700' :
                                'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        <button
                            onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                            className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <div className={`mt-0.5 min-w-[24px] h-6 flex items-center justify-center rounded-full text-xs font-bold ${q.isCorrect ? 'bg-green-100 text-green-700' :
                                q.isSkipped ? 'bg-slate-100 text-slate-600' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {/* Use filtered index or original index? Typically localized index for list view */}
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        {q.topico}
                                    </span>
                                    {expandedQuestion === q.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                                    {q.enunciado}
                                </p>
                            </div>
                        </button>

                        {expandedQuestion === q.id && (
                            <div className="px-4 pb-6 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2 bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="pt-4">
                                    <QuestionDisplay
                                        question={q}
                                        selectedOption={q.selectedOption}
                                        onOptionSelect={() => { }}
                                        showFeedback={true}
                                        isAnswered={true}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {filteredQuestions.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        Nenhuma questão encontrada com este filtro.
                    </div>
                )}
            </div>
        </div>
    );
}
