import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Target,
    Clock,
    AlertTriangle,
    Home,
    GraduationCap,
    ArrowUpRight,
    Search,
    BarChart2,
    User
} from 'lucide-react';
import { ProgressService } from '../services/progress';

interface TopicInsight {
    title: string;
    percentage: number;
    total: number;
    avgTime: number;
}

export default function Analytics() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // Explicitly define stats type based on Service return
    const [stats, setStats] = useState<{ percentage: number; avgTimeSeconds: number } | null>(null);
    const [insights, setInsights] = useState<TopicInsight[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [allStats, topicData] = await Promise.all([
                ProgressService.getAllStats(),
                ProgressService.getTopicInsights()
            ]);

            setStats({
                percentage: allStats.percentage,
                avgTimeSeconds: allStats.avgTimeSeconds
            });

            // Map topic insights to UI format
            const topicInsights: TopicInsight[] = topicData.map(t => ({
                title: t.name,
                percentage: t.percentage,
                total: t.total,
                avgTime: 0 // Not tracked yet
            }));

            setInsights(topicInsights);
        } catch (error) {
            console.error('Error loading analytics', error);
        } finally {
            setLoading(false);
        }
    }

    const weakPoints = insights.slice(0, 3).filter(i => i.percentage < 70);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800/50">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Análise de Desempenho</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-soft border border-teal-500/10 dark:border-teal-500/5">
                        <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500 mb-3">
                            <Target className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa de acertos</p>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {stats?.percentage || 0}%
                        </h2>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-soft border border-blue-500/10 dark:border-blue-500/5">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-3">
                            <Clock className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tempo Médio</p>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {stats?.avgTimeSeconds || 0}s
                        </h2>
                    </div>
                </div>

                {/* Critical Analysis / Weak Points */}
                {weakPoints.length > 0 && (
                    <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-amber-900 dark:text-amber-400">Diagnóstico de Pontos Fracos</h3>
                        </div>
                        <div className="space-y-4">
                            {weakPoints.map(point => (
                                <div key={point.title} className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-4 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{point.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{point.percentage}% de acerto</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/quiz/${point.title}`)}
                                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 p-2 rounded-xl transition-colors"
                                    >
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Efficiency by Category */}
                <section>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Eficácia por Tópico</h3>
                    <div className="space-y-3">
                        {insights.map(item => (
                            <div key={item.title} className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800/40 flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-black text-sm">
                                    {item.percentage}%
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{item.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                            Taxa de acertos
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                            <Clock className="w-3 h-3 text-blue-500" />
                                            {item.avgTime}s/Q
                                        </div>
                                    </div>
                                </div>
                                <div className="h-10 w-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`w-full rounded-full ${item.percentage > 70 ? 'bg-teal-500' : item.percentage > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ height: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {insights.length === 0 && !loading && (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum dado acumulado ainda.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Navigation Bottom */}
            <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800/50 pb-safe z-50 rounded-t-3xl shadow-soft">
                <div className="flex justify-between items-center h-20 px-6 relative">
                    <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600">
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-bold tracking-tight">Início</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500">
                        <GraduationCap className="w-6 h-6" />
                        <span className="text-[10px] font-bold tracking-tight">Estudo</span>
                    </button>

                    <div className="w-14 h-14" /> {/* Spacer for Floating Action Button if added later */}

                    <button onClick={() => navigate('/analytics')} className="flex flex-1 flex-col items-center justify-center gap-1 text-teal-500">
                        <BarChart2 className="w-6 h-6" />
                        <span className="text-[10px] font-bold tracking-tight">Análise</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
