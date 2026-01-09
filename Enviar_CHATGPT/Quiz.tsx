import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ArrowRight, Home, HelpCircle, Check, X, Info } from 'lucide-react';
import { ProgressService } from '../services/progress';

interface Question {
    id: number;
    enunciado: string;
    imagem_url: string | null;
    alt_a: string;
    alt_b: string;
    alt_c: string;
    alt_d: string;
    resposta_correta: string; // 'A', 'B', 'C', 'D'
    gabarito_comentado: string;
    topico: string;
}

export default function Quiz() {
    const { topic } = useParams<{ topic: string }>();
    const navigate = useNavigate();

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

    async function fetchRandomQuestion() {
        setIsAnswered(false);
        setSelectedOption(null);
        setQuestion(null);
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Raw Fetch Bypass for Questions
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://orpdpcvwwftnncsyzbwq.supabase.co';
            const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_kISpxfZJHmxn4uzC1NeELg_thEVRNWA';

            console.log('[Quiz] Fetching questions (RAW) for topic:', topic);

            // Encode topic to handle spaces and special chars safely
            const encodedTopic = encodeURIComponent(topic || '');

            // 5 Second Timeout for Network Hangs
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/Questoes?topico=eq.${encodedTopic}&select=*`, {
                    method: 'GET',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Fetch failed: ${response.status} ${errText}`);
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    // Pick random
                    const randomQ = data[Math.floor(Math.random() * data.length)];
                    setQuestion(randomQ);
                    setQuestionStartTime(Date.now()); // Reset timer when new question loads
                } else {
                    console.warn('[Quiz] No questions found for topic:', topic);
                }
            } catch (fetchErr: any) {
                if (fetchErr.name === 'AbortError') {
                    console.error('[Quiz] Request timed out explicitly via AbortController');
                    throw new Error('Tempo limite excedido ao buscar questões.');
                }
                throw fetchErr;
            }

        } catch (err) {
            console.error('Error fetching question:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (topic) {
            fetchRandomQuestion();
        }
    }, [topic]);

    const handleOptionClick = (option: string) => {
        if (isAnswered || !question) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const isCorrect = question.resposta_correta === option;
        const timeSpentSeconds = Math.round((Date.now() - questionStartTime) / 1000);

        // Save using the service with time tracking
        ProgressService.saveAnswer(question.id, question.topico, isCorrect, timeSpentSeconds);
    };

    const getOptionStyle = (option: string) => {
        const baseStyle = "group relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300";

        if (!isAnswered) {
            return `${baseStyle} bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5`;
        }

        const isSelected = selectedOption === option;
        const isCorrect = question?.resposta_correta === option;

        if (isCorrect) {
            return `${baseStyle} border-green-500 bg-green-50 dark:bg-green-900/20 shadow-glow ring-1 ring-green-500`;
        }

        if (isSelected && !isCorrect) {
            return `${baseStyle} border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500`;
        }

        return `${baseStyle} bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60`;
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Carregando questão...</div>;
    }

    if (!question) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <p className="mb-4 text-lg">Não encontramos questões para este tópico.</p>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary text-white rounded-xl">Voltar ao Início</button>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-[#f8f9fc] pb-32">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 dark:bg-background-dark/90 backdrop-blur-md px-5 py-4 border-b border-slate-100 dark:border-slate-800/60 transition-colors shadow-sm">
                <button onClick={() => navigate('/')} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">{topic}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Questão</span>
                        <span className="text-lg font-bold">#</span>
                    </div>
                </div>
                <button className="flex items-center justify-center w-10 h-10 -mr-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-primary transition-all">
                    <Home size={24} onClick={() => navigate('/')} />
                </button>
            </header>

            {/* Progress Bar (Static for now) */}
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-primary rounded-r-full" style={{ width: '30%' }}></div>
            </div>

            <main className="flex-1 px-5 py-6 w-full max-w-lg mx-auto">
                {/* Enunciado */}
                <div className="mb-6 bg-white dark:bg-slate-800/40 rounded-2xl p-5 shadow-soft border border-slate-100 dark:border-slate-700/50">
                    <h1 className="text-[18px] leading-[1.6] font-medium text-slate-700 dark:text-slate-200 text-justify whitespace-pre-line">
                        {question.enunciado}
                    </h1>
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <p className="text-[17px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <HelpCircle className="text-primary w-6 h-6" />
                            Qual a alternativa correta?
                        </p>
                    </div>
                </div>

                {question.imagem_url && question.imagem_url.trim().length > 10 && (
                    <div className="mb-8 group relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                        <img src={question.imagem_url} alt="Questão" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Options */}
                <div className="flex flex-col gap-3.5">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                        // Dynamic property access: question.alt_a, question.alt_b etc.
                        const text = (question as any)[`alt_${opt.toLowerCase()}`];
                        if (!text) return null;

                        return (
                            <label key={opt} className={getOptionStyle(opt)} onClick={() => handleOptionClick(opt)}>
                                <div className={`relative flex shrink-0 items-center justify-center w-10 h-10 rounded-xl font-bold text-base transition-all duration-300 
                    ${isAnswered && question.resposta_correta === opt ? 'bg-green-500 text-white' :
                                        isAnswered && selectedOption === opt && selectedOption !== question.resposta_correta ? 'bg-red-500 text-white' :
                                            'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100'
                                    }`}>
                                    {opt}
                                </div>
                                <div className="flex-1 py-1">
                                    <p className="text-[16px] font-medium text-slate-600 dark:text-slate-300">
                                        {text}
                                    </p>
                                </div>
                                {isAnswered && question.resposta_correta === opt && (
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}
                                {isAnswered && selectedOption === opt && question.resposta_correta !== opt && (
                                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
                                        <X size={16} strokeWidth={3} />
                                    </div>
                                )}
                            </label>
                        );
                    })}
                </div>

                {/* Feedback / Gabarito */}
                {isAnswered && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300 font-bold uppercase text-sm tracking-wider">
                                <Info size={18} />
                                Comentário do Professor
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px]">
                                {question.gabarito_comentado}
                            </p>
                        </div>
                    </div>
                )}

            </main>

            {/* Floating Bottom Bar */}
            {isAnswered && (
                <div className="fixed bottom-0 left-0 right-0 z-40 p-5 bg-white/90 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full">
                    <div className="w-full max-w-lg mx-auto flex gap-4">
                        <button onClick={() => fetchRandomQuestion()} className="flex-1 h-[52px] bg-primary hover:bg-primary-dark text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                            <span>Próxima Questão</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
