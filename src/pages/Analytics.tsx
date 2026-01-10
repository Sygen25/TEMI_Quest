import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Target,
    Zap,
    Brain,
    Trophy,
    TrendingUp,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { ProgressService } from '../services/progress';
import { BottomNavigation } from '../components/BottomNavigation';
import { ActivityHeatmap } from '../components/analytics/ActivityHeatmap';

interface TopicStat {
    name: string;
    percentage: number;
    total: number;
    avgTimeSeconds: number;
}

interface YearlyActivity {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export default function Analytics() {
    const navigate = useNavigate();
    // const { user } = useUser();
    const [loading, setLoading] = useState(true);

    // Stats State
    const [globalStats, setGlobalStats] = useState({ percentage: 0, avgTimeSeconds: 0, total: 0, uniqueDays: 0 });
    const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
    const [yearlyActivity, setYearlyActivity] = useState<YearlyActivity[]>([]);

    // Derived State
    const [insights, setInsights] = useState<{ type: 'positive' | 'negative' | 'neutral', text: string, icon: any }[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [allStats, topics, activity] = await Promise.all([
                ProgressService.getAllStats(),
                ProgressService.getTopicInsights(),
                ProgressService.getYearlyActivity()
            ]);

            setGlobalStats(allStats);

            // Map topics
            const mappedTopics = topics.map(t => ({
                name: t.name,
                percentage: t.percentage,
                total: t.total,
                avgTimeSeconds: t.avgTimeSeconds
            }));
            setTopicStats(mappedTopics);

            setYearlyActivity(activity);

            // Generate Cognitive Insights
            const newInsights = [];

            // 1. Accuracy Insight
            if (allStats.percentage > 80) {
                newInsights.push({ type: 'positive', text: 'Sua precisão é de elite! Continue assim.', icon: Trophy });
            } else if (allStats.percentage < 50 && allStats.total > 20) {
                newInsights.push({ type: 'negative', text: 'Atenção à precisão. Tente revisar os erros.', icon: AlertCircle });
            }

            // 2. Speed vs Accuracy (Cognitive Load)
            const fastButWrong = mappedTopics.filter(t => t.avgTimeSeconds < 45 && t.percentage < 60 && t.total > 5);
            if (fastButWrong.length > 0) {
                newInsights.push({
                    type: 'negative',
                    text: `Você responde muito rápido em ${fastButWrong[0].name}, mas a precisão está baixa. Vá com calma!`,
                    icon: Zap
                });
            }

            // 3. Consistency
            if (allStats.uniqueDays > 5) {
                newInsights.push({ type: 'positive', text: 'Sua consistência é admirável. O hábito vence o talento.', icon: TrendingUp });
            }

            setInsights(newInsights as any);

        } catch (error) {
            console.error('Error loading analytics', error);
        } finally {
            setLoading(false);
        }
    }

    // Sort topics for Matrix
    const strongTopics = topicStats.filter(t => t.percentage >= 70 && t.total >= 5).sort((a, b) => b.percentage - a.percentage);
    const weakTopics = topicStats.filter(t => t.percentage < 70 && t.total >= 5).sort((a, b) => a.percentage - b.percentage);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark pb-32 transition-colors duration-300 font-display">
            {/* Header */}
            <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800/50">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Painel de Estatísticas</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">

                {/* 1. Hero Metrics (The "Nerve Center") */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500">
                                <Target className="w-5 h-5" />
                            </div>
                            <span className={globalStats.percentage >= 70 ? "text-green-500 text-xs font-bold" : "text-amber-500 text-xs font-bold"}>
                                {globalStats.percentage >= 70 ? 'Ótimo' : 'Regular'}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {globalStats.percentage}%
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precisão Global</p>
                    </div>

                    <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <Brain className="w-5 h-5" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {globalStats.total}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questões Realizadas</p>
                    </div>
                </section>

                {/* 2. Metrografia (Heatmap) */}
                <section className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Heatmap</h3>
                            <p className="text-xs text-slate-400">Questões respondidas nos últimos 30 dias</p>
                        </div>
                    </div>

                    <ActivityHeatmap data={yearlyActivity} daysToShow={30} />
                </section>

                {/* 3. Cognitive Insights */}
                {insights.length > 0 && (
                    <section className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Insights Cognitivos</h3>
                        {insights.map((insight, idx) => {
                            const Icon = insight.icon;
                            let colorClass = 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
                            if (insight.type === 'positive') colorClass = 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300';
                            if (insight.type === 'negative') colorClass = 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';

                            return (
                                <div key={idx} className={`p-4 rounded-2xl flex items-start gap-4 ${colorClass}`}>
                                    <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                                    <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* 4. Matrix (Strengths vs Weaknesses) */}
                <section>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Matriz de Desempenho</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Pontos Fortes</span>
                            </div>
                            {strongTopics.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Continue praticando para descobrir seus pontos fortes.</p>
                            ) : (
                                strongTopics.slice(0, 5).map(topic => (
                                    <div key={topic.name} className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-800 rounded-xl border-l-4 border-teal-500 shadow-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{topic.name}</span>
                                        <span className="font-bold text-teal-600 dark:text-teal-400">{topic.percentage}%</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Weaknesses */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">A Melhorar</span>
                            </div>
                            {weakTopics.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">Nenhum ponto fraco crítico identificado ainda.</p>
                            ) : (
                                weakTopics.slice(0, 5).map(topic => (
                                    <div key={topic.name} className="flex items-center justify-between text-sm p-3 bg-white dark:bg-slate-800 rounded-xl border-l-4 border-amber-500 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{topic.name}</span>
                                            <span className="text-[10px] text-slate-400">{topic.avgTimeSeconds}s/questão</span>
                                        </div>
                                        <span className="font-bold text-amber-600 dark:text-amber-400">{topic.percentage}%</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {globalStats.total === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-slate-400">Comece a fazer simulados para alimentar o Painel de Estatísticas!</p>
                    </div>
                )}
            </main>

            <BottomNavigation />
        </div>
    );
}
