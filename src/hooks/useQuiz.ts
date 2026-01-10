import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ProgressService } from '../services/progress';
import type { Question } from '../types/question';
export type { Question };

interface UseQuizProps {
    topic?: string;
    initialQuestion?: Question;
    initialSelectedOption?: string;
}

export interface QuizState {
    question: Question;
    selectedOption: string | null;
    isAnswered: boolean;
    isFlagged: boolean;
    note: string;
}

export type QuizFilter = 'all' | 'not_answered' | 'answered' | 'correct' | 'incorrect' | 'doubt';

export function useQuiz({ topic, initialQuestion, initialSelectedOption }: UseQuizProps) {
    const [history, setHistory] = useState<QuizState[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<QuizFilter[]>([]);
    const [totalQuestions, setTotalQuestions] = useState(0);

    // Derived state from current history index
    const currentItem = currentIndex >= 0 ? history[currentIndex] : null;
    const question = currentItem?.question || null;
    const selectedOption = currentItem?.selectedOption || null;
    const isAnswered = currentItem?.isAnswered || false;
    const isFlagged = currentItem?.isFlagged || false;
    const note = currentItem?.note || '';

    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

    // Ref to track if initial fetch has happened (either from initialQuestion or first fetchNextQuestion)
    const hasInitialized = useRef(false);

    // Initialize history with initial question if provided
    useEffect(() => {
        if (initialQuestion && history.length === 0) {
            setHistory([{
                question: initialQuestion,
                selectedOption: initialSelectedOption || null,
                isAnswered: !!initialSelectedOption,
                isFlagged: false,
                note: ''
            }]);
            setCurrentIndex(0);
            setLoading(false);
            hasInitialized.current = true;
        }
    }, [initialQuestion, initialSelectedOption, history.length]);

    const fetchNextQuestion = useCallback(async (reset: boolean = false) => {
        if (!topic) return;

        // If not resetting and we have history ahead, just move forward
        if (!reset && currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // 2. Fetch all questions for topic
            const { data: questions, error: qError } = await supabase
                .from('Questoes')
                .select('*')
                .eq('topico', topic);

            if (qError) throw qError;
            if (!questions || questions.length === 0) {
                setError('Nenhuma questão encontrada para este tópico.');
                setLoading(false);
                return;
            }

            // 3. Fetch user answers for these questions (including is_flagged)
            const questionIds = questions.map(q => q.id);

            // Re-fetching answers with a join to filter correctly across ALL sessions
            const { data: allUserAnswers } = await supabase
                .from('exam_answers')
                .select(`
                    question_id, 
                    is_correct,
                    is_flagged,
                    notes,
                    exam_sessions!inner(user_id)
                `)
                .in('question_id', questionIds)
                .eq('exam_sessions.user_id', user.id)
                .order('answered_at', { ascending: true });

            const answeredMap = new Map<number, boolean>(); // id -> is_correct
            const flaggedMap = new Map<number, boolean>(); // id -> is_flagged
            const notesMap = new Map<number, string>(); // id -> note

            allUserAnswers?.forEach((a: any) => {
                // Determine "Answered" status (latest or any)
                answeredMap.set(a.question_id, a.is_correct);

                // Determine "Flagged" status (if ANY session has it flagged, or latest?)
                // Assuming if it's flagged in ANY session, it's flagged? 
                // Or usually the latest state. 
                // Let's assume if it is true in the answer record, it counts.
                if (a.is_flagged) {
                    flaggedMap.set(a.question_id, true);
                }
                if (a.notes) {
                    notesMap.set(a.question_id, a.notes);
                }
            });

            // 4. Filter Candidate Questions
            // Logic: candidates must match AT LEAST ONE of the active filters.
            // If filter list is empty, maybe default to 'all'? Or 'not_answered'?
            // Let's assume empty = 'all'.

            const activeFilters = filter.length > 0 ? filter : ['all'];

            let candidates = questions.filter(q => {
                const isAnswered = answeredMap.has(q.id);
                const isCorrect = answeredMap.get(q.id);
                const isFlagged = flaggedMap.get(q.id);

                return activeFilters.some(f => {
                    switch (f) {
                        case 'not_answered':
                            return !isAnswered;
                        case 'answered':
                            return isAnswered;
                        case 'correct':
                            return isAnswered && isCorrect === true;
                        case 'incorrect':
                            return isAnswered && isCorrect === false;
                        case 'doubt':
                            return isFlagged === true;
                        case 'all':
                            return true;
                        default:
                            return false;
                    }
                });
            });

            setTotalQuestions(candidates.length);

            if (candidates.length === 0) {
                if (activeFilters.includes('not_answered') && activeFilters.length === 1 && questions.length > 0) {
                    setError('Você já respondeu todas as questões deste tópico!');
                } else {
                    setError('Nenhuma questão encontrada com estes filtros.');
                }
                setLoading(false);
                return;
            }

            // 5. Pick Random
            const randomQ = candidates[Math.floor(Math.random() * candidates.length)];
            const randomQFlagged = flaggedMap.get(randomQ.id) || false;

            const newItem: QuizState = {
                question: randomQ,
                selectedOption: null,
                isAnswered: false,
                isFlagged: randomQFlagged,
                note: notesMap.get(randomQ.id) || ''
            };

            if (reset) {
                console.log('[useQuiz] Resetting history');
                setHistory([newItem]);
                setCurrentIndex(0);
            } else {
                console.log('[useQuiz] Appending to history');
                setHistory(prev => [...prev, newItem]);
                setCurrentIndex(prev => {
                    console.log('[useQuiz] Incrementing index from', prev);
                    return prev + 1;
                });
            }
            setQuestionStartTime(Date.now());
            hasInitialized.current = true;

        } catch (err: any) {
            console.error('[useQuiz] Error fetching question:', err);
            setError('Erro ao carregar questão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [topic, currentIndex, history.length, filter]);

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

    const toggleFlag = useCallback(async () => {
        if (!question) return;

        const newFlagStatus = !isFlagged;

        // Update local state
        setHistory(prev => {
            const newHistory = [...prev];
            newHistory[currentIndex] = {
                ...newHistory[currentIndex],
                isFlagged: newFlagStatus
            };
            return newHistory;
        });

        // Update DB
        // Use ProgressService to update flag
        await ProgressService.toggleFlag(question.id, newFlagStatus);

    }, [question, isFlagged, currentIndex]);

    // Initial fetch (only if no history and no initial question)
    useEffect(() => {
        if (!initialQuestion && history.length === 0 && topic && !hasInitialized.current) {
            fetchNextQuestion(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialQuestion, topic]); // Removed fetchNextQuestion and history.length to prevent loop

    // Refetch when filter changes - use ref to track actual filter changes
    const prevFilterRef = useRef<QuizFilter[]>(filter);
    useEffect(() => {
        const filterChanged = JSON.stringify(prevFilterRef.current) !== JSON.stringify(filter);
        if (filterChanged && hasInitialized.current && topic) {
            console.log('[useQuiz] Filter changed, resetting');
            prevFilterRef.current = filter;
            fetchNextQuestion(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, topic]); // Removed fetchNextQuestion to prevent loop

    // Let's expose a reset function or just let the effect handle "next" calls.
    // But if we are at the "End" (no next question pre-loaded), it works.

    // We should probably allow the user to "Skip" to next valid question if explicit filter change?
    // For MVP, we presume the user changes filter and then clicks "Next" or we auto-fetch if we are in a "Loading" state.
    // But keeping it simple: filter only affects *future* fetches. 

    const saveNote = useCallback(async (newNote: string) => {
        if (!question) return;

        // Update local state
        setHistory(prev => {
            const newHistory = [...prev];
            newHistory[currentIndex] = {
                ...newHistory[currentIndex],
                note: newNote
            };
            return newHistory;
        });

        // Update DB
        await ProgressService.saveNote(question.id, newNote);
    }, [question, currentIndex]);

    return {
        question,
        loading,
        error,
        selectedOption,
        isAnswered,
        handleNext: () => fetchNextQuestion(false),
        handlePrevious: navigatePrevious,
        submitAnswer,
        toggleFlag,
        isFlagged,
        note,
        saveNote,
        currentSessionIndex: currentIndex,
        hasPrevious: currentIndex > 0,
        filter,
        setFilter,
        totalQuestions
    };
}
