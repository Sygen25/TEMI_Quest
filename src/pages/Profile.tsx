import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Pencil,
    History,
    HelpCircle,
    CheckCircle2,
    Timer,
    Flame,
    TrendingUp
} from 'lucide-react';
import { ProgressService } from '../services/progress';
import { NotificationService } from '../services/notifications';
import { useUser } from '../contexts/UserContext';
import { BottomNavigation } from '../components/BottomNavigation';

// Official Clinical Topics (TEMI 2026)
const PROFILE_TOPICS = [
    { title: 'Hemodinâmica', icon: 'favorite' },
    { title: 'Ventilação mecânica', icon: 'air' },
    { title: 'Monitorização multimodal', icon: 'monitoring' },
    { title: 'Cardiologia', icon: 'ecg' },
    { title: 'Nutrição', icon: 'restaurant' },
    { title: 'Gastroenterologia', icon: 'medication' },
    { title: 'Nefrologia', icon: 'water_drop' },
    { title: 'Neurointensivismo', icon: 'psychology' },
    { title: 'Endocrinologia', icon: 'health_and_safety' },
    { title: 'Cirurgia e Trauma', icon: 'medical_services' },
    { title: 'Sepse e infecções', icon: 'coronavirus' },
    { title: 'Oncologia e hematologia', icon: 'biotech' },
    { title: 'Obstetrícia', icon: 'child_care' },
    { title: 'Gestão em UTI', icon: 'analytics' },
    { title: 'Cuidados paliativos', icon: 'volunteer_activism' },
    { title: 'MBE', icon: 'library_books' },
    { title: 'Miscelânea', icon: 'category' },
];

interface GlobalStats {
    total: number;
    correct: number;
    percentage: number;
    uniqueDays: number;
    avgTimeSeconds: number;
}

interface TopicStat {
    title: string;
    total: number;
    percentage: number;
}

