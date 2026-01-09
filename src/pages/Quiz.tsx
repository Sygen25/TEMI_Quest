import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { ProgressService } from '../services/progress';
import QuestionDisplay from '../components/QuestionDisplay';

interface Question {
    id: number;
    enunciado: string;
    imagem_url: string | null;

    // Alternatives
    alt_a: string;
    explicacao_a?: string;
    alt_b: string;
    explicacao_b?: string;
    alt_c: string;
    explicacao_c?: string;
    alt_d: string;
    explicacao_d?: string;

    resposta_correta: string; // 'A', 'B', 'C', 'D'
    expansao_conhecimento?: string;
    topico: string;
}

export default function Quiz() {
    const { topic } = useParams<{ topic: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const [isReviewMode, setIsReviewMode] = useState(false);

    async function fetchRandomQuestion() {
        if (!topic) {
            console.error('[Quiz] No topic in URL params');
            setLoading(false);
            return;
        }

        setIsAnswered(false);
        setSelectedOption(null);
        setQuestion(null);
        setLoading(true);
        setIsReviewMode(false);

        try {
            console.log('[Quiz] Fetching questions for topic:', topic);

            const { data, error } = await supabase
                .from('Questoes')
                .select('*')
                .eq('topico', topic);

            if (error) throw error;

            if (data && data.length > 0) {
                // Pick random
                const randomQ = data[Math.floor(Math.random() * data.length)];
                setQuestion(randomQ);
                setQuestionStartTime(Date.now());
            } else {
                console.warn('[Quiz] No questions found for topic:', topic);
                setQuestion(null);
            }

        } catch (err: any) {
            console.error('[Quiz] Error fetching question:', err);
            setQuestion(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const stateQuestion = location.state?.question as Question | undefined;
        const stateSelectedOption = location.state?.selectedOption as string | undefined;

        if (stateQuestion) {
            console.log('[Quiz] Review mode active for question:', stateQuestion.id);
            setQuestion(stateQuestion);
            setLoading(false);
            setIsAnswered(true);
            setIsReviewMode(true);

            if (stateSelectedOption) {
                setSelectedOption(stateSelectedOption);
            }
        } else if (topic) {
            fetchRandomQuestion();
        }
    }, [topic, location.state]);

    const handleOptionClick = (option: string) => {
        if (isAnswered || !question) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const isCorrect = question.resposta_correta === option;
        const timeSpentSeconds = Math.round((Date.now() - questionStartTime) / 1000);

        ProgressService.saveAnswer(question.id, question.topico, isCorrect, timeSpentSeconds, option);
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

            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-primary rounded-r-full" style={{ width: '30%' }}></div>
            </div>

            <main className="flex-1 px-5 py-6 w-full max-w-lg mx-auto">
                <QuestionDisplay
                    question={question}
                    selectedOption={selectedOption}
                    onOptionSelect={handleOptionClick}
                    showFeedback={true}
                    isAnswered={isAnswered}
                />
            </main>

            {/* Floating Bottom Bar */}
            {isAnswered && (
                <div className="fixed bottom-0 left-0 right-0 z-40 p-5 bg-white/90 dark:bg-background-dark/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full mt-safe">
                    <div className="w-full max-w-lg mx-auto flex gap-4">
                        {isReviewMode ? (
                            <button onClick={() => navigate(-1)} className="flex-1 h-[52px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-[16px] font-bold rounded-2xl shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                                <ArrowLeft size={20} />
                                <span>Voltar ao Histórico</span>
                            </button>
                        ) : (
                            <button onClick={() => fetchRandomQuestion()} className="flex-1 h-[52px] bg-primary hover:bg-primary-dark text-white text-[16px] font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                                <span>Próxima Questão</span>
                                <ArrowRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
