import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProgressService } from '../services/progress';
import { NotificationService } from '../services/notifications';
import { useUser } from '../contexts/UserContext';
import { useExam } from '../contexts/ExamContext';
import { BottomNavigation } from '../components/BottomNavigation';
import { Target, ArrowRight, Play } from 'lucide-react';

// Static topics data to match the design (now with dynamic progress state)
const STATIC_TOPICS = [
    { title: 'Hemodinâmica', icon: 'favorite', count: 'Oficial' },
    { title: 'Ventilação mecânica', icon: 'air', count: 'Oficial' },
    { title: 'Monitorização multimodal', icon: 'monitoring', count: 'Oficial' },
    { title: 'Cardiologia', icon: 'ecg', count: 'Oficial' },
    { title: 'Nutrição', icon: 'restaurant', count: 'Oficial' },
    { title: 'Gastroenterologia', icon: 'medication', count: 'Oficial' },
    { title: 'Nefrologia', icon: 'water_drop', count: 'Oficial' },
    { title: 'Neurointensivismo', icon: 'psychology', count: 'Oficial' },
    { title: 'Endocrinologia', icon: 'health_and_safety', count: 'Oficial' },
    { title: 'Cirurgia e Trauma', icon: 'medical_services', count: 'Oficial' },
    { title: 'Sepse e infecções', icon: 'coronavirus', count: 'Oficial' },
    { title: 'Oncologia e hematologia', icon: 'biotech', count: 'Oficial' },
    { title: 'Obstetrícia', icon: 'child_care', count: 'Oficial' },
    { title: 'Gestão em UTI', icon: 'analytics', count: 'Oficial' },
    { title: 'Cuidados paliativos', icon: 'volunteer_activism', count: 'Oficial' },
    { title: 'MBE', icon: 'library_books', count: 'Oficial' },
    { title: 'Miscelânea', icon: 'category', count: 'Oficial' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { hasActiveSession } = useExam();
    const [searchTerm, setSearchTerm] = useState('');
    const [globalProgress, setGlobalProgress] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);


    useEffect(() => {
        async function loadDashboardData() {
            try {
                // Load global progress
                const global = await ProgressService.getAllStats();
                setGlobalProgress(global.percentage);

                // Load unread notifications count
                const unread = await NotificationService.getUnreadCount();
                setUnreadCount(unread);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
        loadDashboardData();
    }, []);

    const filteredTopics = STATIC_TOPICS.filter(topic =>
        topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

                {/* Progress Bar */}
                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Índice de Assertividade</span>
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tópicos de Estudo</h2>
                </div>

                {/* Active Session Resume Banner */}
                {hasActiveSession && (
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all"
                        onClick={() => navigate('/simulados')}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target className="w-20 h-20 -mt-6 -mr-6 text-primary" />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
                                <Play className="w-6 h-6 fill-current" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-900 dark:text-white">Continuar Simulado</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Você tem uma sessão em andamento. Não perca seu progresso!</p>
                                <div className="mt-3 inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                                    Retomar Agora
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Topics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {filteredTopics.length > 0 ? (
                        filteredTopics.map((topic) => (
                            <div
                                key={topic.title}
                                onClick={() => navigate(`/quiz/${encodeURIComponent(topic.title)}`)}
                                className="group bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3 text-primary">
                                    <span className="material-symbols-outlined">{topic.icon}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{topic.title}</h3>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-10 text-slate-400">
                            Nenhum tópico encontrado para "{searchTerm}"
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
}
