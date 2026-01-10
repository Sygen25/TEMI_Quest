import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, User, FileText, Trophy, Sparkles } from 'lucide-react';

export function BottomNavigation() {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to determine active state
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 pb-safe z-50 transition-colors duration-300">
            <div className="flex justify-around items-center h-16 px-2">
                <button
                    onClick={() => navigate('/')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive('/')
                        ? 'text-primary'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <Home className="w-6 h-6" />
                    <span className={`text-[10px] ${isActive('/') ? 'font-bold' : 'font-medium'}`}>Início</span>
                </button>

                <button
                    onClick={() => navigate('/simulados')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive('/simulados')
                        ? 'text-primary'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <FileText className="w-6 h-6" />
                    <span className={`text-[10px] ${isActive('/simulados') ? 'font-bold' : 'font-medium'}`}>Simulados</span>
                </button>

                <button
                    onClick={() => navigate('/analytics')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive('/analytics')
                        ? 'text-primary'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <BarChart2 className="w-6 h-6" />
                    <span className={`text-[10px] ${isActive('/analytics') ? 'font-bold' : 'font-medium'}`}>Análise</span>
                </button>

                <button
                    onClick={() => navigate('/ranking')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive('/ranking')
                        ? 'text-primary'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <Trophy className="w-6 h-6" />
                    <span className={`text-[10px] ${isActive('/ranking') ? 'font-bold' : 'font-medium'}`}>Ranking</span>
                </button>

                <button
                    onClick={() => navigate('/performance')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive('/performance')
                        ? 'text-amber-500'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <Sparkles className="w-6 h-6" />
                    <span className={`text-[10px] ${isActive('/performance') ? 'font-bold' : 'font-medium'}`}>Mentor</span>
                </button>

                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${isActive('/profile')
                        ? 'text-primary'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                >
                    <User className="w-6 h-6" />
                    <span className={`text-[10px] ${isActive('/profile') ? 'font-bold' : 'font-medium'}`}>Perfil</span>
                </button>
            </div>
        </nav>
    );
}
