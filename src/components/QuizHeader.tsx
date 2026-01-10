import { ArrowLeft, Filter, CheckCircle2, XCircle, HelpCircle, Circle, PlayCircle, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { FontSizeControls } from './FontSizeControls';
import type { QuizFilter } from '../hooks/useQuiz';

interface QuizHeaderProps {
    topic: string | undefined;
    currentIndex: number;
    totalQuestions?: number;
    onBack: () => void;
    filter: QuizFilter[];
    setFilter: (f: QuizFilter[]) => void;
    hasNote?: boolean;
    onOpenNotes?: () => void;
}

export function QuizHeader({
    topic,
    currentIndex,
    totalQuestions,
    onBack,
    filter,
    setFilter,
    hasNote = false,
    onOpenNotes
}: QuizHeaderProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<QuizFilter[]>(filter);

    // Sync local filters when opening
    const handleOpenFilters = () => {
        setLocalFilters(filter);
        setIsFilterOpen(!isFilterOpen);
    };

    const filters: { id: QuizFilter; label: string; icon: any; color: string }[] = [
        { id: 'not_answered', label: 'Não Realizadas', icon: Circle, color: 'text-slate-400' },
        { id: 'answered', label: 'Já Respondidas', icon: PlayCircle, color: 'text-blue-500' },
        { id: 'correct', label: 'Acertou', icon: CheckCircle2, color: 'text-green-500' },
        { id: 'incorrect', label: 'Errou', icon: XCircle, color: 'text-red-500' },
        { id: 'doubt', label: 'Dúvidas', icon: HelpCircle, color: 'text-amber-500' },
        { id: 'has_notes', label: 'Com Anotações', icon: StickyNote, color: 'text-purple-500' }
    ];

    const toggleLocalFilter = (id: QuizFilter) => {
        let newFilters: QuizFilter[];

        // Logic: Allow multi-select. 
        if (localFilters.includes(id)) {
            newFilters = localFilters.filter(f => f !== id);
        } else {
            newFilters = [...localFilters, id];
            // Heuristic: If 'not_answered' is the ONLY selected one, and user selects something else, replace it.
            if (localFilters.length === 1 && localFilters[0] === 'not_answered' && id !== 'not_answered') {
                newFilters = [id];
            }
        }
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        const finalFilters = localFilters.length === 0 ? ['not_answered'] as QuizFilter[] : localFilters;
        setFilter(finalFilters);
        setIsFilterOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate uppercase tracking-widest">
                            {topic || 'Quiz'}
                        </h1>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                            Questão {currentIndex + 1}{totalQuestions ? ` de ${totalQuestions}` : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            onClick={handleOpenFilters}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-2
                                ${isFilterOpen ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}
                            `}
                        >
                            <Filter size={20} />
                            {/* Mobile: Hide label, Desktop: Show Count or Label */}
                            <span className="hidden md:block text-xs font-bold uppercase tracking-wider">
                                {filter.length === 0
                                    ? 'Todos'
                                    : filter.length === 1
                                        ? filters.find(f => f.id === filter[0])?.label
                                        : `${filter.length} Filtros`}
                            </span>
                        </button>

                        {isFilterOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsFilterOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-20 space-y-1">
                                    <div className="px-3 py-2 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrar Questões</span>
                                        <button
                                            onClick={() => setLocalFilters(['not_answered'])}
                                            className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors"
                                        >
                                            Resetar
                                        </button>
                                    </div>

                                    <div className="space-y-1 max-h-60 overflow-y-auto">
                                        {filters.map(item => {
                                            const isActive = localFilters.includes(item.id);
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => toggleLocalFilter(item.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                                        ${isActive
                                                            ? 'bg-primary/5 text-slate-900 dark:text-white'
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                                                        }
                                                    `}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all
                                                        ${isActive
                                                            ? 'bg-primary border-primary'
                                                            : 'bg-transparent border-slate-300 dark:border-slate-600'
                                                        }
                                                    `}>
                                                        {isActive && <CheckCircle2 size={12} className="text-white" />}
                                                    </div>

                                                    <item.icon size={16} className={item.color} />
                                                    <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={applyFilters}
                                            className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-colors shadow-sm active:scale-95"
                                        >
                                            Aplicar Filtros
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notes Button */}
                    {onOpenNotes && (
                        <button
                            onClick={onOpenNotes}
                            className={`p-2 rounded-lg transition-colors ${hasNote
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                                }`}
                            title="Anotações"
                        >
                            <StickyNote size={20} />
                        </button>
                    )}

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    <FontSizeControls />
                </div>
            </div>
        </header>
    );
}
