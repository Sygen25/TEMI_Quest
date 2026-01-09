import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface Question {
    id: number;
    enunciado: string;
    imagem_url: string | null;
    alt_a: string;
    alt_b: string;
    alt_c: string;
    alt_d: string;
    resposta_correta: string;
    topico: string;
    explicacao_a?: string;
    explicacao_b?: string;
    explicacao_c?: string;
    explicacao_d?: string;
    expansao_conhecimento?: string;
}

interface ExamContextType {
    isExamActive: boolean; // Controls if the exam UI is active/mounted
    hasActiveSession: boolean; // Controls if there is a session in progress in DB
    questions: Question[];
    currentIndex: number;
    answers: Record<number, string>; // questionId -> selectedOption
    flags: number[]; // Array of flagged question IDs
    timeLeft: number; // Seconds
    sessionId: string | null;
    isLoading: boolean;

    startExam: (config?: { questionCount: number; durationMinutes: number }) => Promise<void>;
    pauseExam: () => Promise<void>;
    endExam: () => Promise<void>;
    selectAnswer: (questionId: number, option: string) => void;
    toggleFlag: (questionId: number) => void;
    jumpToQuestion: (index: number) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [isExamActive, setIsExamActive] = useState(false);
    const [hasActiveSession, setHasActiveSession] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [flags, setFlags] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Define resumeExam BEFORE using it in useEffect
    const resumeExam = useCallback(async () => {
        try {
            setIsLoading(true);
            const userUUID = user?.user_id;

            if (!userUUID) {
                console.log('[ExamContext] No user UUID available to resume');
                setIsLoading(false);
                return;
            }

            console.log('[ExamContext] Resuming exam for user:', userUUID);

            const { data: sessionData, error } = await supabase
                .from('exam_sessions')
                .select('*')
                .eq('user_id', userUUID)
                .eq('status', 'in_progress')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error fetching session:", error);
                setIsLoading(false);
                return;
            }

            console.log('[ExamContext] Session query result:', sessionData);

            if (sessionData) {
                console.log("Found active session:", sessionData.id);
                setSessionId(sessionData.id);
                setTimeLeft(sessionData.time_remaining_seconds);
                setCurrentIndex(sessionData.current_question_index || 0);

                // Re-fetch Questions using the saved IDs order
                if (sessionData.questions_order && Array.isArray(sessionData.questions_order)) {
                    const { data: qData } = await supabase
                        .from('Questoes')
                        .select('*')
                        .in('id', sessionData.questions_order);

                    if (qData) {
                        // Sort questions to match the saved order
                        const orderedQuestions = sessionData.questions_order
                            .map((id: number) => qData.find((q: Question) => q.id === id))
                            .filter((q: Question | undefined) => !!q) as Question[];

                        setQuestions(orderedQuestions);
                    }
                }

                // Restore Answers and Flags
                const { data: answersData } = await supabase
                    .from('exam_answers')
                    .select('*')
                    .eq('session_id', sessionData.id);

                if (answersData) {
                    const restoredAnswers: Record<number, string> = {};
                    const restoredFlags: number[] = [];

                    answersData.forEach((a: any) => {
                        if (a.selected_option) restoredAnswers[a.question_id] = a.selected_option;
                        if (a.is_flagged) restoredFlags.push(a.question_id);
                    });

                    setAnswers(restoredAnswers);
                    setFlags(restoredFlags);
                }

                setIsExamActive(true);
                setHasActiveSession(true);
            } else {
                setHasActiveSession(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Initial Resume Check
    useEffect(() => {
        if (user) {
            resumeExam();
        } else {
            setIsLoading(false);
        }
    }, [user, resumeExam]);

    // Timer Logic
    useEffect(() => {
        if (!isExamActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const updated = prev - 1;
                return updated;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isExamActive, timeLeft]);

    // Auto-Save Timer to DB (Every 30 seconds)
    useEffect(() => {
        if (!isExamActive || !sessionId) return;

        const syncTimer = setInterval(async () => {
            await supabase
                .from('exam_sessions')
                .update({ time_remaining_seconds: timeLeft, current_question_index: currentIndex })
                .eq('id', sessionId);
        }, 30000);

        return () => clearInterval(syncTimer);
    }, [isExamActive, sessionId, timeLeft, currentIndex]);

    // Check for active session periodically or on mount without full resume
    const checkActiveSession = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from('exam_sessions')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('status', 'in_progress')
            .maybeSingle();

        setHasActiveSession(!!data);
        if (data) setSessionId(data.id);
    }, [user]);

    useEffect(() => {
        checkActiveSession();
    }, [checkActiveSession]);

    const startExam = useCallback(async (config = { questionCount: 90, durationMinutes: 240 }) => {
        if (!user) return;

        // If we already have a session ID locally or confirmed via check, RESUME instead of start new
        if (sessionId || hasActiveSession) {
            await resumeExam();
            return;
        }

        try {
            setIsLoading(true);
            // 1. Fetch random questions
            const { data, error } = await supabase
                .from('Questoes')
                .select('*')
                .limit(config.questionCount * 2);

            if (error) throw error;
            if (!data || data.length === 0) return;

            // 2. Shuffle and slice
            const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, config.questionCount);
            const questionIds = shuffled.map((q: Question) => q.id);

            // 3. Create Session in DB
            const userUUID = user.user_id;

            if (!userUUID) {
                console.error("User UUID not found in profile");
                setIsLoading(false);
                return;
            }

            const { data: session, error: sessionError } = await supabase
                .from('exam_sessions')
                .insert({
                    user_id: userUUID,
                    total_questions: config.questionCount,
                    time_limit_seconds: config.durationMinutes * 60,
                    time_remaining_seconds: config.durationMinutes * 60,
                    status: 'in_progress',
                    questions_order: questionIds
                })
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 4. Set Local State
            setSessionId(session.id);
            setQuestions(shuffled);
            setCurrentIndex(0);
            setAnswers({});
            setFlags([]);
            setTimeLeft(config.durationMinutes * 60);
            setIsExamActive(true);
            setHasActiveSession(true);

        } catch (error) {
            console.error('Error starting exam:', error);
        } finally {
            setIsLoading(false);
            // Note: If success, we stay in Exam mode. 
            // If failed, we are not loading anymore.
        }
    }, [user, resumeExam, sessionId, hasActiveSession]);

    const pauseExam = useCallback(async () => {
        if (sessionId) {
            // Save current state to database before pausing
            await supabase
                .from('exam_sessions')
                .update({
                    time_remaining_seconds: timeLeft,
                    current_question_index: currentIndex
                })
                .eq('id', sessionId);
        }
        // Reset local state but keep session as in_progress in DB
        setIsExamActive(false);
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers({});
        setFlags([]);
        setTimeLeft(0);
        setSessionId(null);
        // Do NOT set hasActiveSession to false here, because it IS active in DB, just paused locally
        // Actually, wait... pause means we navigate away, but it's still "Active" in terms of "Unfinished"
        // So hasActiveSession remains true.
        setHasActiveSession(true);
    }, [sessionId, timeLeft, currentIndex]);

    const endExam = useCallback(async () => {
        if (sessionId) {
            await supabase
                .from('exam_sessions')
                .update({ status: 'completed', end_time: new Date().toISOString() })
                .eq('id', sessionId);
        }
        setIsExamActive(false);
        setHasActiveSession(false); // Finished definitively
        setSessionId(null);
        // TODO: Navigate to results page
    }, [sessionId]);

    const selectAnswer = useCallback(async (questionId: number, option: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));

        if (sessionId) {
            const { error } = await supabase
                .from('exam_answers')
                .upsert({
                    session_id: sessionId,
                    question_id: questionId,
                    selected_option: option,
                    answered_at: new Date().toISOString()
                }, { onConflict: 'session_id, question_id' });

            if (error) console.error("Error saving answer:", error);
        }
    }, [sessionId]);

