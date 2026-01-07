import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, HeartPulse, Wind, Bug, Brain, MonitorPlay, Droplets, Scissors, Wifi, Baby, Library, HeartHandshake, Pill, Utensils, Droplet } from 'lucide-react';

// Mapping topic names to Icons (fallback to HeartPulse)
const TOPIC_ICONS: Record<string, any> = {
    'Hemodinâmica': HeartPulse,
    'Ventilação': Wind,
    'Infectologia': Bug,
    'Neuro': Brain,
    'Cardiologia': MonitorPlay,
    'Nefrologia': Droplets,
    'Cirurgia': Scissors,
    'POCUS': Wifi,
    'Obstetrícia': Baby,
    'MBE': Library,
    'Paliativos': HeartHandshake,
    'Endócrino': Pill,
    'Gastro': Utensils,
    'Hematologia': Droplet,
};

export default function Dashboard() {
    const [topics, setTopics] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTopics() {
            try {
                const { data, error } = await supabase
                    .from('Questoes')
                    .select('topico');

                if (error) throw error;

                // Extract unique topics
                const uniqueTopics = Array.from(new Set(data.map(item => item.topico))).filter(Boolean) as string[];
                setTopics(uniqueTopics);
            } catch (err) {
                console.error('Error fetching topics:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchTopics();
    }, []);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pt-12 pb-2 bg-surface-light dark:bg-surface-dark rounded-b-3xl shadow-sm z-10 sticky top-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-primary overflow-hidden">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL1O9wbtqdBrh5xAbgG-NoBUL-m5ewCL0_hOmAX4hUbSmx_uoRnfwgjJO8WfBcOzxb3vM33epDc1aJfgMMrzCOv2yYEcryOkye1Fa7ThGR-d4KZXoSDKCJpK_TyENI_eEMKsbMpXQAMyb1vfYDXQ_WGAmhgiS9RxYwJAYNWhq5KL7Au2Nz61qfhAPECL0S1tO0JkGDLLYi857vZ65T5Si4q_kDW0bXspwks0Qk3cMRIntjK3nage2sbJsW2WdOOUejDB7fhG00h1M" alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Olá, Doutor</h1>
                            <p className="text-xs text-slate-500">Bem-vindo ao TEMI Quest</p>
                        </div>
                    </div>
                    <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-surface-light dark:border-surface-dark"></span>
                    </button>
                </div>

                {/* Progress Bar - Restored from Original Design */}
                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Progresso Geral</span>
                        <span className="text-sm font-bold text-primary">35%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '35%' }}></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 pb-24 space-y-6">
                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-slate-400 group-focus-within:text-primary transition-colors h-5 w-5" />
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-3.5 border-none rounded-xl bg-white dark:bg-surface-dark text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 shadow-sm text-base transition-all"
                        placeholder="Buscar tópicos (ex: Sepse)"
                        type="text"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tópicos Disponíveis</h2>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {loading ? (
                        <p className="col-span-2 text-center text-slate-500 py-10">Carregando tópicos...</p>
                    ) : topics.length === 0 ? (
                        <p className="col-span-2 text-center text-slate-500 py-10">Nenhum tópico encontrado.</p>
                    ) : (
                        topics.map(topic => {
                            const Icon = TOPIC_ICONS[topic] || HeartPulse;
                            return (
                                <div
                                    key={topic}
                                    onClick={() => navigate(`/quiz/${encodeURIComponent(topic)}`)}
                                    className="group bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3 text-primary">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{topic}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Clique para praticar</p>

                                    <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
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
                    <button className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <span className="material-symbols-outlined text-[28px]">person</span>
                        <span className="text-[10px] font-medium">Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
