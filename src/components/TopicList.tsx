import { BarChart2, Timer, BookOpen } from 'lucide-react';
import type { TopicPerformance } from '../types/exam';

interface TopicListProps {
    topics: TopicPerformance[];
}

export function TopicList({ topics }: TopicListProps) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Desempenho por Tópico
            </h2>
            <div className="space-y-4">
                {topics.map((topic) => (
                    <div key={topic.name}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{topic.name}</span>
                            <span className={`font-bold ${topic.percentage >= 70 ? 'text-green-600' : topic.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {topic.percentage}% ({topic.correct}/{topic.total})
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${topic.percentage >= 70 ? 'bg-green-500' : topic.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${topic.percentage}%` }}
                            ></div>
                        </div>

                        {/* Metrics Row */}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                <Timer className="w-3.5 h-3.5" />
                                <span>{topic.avgTimeSeconds > 0 ? `${topic.avgTimeSeconds}s / questão` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>
                                    Recomendação: <span className="text-primary font-bold">{topic.recommendationCount} questões</span> em 7 dias
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
