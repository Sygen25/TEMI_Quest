import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, User } from 'lucide-react';
import { BottomNavigation } from '../components/BottomNavigation';
import { RankingService } from '../services/ranking';
import type { RankingEntry } from '../services/ranking';
import { useUser } from '../contexts/UserContext';

export default function Ranking() {
    const navigate = useNavigate();
    const { user: currentUser } = useUser();
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchRanking();
    }, []);

    const getPositionStyle = (index: number) => {
        switch (index) {
            case 0: return 'bg-yellow-100/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'; // Gold
            case 1: return 'bg-slate-100/50 dark:bg-slate-700/20 border-slate-200 dark:border-slate-600';   // Silver
            case 2: return 'bg-orange-100/50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'; // Bronze
            default: return 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800';
        }
    };

    const getBadge = (index: number) => {
        switch (index) {
            case 0: return <Medal className="w-6 h-6 text-yellow-500" fill="currentColor" />;
            case 1: return <Medal className="w-6 h-6 text-slate-400" fill="currentColor" />;
            case 2: return <Medal className="w-6 h-6 text-orange-400" fill="currentColor" />;
            default: return <span className="font-bold text-slate-400 text-sm">#{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-6 bg-white dark:bg-surface-dark shadow-sm border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Ranking Global <Trophy className="w-5 h-5 text-yellow-500" />
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Pontos = 1ª tentativa correta
                        </p>
                    </div>
                </div>
            </div>

            <main className="p-4 space-y-3">
                {/* User Status Card */}
                {!loading && currentUser && (
                    <div className="mb-6 bg-temi/10 dark:bg-temi/20 border border-temi/20 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-temi text-white flex items-center justify-center font-bold shadow-md">
                                {currentUser.avatar_url ? (
                                    <img src={currentUser.avatar_url} alt="Me" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-temi uppercase">Sua Posição</p>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    {currentUser.ranking_visible
                                        ? (() => {
                                            const myRank = ranking.find(r => r.user_id === currentUser.user_id);
                                            return myRank?.position ? `#${myRank.position} (${myRank.score} pts)` : 'Sem pontos ainda';
                                        })()
                                        : 'Ranking Desativado'
                                    }
                                </p>
                            </div>
                        </div>
                        {!currentUser.ranking_visible && (
                            <Link to="/profile" className="text-xs font-bold bg-white dark:bg-slate-800 py-2 px-3 rounded-lg shadow-sm text-slate-500">
                                Ativar
                            </Link>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : ranking.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>Nenhum participante ainda.</p>
                        <p className="text-xs mt-1">Seja o primeiro a pontuar!</p>
                    </div>
                ) : (
                    ranking.map((user, index) => (
                        <div
                            key={user.user_id}
                            className={`flex items-center p-4 rounded-2xl border transition-all ${getPositionStyle(index)} ${currentUser?.user_id === user.user_id ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900' : ''
                                }`}
                        >
                            <div className="w-8 flex justify-center mr-4">
                                {getBadge(index)}
                            </div>

                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 mr-4 overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold truncate ${index < 3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {user.display_name}
                                    {currentUser?.user_id === user.user_id && <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Eu</span>}
                                </h3>
                                <p className="text-xs text-slate-400 truncate">Membro da comunidade</p>
                            </div>

                            <div className="text-right pl-2">
                                <span className="block font-black text-lg text-slate-900 dark:text-white leading-tight">
                                    {user.score}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Pts</span>
                            </div>
                        </div>
                    ))
                )}
            </main>

            <BottomNavigation />
        </div>
    );
}
