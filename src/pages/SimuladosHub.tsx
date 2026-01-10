import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useExam } from '../contexts/ExamContext';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Play, Clock, Target, AlertCircle, FileText, Minus, Plus } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { ExamHistoryItem } from '../components/ExamHistoryItem';
import { HistorySkeleton } from '../components/HistorySkeleton';

export default function SimuladosHub() {
    const navigate = useNavigate();
    const { user, userId } = useUser();
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const { startExam, hasActiveSession, isLoading, discardSession } = useExam();
    const [customConfig, setCustomConfig] = useState({ questions: 30, minutes: 120 });

    useEffect(() => {
        async function fetchHistory() {
            // Use user_id which is the UUID from Supabase Auth
            if (!userId) {
                setLoadingHistory(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('exam_sessions')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('status', 'completed')
                    .not('score', 'is', null) // Only show sessions with valid scores
                    .neq('total_questions', 0) // Basic sanity check
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setHistory(data || []);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoadingHistory(false);
            }
        }

        fetchHistory();
    }, [user, userId]);

    const handleStartExam = async () => {
        await startExam({ questionCount: 90, durationMinutes: 240 });
        navigate('/exam');
    };

    const handleResumeExam = async () => {
        await startExam();
        navigate('/exam');
    };

    const handleStartCustomExam = async () => {
        await startExam({
            questionCount: customConfig.questions,
            durationMinutes: customConfig.minutes
        });
        navigate('/exam');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800/50">
                <div className="max-w-2xl mx-auto px-6 py-6">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Simulados</h1>
                    <p className="text-sm text-slate-500 mt-1">Treine como na prova real</p>
                </div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 pb-28 space-y-8">
                {/* Active Session Warning */}
                {hasActiveSession && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-900 dark:text-amber-300">Simulado em andamento</h3>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Você tem um simulado pausado. Deseja continuar?</p>
                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={handleResumeExam}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <Play className="w-5 h-5" />
                                        Continuar
                                    </button>
                                    <button
                                        onClick={discardSession}
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-transparent border-2 border-amber-600/20 hover:bg-amber-600/10 text-amber-700 dark:text-amber-500 font-bold rounded-xl transition-colors"
                                    >
                                        Descartar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hero Card - Start New Exam */}
                {!hasActiveSession && (
                    <div
                        onClick={handleStartExam}
                        className="relative w-full bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-soft border-2 border-primary/20 cursor-pointer overflow-hidden group hover:border-primary/40 hover:shadow-lg transition-all"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-500/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10 flex flex-col items-start gap-3">
                            <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary border border-primary/20">
                                Padrão TEMI
                            </div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Simulado Oficial</h2>
                            <div className="flex gap-4 text-slate-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-primary" />
                                    <span>90 questões</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>4 horas</span>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-primary font-bold">
                                <Play className="w-5 h-5" />
                                Iniciar Simulado
                            </div>
                        </div>
                    </div>
                )}

                {/* History Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Histórico</h2>
                        {history.length > 0 && (
                            <span className="text-xs font-medium text-slate-500">{history.length} realizados</span>
                        )}
                    </div>

                    {loadingHistory ? (
                        <HistorySkeleton />
                    ) : history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((session) => (
                                <ExamHistoryItem key={session.id} session={session} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 shadow-soft border border-slate-100 dark:border-slate-800 text-center">
                            <FileText className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Você ainda não realizou nenhum simulado.</p>
                        </div>
                    )}
                </section>

                {/* Custom Config Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Simulado Personalizado</h2>
                        <div className="px-2 py-0.5 bg-primary/10 rounded text-[10px] font-black text-primary uppercase tracking-wider">Novo</div>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5 text-primary" />
                                    Quantidade
                                </label>
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => setCustomConfig(prev => ({ ...prev, questions: Math.max(5, prev.questions - 5) }))}
                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all active:scale-95"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={customConfig.questions}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setCustomConfig(prev => ({ ...prev, questions: isNaN(val) ? 0 : val }));
                                            }}
                                            className="w-full text-center bg-transparent font-bold text-lg text-slate-900 dark:text-white border-none focus:ring-0 p-0 tracking-tight"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setCustomConfig(prev => ({ ...prev, questions: prev.questions + 5 }))}
                                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-all active:scale-95"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                    Tempo Limite
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[60, 120, 180, 240].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setCustomConfig(prev => ({ ...prev, minutes: m }))}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all border
                                                ${customConfig.minutes === m
                                                    ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20 scale-[1.02]'
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {m >= 60 ? `${m / 60}h` : `${m}m`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartCustomExam}
                            disabled={isLoading}
                            className="w-full mt-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-lg shadow-slate-900/10 dark:shadow-none text-xs uppercase tracking-wider"
                        >
                            <span>Iniciar Simulado</span>
                            <Play size={14} className="fill-current group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>
            </main>

            <BottomNavigation />
        </div>
    );
}
