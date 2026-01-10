import { Activity, Database, Search } from 'lucide-react';

interface AIContextBannerProps {
    isAnalyzing: boolean;
    analyzedTopics: string[];
}

export function AIContextBanner({ isAnalyzing, analyzedTopics }: AIContextBannerProps) {
    if (!isAnalyzing && analyzedTopics.length === 0) return null;

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 py-2 px-4 flex items-center gap-3 overflow-hidden">
            <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>

            <div className="flex-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isAnalyzing ? (
                    <>
                        <Activity className="w-3 h-3 animate-spin" />
                        <span>Processando métricas...</span>
                    </>
                ) : (
                    <>
                        <Database className="w-3 h-3 text-primary" />
                        <span className="truncate">
                            Dados contextualizados: {analyzedTopics.length > 0 ? analyzedTopics.join(', ') : 'Desempenho Geral'}
                        </span>
                    </>
                )}
            </div>

            {isAnalyzing && (
                <div className="flex gap-1">
                    <div className="w-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
            )}
        </div>
    );
}
