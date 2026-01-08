import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, CheckCircle2, XCircle, Clock, History as HistoryIcon } from 'lucide-react';
import { ProgressService } from '../services/progress';

interface HistoryItem {
    id: number;
    is_correct: boolean;
    created_at: string;
    topico: string;
    questao: {
        enunciado: string;
        resposta_correta: string;
    };
}

export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterResult, setFilterResult] = useState<'all' | 'correct' | 'incorrect'>('all');
    const [filterTopic, setFilterTopic] = useState<string>('all');

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        setLoading(true);
        // Fetch last 100 questions
        const data = await ProgressService.getHistory(100);

        // Map data safely to ensure questao is an object
        const mappedData = data.map((item: any) => ({
            ...item,
            questao: Array.isArray(item.questao) ? item.questao[0] : item.questao
        }));

        setHistory(mappedData);
        setLoading(false);
    }

    const filteredHistory = history.filter(item => {
        const matchesResult =
            filterResult === 'all' ||
            (filterResult === 'correct' && item.is_correct) ||
            (filterResult === 'incorrect' && !item.is_correct);

        const matchesTopic =
            filterTopic === 'all' ||
            item.topico === filterTopic;

        return matchesResult && matchesTopic;
    });

    const uniqueTopics = Array.from(new Set(history.map(h => h.topico)));

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-surface-light dark:bg-surface-dark shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-primary" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Histórico</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setFilterResult('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterResult === 'all'
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilterResult('correct')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${filterResult === 'correct'
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <CheckCircle2 className="w-4 h-4" /> Acertos
                        </button>
                        <button
                            onClick={() => setFilterResult('incorrect')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${filterResult === 'incorrect'
                                ? 'bg-red-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <XCircle className="w-4 h-4" /> Erros
                        </button>
                    </div>

                    {uniqueTopics.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Filter className="w-4 h-4" />
                            <select
                                value={filterTopic}
                                onChange={(e) => setFilterTopic(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                            >
                                <option value="all">Todos os tópicos</option>
                                {uniqueTopics.map(topic => (
                                    <option key={topic} value={topic}>{topic}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-6 py-6 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <HistoryIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>Nenhuma questão encontrada</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredHistory.map((item) => (
                            <div key={item.id} className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-lg">
                                        {item.topico}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-3 line-clamp-2">
                                    {item.questao?.enunciado || 'Enunciado não disponível'}
                                </p>
                                <div className={`flex items-center gap-2 text-sm font-medium ${item.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.is_correct ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span>Resposta Correta</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5" />
                                            <span>Resposta Incorreta</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
