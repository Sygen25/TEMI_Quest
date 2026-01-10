import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Eye, EyeOff } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { RankingService } from '../services/ranking';
import type { RankingEntry } from '../services/ranking';
import { useUser } from '../contexts/UserContext';
import { ProfileService } from '../services/profile';

export default function Ranking() {
    const navigate = useNavigate();
    const { user: currentUser, refreshUser } = useUser();
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        fetchRanking();
    }, []);

    async function fetchRanking() {
        try {
            const data = await RankingService.getGlobalRanking();
            setRanking(data);
        } catch (error) {
            console.error('Failed to fetch ranking:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleToggleVisibility = async () => {
        if (toggling) return;
        setToggling(true);
        try {
            const newValue = !currentUser?.ranking_visible;
            await ProfileService.updateProfile({ ranking_visible: newValue });
            await refreshUser();
            await fetchRanking(); // Refresh list to remove/add user
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 font-display">
            {/* Header */}
            <div className="pt-6 pb-4 px-4 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Ranking Global <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Pontuação baseada na 1ª tentativa correta
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-4 pt-6 space-y-8">

                {/* Visibility Toggle Card */}
                {!loading && (
                    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentUser?.ranking_visible
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}>
                                {currentUser?.ranking_visible ? <Eye size={20} /> : <EyeOff size={20} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {currentUser?.ranking_visible ? 'Participando do Ranking' : 'Participação Oculta'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {currentUser?.ranking_visible
                                        ? 'Sua pontuação está visível.'
                                        : 'Ative para aparecer aqui.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleToggleVisibility}
                            disabled={toggling}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${currentUser?.ranking_visible ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentUser?.ranking_visible ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full opacity-50"></div>
                        <p className="text-sm text-slate-400 animate-pulse">Carregando...</p>
                    </div>
                ) : ranking.length === 0 ? (
                    <div className="text-center py-16">
                        <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Ranking vazio.</p>
                    </div>
                ) : (
                    <>
                        {/* PODIUM SECTION */}
                        <div className="flex justify-center items-end min-h-[260px] px-2 mb-6">
                            {/* 2nd Place */}
                            {ranking[1] && (
                                <div className="flex flex-col items-center w-1/3 z-10">
                                    <div className="relative mb-2">
                                        <div className="w-[70px] h-[70px] rounded-full border-[3px] border-slate-300 p-0.5 bg-white shadow-md">
                                            <img
                                                src={ranking[1]?.avatar_url || `https://ui-avatars.com/api/?name=${ranking[1]?.display_name || 'User'}&background=random`}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -right-1 bottom-1 w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 border-2 border-white shadow-sm">
                                            2
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[90px] text-center">{ranking[1]?.display_name}</p>
                                    <p className="text-xs font-bold text-teal-500 mb-2">{ranking[1]?.score} pts</p>
                                    <div className="w-20 h-12 bg-slate-100 dark:bg-slate-800 rounded-t-xl flex items-center justify-center">
                                        <span className="text-2xl font-black text-slate-200 dark:text-slate-700">II</span>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {ranking[0] && (
                                <div className="flex flex-col items-center w-1/3 z-20 -mx-2">
                                    <div className="relative mb-2">
                                        <div className="w-[120px] h-[120px] rounded-full border-4 border-yellow-400 p-1 bg-white shadow-xl">
                                            <img
                                                src={ranking[0]?.avatar_url || `https://ui-avatars.com/api/?name=${ranking[0]?.display_name || 'User'}&background=random`}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 inset-x-0 flex justify-center">
                                            <span className="bg-yellow-400 text-yellow-900 text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                1
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[120px] text-center leading-tight mb-1">{ranking[0]?.display_name}</p>
                                    <p className="text-sm font-bold text-teal-500 mb-2">{ranking[0]?.score} pts</p>
                                    <div className="w-28 h-20 bg-yellow-100/70 dark:bg-yellow-900/20 rounded-t-xl flex items-center justify-center border-t border-yellow-200/50">
                                        <span className="text-4xl font-black text-yellow-300/60 dark:text-yellow-600/30">I</span>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {ranking[2] && (
                                <div className="flex flex-col items-center w-1/3 z-10">
                                    <div className="relative mb-2">
                                        <div className="w-[70px] h-[70px] rounded-full border-[3px] border-orange-300 p-0.5 bg-white shadow-md">
                                            <img
                                                src={ranking[2]?.avatar_url || `https://ui-avatars.com/api/?name=${ranking[2]?.display_name || 'User'}&background=random`}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute -left-1 bottom-1 w-7 h-7 bg-orange-200 rounded-full flex items-center justify-center text-sm font-bold text-orange-700 border-2 border-white shadow-sm">
                                            3
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[90px] text-center">{ranking[2]?.display_name}</p>
                                    <p className="text-xs font-bold text-teal-500 mb-2">{ranking[2]?.score} pts</p>
                                    <div className="w-20 h-10 bg-orange-100/70 dark:bg-orange-900/20 rounded-t-xl flex items-center justify-center">
                                        <span className="text-xl font-black text-orange-200/80 dark:text-orange-700/30">III</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MY POSITION CARD */}
                        {currentUser?.ranking_visible && ranking.some(r => r.user_id === currentUser.user_id) && (() => {
                            const myRank = ranking.find(r => r.user_id === currentUser.user_id);
                            if (!myRank) return null;
                            return (
                                <div className="relative mt-8 mb-8">
                                    <div className="absolute -top-3 left-6 z-10">
                                        <span className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border-2 border-white dark:border-background-dark">
                                            Sua Posição
                                        </span>
                                    </div>
                                    <div className="bg-orange-50/50 dark:bg-slate-800 border-2 border-teal-500 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
                                        <div className="flex items-center gap-4 z-10">
                                            <span className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                                #{myRank.position}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full border-2 border-teal-500 p-0.5 bg-white shadow-sm overflow-hidden">
                                                    <img src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.display_name}`} className="w-full h-full object-cover rounded-full" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-base">
                                                        {currentUser.display_name} <span className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0.5 rounded ml-1">Eu</span>
                                                    </p>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right z-10">
                                            <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                                                {myRank.score}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">PTS</span>
                                        </div>
                                        {/* Background decoration */}
                                        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-teal-500/5 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* DIVIDER */}
                        <div className="flex items-center gap-4 py-4">
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outros participantes</span>
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                        </div>

                        {/* LIST (4th onwards) */}
                        <div className="space-y-3 pb-safe">
                            {ranking.slice(3).map((entry) => (
                                <div key={entry.user_id} className="flex items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <span className="w-8 text-center font-bold text-slate-400 text-lg">
                                        {entry.position}
                                    </span>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden mx-3">
                                        <img
                                            src={entry.avatar_url || `https://ui-avatars.com/api/?name=${entry.display_name}&background=random`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{entry.display_name}</p>

                                    </div>
                                    <div className="text-teal-500 font-bold text-sm">
                                        {entry.score} <span className="text-xs text-slate-400 font-normal">pts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <BottomNavigation />
        </div>
    );
}
