import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useExam } from '../contexts/ExamContext';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Play, Clock, Target, AlertCircle, Minus, Plus, ChevronRight } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
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
                    .not('score', 'is', null)
                    .neq('total_questions', 0)
                    .order('created_at', { ascending: false })
                    .limit(5);

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
        <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col pb-24">
            {/* Header Title */}
            <div className="pt-8 pb-6 px-6">
                <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">
                    Simulados
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Treine como na prova real
                </p>
            </div>

            <main className="flex-1 w-full px-5 space-y-6 overflow-y-auto">

                {/* Active Session Warning */}
                {hasActiveSession && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <h3 className="font-bold text-amber-900">Em andamento</h3>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleResumeExam} disabled={isLoading} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors">
                                Continuar
                            </button>
                            <button onClick={discardSession} disabled={isLoading} className="px-4 py-2.5 bg-transparent border border-amber-500/30 text-amber-700 font-bold rounded-xl text-sm transition-colors">
                                Descartar
                            </button>
                        </div>
                    </div>
                )}

                {/* Official Exam Card */}
                <div onClick={handleStartExam} className="relative w-full bg-white rounded-[24px] p-5 shadow-sm cursor-pointer group active:scale-[0.98] transition-all overflow-hidden">
                    {/* Decorative Circle */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#E0F7FA]/60 rounded-bl-[80px]" />

                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-[#E0F7FA] text-[#1DB5B5] text-[11px] font-bold rounded-full mb-3">
                            Padrão TEMI
                        </span>

                        <h2 className="text-lg font-bold text-slate-900 mb-3">
                            Simulado Oficial
                        </h2>

                        <div className="flex gap-5 mb-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Target size={16} className="text-[#1DB5B5]" />
                                <span>90 questões</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Clock size={16} className="text-[#1DB5B5]" />
                                <span>4 horas</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[#1DB5B5] font-bold text-sm">
                            <Play size={14} fill="currentColor" />
                            <span>Iniciar Simulado</span>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-900">Histórico</h2>
                        {history.length > 0 && <span className="text-xs text-gray-400">{history.length} realizados</span>}
                    </div>

                    <div className="space-y-3">
                        {loadingHistory ? (
                            <HistorySkeleton />
                        ) : history.length > 0 ? (
                            history.map(session => (
                                <div key={session.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 ${(session.score / session.total_questions) >= 0.7
                                                ? 'border-[#1DB5B5] text-[#1DB5B5] bg-[#E0F7FA]/30'
                                                : 'border-red-400 text-red-500 bg-red-50'
                                            }`}>
                                            {session.score ? Math.round((session.score / session.total_questions) * 100) : 0}%
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-sm">Simulado Oficial</h4>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <span>📅</span>
                                                {new Date(session.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400">Nenhum simulado realizado</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Custom Exam Section */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-900">Simulado Personalizado</h2>
                        <span className="px-2 py-0.5 bg-[#E0F7FA] text-[#1DB5B5] text-[10px] font-bold uppercase rounded">Novo</span>
                    </div>

                    <div className="bg-white rounded-[24px] p-5 shadow-sm">
                        {/* Quantity Selector */}
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Target size={14} className="text-[#1DB5B5]" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quantidade</span>
                            </div>

                            <div className="flex items-center justify-between bg-[#F8F9FA] rounded-xl p-1.5">
                                <button
                                    onClick={() => setCustomConfig(prev => ({ ...prev, questions: Math.max(5, prev.questions - 5) }))}
                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="text-2xl font-bold text-slate-900">{customConfig.questions}</span>
                                <button
                                    onClick={() => setCustomConfig(prev => ({ ...prev, questions: prev.questions + 5 }))}
                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Time Selector */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={14} className="text-[#1DB5B5]" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tempo Limite</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[60, 120, 180, 240].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setCustomConfig(prev => ({ ...prev, minutes: m }))}
                                        className={`py-3 rounded-xl text-sm font-medium transition-all ${customConfig.minutes === m
                                                ? 'bg-[#1DB5B5] text-white font-bold'
                                                : 'bg-[#F8F9FA] text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {m >= 60 ? `${m / 60}h` : `${m}m`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Button - Black */}
                        <button
                            onClick={handleStartCustomExam}
                            disabled={isLoading}
                            className="w-full py-4 bg-[#1A1A2E] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#2D2D44] transition-colors active:scale-[0.99]"
                        >
                            <span>INICIAR SIMULADO</span>
                            <Play size={12} fill="currentColor" />
                        </button>
                    </div>
                </section>
            </main>

            <BottomNavigation />
        </div>
    );
}
