import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProgressService } from '../services/progress';

export interface Question {
    id: number;
    enunciado: string;
    imagem_url: string | null;
    alt_a: string;
    explicacao_a?: string;
    alt_b: string;
    explicacao_b?: string;
    alt_c: string;
    explicacao_c?: string;
    alt_d: string;
    explicacao_d?: string;
    resposta_correta: string;
    expansao_conhecimento?: string;
    topico: string;
}

interface UseQuizProps {
    topic?: string;
    initialQuestion?: Question;
    initialSelectedOption?: string;
}

export interface QuizState {
    question: Question;
    selectedOption: string | null;
    isAnswered: boolean;
}

export function useQuiz({ topic, initialQuestion, initialSelectedOption }: UseQuizProps) {
    const [history, setHistory] = useState<QuizState[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Derived state from current history index
    const currentItem = currentIndex >= 0 ? history[currentIndex] : null;
    const question = currentItem?.question || null;
    const selectedOption = currentItem?.selectedOption || null;
    const isAnswered = currentItem?.isAnswered || false;

    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

    // Initialize history with initial question if provided
    useEffect(() => {
        if (initialQuestion && history.length === 0) {
            setHistory([{
                question: initialQuestion,
                selectedOption: initialSelectedOption || null,
                isAnswered: !!initialSelectedOption
            }]);
            setCurrentIndex(0);
            setLoading(false);
        }
    }, [initialQuestion, initialSelectedOption, history.length]);

    const fetchNextQuestion = useCallback(async () => {
        if (!topic) return;

        // If we are not at the end of history, just move forward
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('Questoes')
                .select('*')
                .eq('topico', topic);

            if (error) throw error;

            if (data && data.length > 0) {
                const randomQ = data[Math.floor(Math.random() * data.length)];

                setHistory(prev => [...prev, {
                    question: randomQ,
                    selectedOption: null,
                    isAnswered: false
                }]);
                setCurrentIndex(prev => prev + 1);
                setQuestionStartTime(Date.now());
            } else {
                setError('Nenhuma questão encontrada para este tópico.');
            }
        } catch (err: any) {
            console.error('[useQuiz] Error fetching question:', err);
            setError('Erro ao carregar questão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [topic, currentIndex, history.length]);

    const navigatePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);

    const submitAnswer = useCallback(async (option: string) => {
        if (isAnswered || !question) return;

        // Update history item at current index
        setHistory(prev => {
            const newHistory = [...prev];
            newHistory[currentIndex] = {
                ...newHistory[currentIndex],
                selectedOption: option,
                isAnswered: true
            };
            return newHistory;
        });

        const isCorrect = question.resposta_correta === option;
        const timeSpentSeconds = Math.round((Date.now() - questionStartTime) / 1000);

        await ProgressService.saveAnswer(question.id, isCorrect, timeSpentSeconds, option);
    }, [isAnswered, question, currentIndex, questionStartTime]);

    // Initial fetch
    useEffect(() => {
        if (!initialQuestion && history.length === 0 && topic) {
            fetchNextQuestion();
        }
    }, [initialQuestion, history.length, topic, fetchNextQuestion]);

    return {
        question,
        loading,
        error,
        selectedOption,
        isAnswered,
        handleNext: fetchNextQuestion,
        handlePrevious: navigatePrevious,
        submitAnswer,
        currentSessionIndex: currentIndex,
        hasPrevious: currentIndex > 0
    };
}
