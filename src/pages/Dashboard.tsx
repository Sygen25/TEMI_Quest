import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProgressService } from '../services/progress';
import { NotificationService } from '../services/notifications';
import { useUser } from '../contexts/UserContext';

// Static topics data to match the design (now with dynamic progress state)
const STATIC_TOPICS = [
    { title: 'Hemodinâmica', icon: 'ecg_heart', count: '120 Questões' },
    { title: 'Ventilação', icon: 'air', count: '95 Questões' },
    { title: 'Infectologia', icon: 'coronavirus', count: '130 Questões' },
    { title: 'Neuro', icon: 'neurology', count: '85 Questões' },
    { title: 'Cardiologia', icon: 'monitor_heart', count: '110 Questões' },
    { title: 'Nefrologia', icon: 'water_drop', count: '65 Questões' },
    { title: 'Cirurgia', icon: 'medical_services', count: '80 Questões' },
    { title: 'POCUS', icon: 'wifi_tethering', count: '25 Questões' },
    { title: 'Obstetrícia', icon: 'pregnant_woman', count: '50 Questões' },
    { title: 'MBE', icon: 'library_books', count: '40 Questões' },
    { title: 'Paliativos', icon: 'volunteer_activism', count: '30 Questões' },
    { title: 'Endócrino', icon: 'medication', count: '60 Questões' },
    { title: 'Gastro', icon: 'restaurant', count: '45 Questões' },
    { title: 'Hematologia', icon: 'bloodtype', count: '55 Questões' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [progressMap, setProgressMap] = useState<Record<string, number>>({});
    const [globalProgress, setGlobalProgress] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        async function loadProgress() {
            // Load individual topic progress
            const newMap: Record<string, number> = {};
            for (const topic of STATIC_TOPICS) {
                const stats = await ProgressService.getTopicStats(topic.title);
                newMap[topic.title] = stats.percentage;
            }
            setProgressMap(newMap);

            // Load global progress
            const global = await ProgressService.getAllStats();
            setGlobalProgress(global.percentage);

            // Load unread notifications count
            const unread = await NotificationService.getUnreadCount();
            setUnreadCount(unread);
        }
        loadProgress();
    }, []);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pt-12 pb-2 bg-surface-light dark:bg-surface-dark rounded-b-3xl shadow-sm z-10 sticky top-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-primary overflow-hidden">
                            <img src={user?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1O9wbtqdBrh5xAbgG-NoBUL-m5ewCL0_hOmAX4hUbSmx_uoRnfwgjJO8WfBcOzxb3vM33epDc1aJfgMMrzCOv2yYEcryOkye1Fa7ThGR-d4KZXoSDKCJpK_TyENI_eEMKsbMpXQAMyb1vfYDXQ_WGAmhgiS9RxYwJAYNWhq5KL7Au2Nz61qfhAPECL0S1tO0JkGDLLYi857vZ65T5Si4q_kDW0bXspwks0Qk3cMRIntjK3nage2sbJsW2WdOOUejDB7fhG00h1M'} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Olá, {user?.display_name || 'Doutor'}</h1>
                            <p className="text-xs text-slate-500">Bem-vindo ao TEMI Quest</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/notifications')}
                        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-surface-light dark:border-surface-dark">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Progress Bar - Restored from Original Design */}
                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Progresso Geral</span>
                        <span className="text-sm font-bold text-primary">{globalProgress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 pb-24 space-y-6">
                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-3.5 border-none rounded-xl bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 shadow-sm text-base transition-all"
                        placeholder="Buscar tópicos (ex: Sepse, Trauma)"
                        type="text"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tópicos de Estudo</h2>
                    <button className="text-sm font-medium text-primary hover:text-primary/80">Ver todos</button>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {STATIC_TOPICS.map((topic) => (
                        <div
                            key={topic.title}
                            onClick={() => navigate(`/quiz/${encodeURIComponent(topic.title)}`)}
                            className="group bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3 text-primary">
                                <span className="material-symbols-outlined">{topic.icon}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 leading-tight">{topic.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{topic.count}</p>

                            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${progressMap[topic.title] || 0}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 w-full bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 text-primary">
                        <span className="material-symbols-outlined filled text-[28px]">dashboard</span>
                        <span className="text-[10px] font-medium">Início</span>
                    </button>
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined text-[28px]">quiz</span>
                        <span className="text-[10px] font-medium">Simulados</span>
                    </button>
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined text-[28px]">bar_chart</span>
                        <span className="text-[10px] font-medium">Desempenho</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined text-[28px]">person</span>
                        <span className="text-[10px] font-medium">Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