    const toggleFlag = useCallback(async (questionId: number) => {
        const exists = flags.includes(questionId);
        const isFlagged = !exists;

        setFlags(prev =>
            exists
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );

        if (sessionId) {
            const currentAnswer = answers[questionId] || null;

            await supabase
                .from('exam_answers')
                .upsert({
                    session_id: sessionId,
                    question_id: questionId,
                    is_flagged: isFlagged,
                    selected_option: currentAnswer
                }, { onConflict: 'session_id, question_id' });
        }
    }, [sessionId, answers, flags]);

    const jumpToQuestion = useCallback((index: number) => {
        if (index >= 0 && index < questions.length) {
            setCurrentIndex(index);
            if (sessionId) {
                supabase
                    .from('exam_sessions')
                    .update({ current_question_index: index })
                    .eq('id', sessionId)
                    .then();
            }
        }
    }, [questions.length, sessionId]);

    const nextQuestion = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            if (sessionId) {
                supabase
                    .from('exam_sessions')
                    .update({ current_question_index: newIndex })
                    .eq('id', sessionId)
                    .then();
            }
        }
    }, [currentIndex, questions.length, sessionId]);

    const prevQuestion = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            if (sessionId) {
                supabase
                    .from('exam_sessions')
                    .update({ current_question_index: newIndex })
                    .eq('id', sessionId)
                    .then();
            }
        }
    }, [currentIndex, sessionId]);

    return (
        <ExamContext.Provider value={{
            isExamActive,
            hasActiveSession,
            questions,
            currentIndex,
            answers,
            flags,
            timeLeft,
            sessionId,
            isLoading,
            startExam,
            pauseExam,
            endExam,
            selectAnswer,
            toggleFlag,
            jumpToQuestion,
            nextQuestion,
            prevQuestion
        }}>
            {children}
        </ExamContext.Provider>
    );
}

export function useExam() {
    const context = useContext(ExamContext);
    if (context === undefined) {
        throw new Error('useExam must be used within an ExamProvider');
    }
    return context;
}