export default function Profile() {
    const navigate = useNavigate();

    const [globalStats, setGlobalStats] = useState<GlobalStats>({ total: 0, correct: 0, percentage: 0, uniqueDays: 0, avgTimeSeconds: 0 });
    const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
    const [weeklyData, setWeeklyData] = useState<{ date: string; percentage: number | null; total: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const { user: userProfile } = useUser();

    useEffect(() => {
        async function loadStats() {
            // Run all requests in parallel for faster loading
            const [global, insights, weekly, admin] = await Promise.all([
                ProgressService.getAllStats(),
                ProgressService.getTopicInsights(),
                ProgressService.getWeeklyStats(),
                NotificationService.isAdmin()
            ]);

            setGlobalStats(global);

            const stats: TopicStat[] = PROFILE_TOPICS.map(topic => {
                const insight = insights.find(i => i.name === topic.title);
                return {
                    title: topic.title,
                    total: insight?.total || 0,
                    percentage: insight?.percentage || 0
                };
            });
            setTopicStats(stats);

            setWeeklyData(weekly);
            setIsAdmin(admin);
            setLoading(false);
        }
        loadStats();
    }, []);

    // Generate SVG path from weekly data
    const generateChartPath = () => {
        if (weeklyData.length === 0) return { linePath: '', areaPath: '', points: [] };

        const width = 400;
        const height = 120;
        const padding = 10;
        const chartWidth = width - padding * 2;
        const chartHeight = height - 20;

        // Get valid data points (days with activity)
        const validPoints = weeklyData.map((day, index) => ({
            x: padding + (chartWidth / 6) * index,
            y: day.percentage !== null ? chartHeight - (day.percentage / 100) * chartHeight + 10 : null,
            hasData: day.total > 0
        }));

        // Build path string
        let linePath = '';
        let areaPath = '';
        const points: { x: number; y: number }[] = [];

        validPoints.forEach((point) => {
            if (point.y !== null) {
                points.push({ x: point.x, y: point.y });
                if (linePath === '') {
                    linePath = `M${point.x},${point.y}`;
                    areaPath = `M${point.x},${point.y}`;
                } else {
                    // Simple curve
                    const prev = points[points.length - 2];
                    if (prev) {
                        const midX = (prev.x + point.x) / 2;
                        linePath += ` C${midX},${prev.y} ${midX},${point.y} ${point.x},${point.y}`;
                        areaPath += ` C${midX},${prev.y} ${midX},${point.y} ${point.x},${point.y}`;
                    } else {
                        linePath += ` L${point.x},${point.y}`;
                        areaPath += ` L${point.x},${point.y}`;
                    }
                }
            }
        });

        // Close area path
        if (points.length > 0) {
            areaPath += ` L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;
        }

        return { linePath, areaPath, points };
    };

    const { linePath, areaPath, points } = generateChartPath();

    // Get day labels
    const getDayLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return 'Hoje';
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return days[date.getDay()];
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col pb-safe font-display">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 bg-slate-50 dark:bg-background-dark sticky top-0 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="w-6"></div> {/* Spacer for center alignment */}
                    <h1 className="text-[18px] font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
                    <button
                        onClick={() => navigate('/settings')}
                        className="text-slate-300 hover:text-slate-600 transition-colors relative"
                    >
                        <Settings className="w-6 h-6" />
                        {isAdmin && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-slate-50 dark:border-background-dark"></span>
                        )}
                    </button>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-emerald-400">
                            <img
                                src={userProfile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1O9wbtqdBrh5xAbgG-NoBUL-m5ewCL0_hOmAX4hUbSmx_uoRnfwgjJO8WfBcOzxb3vM33epDc1aJfgMMrzCOv2yYEcryOkye1Fa7ThGR-d4KZXoSDKCJpK_TyENI_eEMKsbMpXQAMyb1vfYDXQ_WGAmhgiS9RxYwJAYNWhq5KL7Au2Nz61qfhAPECL0S1tO0JkGDLLYi857vZ65T5Si4q_kDW0bXspwks0Qk3cMRIntjK3nage2sbJsW2WdOOUejDB7fhG00h1M'}
                                alt={userProfile?.display_name || 'Usuário'}
                                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800"
                            />
                        </div>
                        <button onClick={() => navigate('/settings')} className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{userProfile?.display_name || 'Usuário'}</h2>
                    <p className="text-sm text-slate-400">{userProfile?.email || 'Toque para configurar seu perfil'}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col">
                    <button
                        onClick={() => navigate('/history')}
                        className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white py-3.5 rounded-2xl shadow-lg shadow-teal-500/20 text-sm font-bold transition-all"
                    >
                        <History className="w-5 h-5" />
                        Histórico de Questões
                    </button>
                </div>
            </header>

            <main className="flex-1 px-6 pb-24 space-y-8">
                {/* Stats Summary */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">RESUMO DO PROGRESSO</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Stat 1 */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{globalStats.total.toLocaleString()}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QUESTÕES TOTAIS</div>
                        </div>

                        {/* Stat 2 */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft relative">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{globalStats.percentage}%</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TAXA DE ACERTOS</div>
                        </div>

                        {/* Stat 3 */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                                <Timer className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                {globalStats.avgTimeSeconds > 0
                                    ? `${Math.floor(globalStats.avgTimeSeconds / 60)}m ${globalStats.avgTimeSeconds % 60}s`
                                    : '--'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TEMPO / QUESTÃO</div>
                        </div>

                        {/* Stat 4 */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                                <Flame className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{globalStats.uniqueDays} Dias</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEQUÊNCIA</div>
                        </div>
                    </div>
                </section>

                {/* Weekly Performance Chart - Dynamic */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Desempenho Semanal</h3>
                            <p className="text-xs text-slate-400">Pontuação média nos últimos 7 dias</p>
                        </div>
                        {globalStats.percentage >= 70 ? (
                            <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-lg">
                                <TrendingUp className="w-3 h-3" />
                                Ótimo
                            </span>
                        ) : globalStats.percentage >= 50 ? (
                            <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-lg">
                                <TrendingUp className="w-3 h-3" />
                                Bom
                            </span>
                        ) : globalStats.total > 0 ? (
                            <span className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-lg">
                                <TrendingUp className="w-3 h-3" />
                                Melhorar
                            </span>
                        ) : null}
                    </div>

                    {/* Dynamic SVG Line Chart */}
                    <div className="w-full h-32 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                            <div className="border-b border-dashed border-slate-100 dark:border-slate-700/50 w-full h-px"></div>
                            <div className="border-b border-dashed border-slate-100 dark:border-slate-700/50 w-full h-px"></div>
                            <div className="border-b border-dashed border-slate-100 dark:border-slate-700/50 w-full h-px"></div>
                        </div>

                        {points.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                Responda questões para ver seu gráfico!
                            </div>
                        ) : (
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Area fill */}
                                {areaPath && (
                                    <path
                                        d={areaPath}
                                        fill="url(#chartGradient)"
                                        stroke="none"
                                    />
                                )}
                                {/* Line */}
                                {linePath && (
                                    <path
                                        d={linePath}
                                        fill="none"
                                        stroke="#14b8a6"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                )}
                                {/* Points */}
                                {points.map((point, i) => (
                                    <circle
                                        key={i}
                                        cx={point.x}
                                        cy={point.y}
                                        r="4"
                                        fill="white"
                                        stroke="#14b8a6"
                                        strokeWidth="3"
                                    />
                                ))}
                            </svg>
                        )}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase">
                        {weeklyData.map((day, i) => (
                            <span key={i}>{getDayLabel(day.date)}</span>
                        ))}
                    </div>
                </section>

                {/* Performance by Topic */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">DESEMPENHO POR TÓPICO</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-slate-400">Carregando...</div>
                        ) : topicStats.length === 0 ? (
                            <div className="text-center text-slate-400">Responda questões para ver seu progresso!</div>
                        ) : (
                            topicStats.map((stat, index) => {
                                const topicConfig = PROFILE_TOPICS[index];
                                const iconName = topicConfig?.icon || 'brain';

                                return (
                                    <div key={stat.title} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-soft border border-transparent hover:border-primary/10 transition-all">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{stat.title}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Taxa de acertos</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-slate-900 dark:text-white text-lg">{stat.percentage}%</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${stat.percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
}
