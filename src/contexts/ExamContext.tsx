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

    shouldHideTotal: boolean;

    startExam: (config?: { questionCount: number; durationMinutes: number }) => Promise<void>;
    pauseExam: () => Promise<void>;
    endExam: () => Promise<void>;
    discardSession: () => Promise<void>;
    selectAnswer: (questionId: number, option: string) => void;
    toggleFlag: (questionId: number) => void;
    jumpToQuestion: (index: number) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
    const { user, userId } = useUser();
    const [isExamActive, setIsExamActive] = useState(false);
    const [hasActiveSession, setHasActiveSession] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [flags, setFlags] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [shouldHideTotal, setShouldHideTotal] = useState(false);

    // Initial Resume/Cleanup Logic
    const resumeExam = useCallback(async () => {
        try {
            setIsLoading(true);

            if (!userId) {
                console.log('[ExamContext] No user UUID available to resume');
                setIsLoading(false);
                return;
            }

            console.log('[ExamContext] Checking for active session for user:', userId);

            const { data: sessionData, error } = await supabase
                .from('exam_sessions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'in_progress')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error fetching session:", error);
                setIsLoading(false);
                return;
            }

            if (sessionData) {
                // Check if session is stale (e.g. time limit exceeded significantly in real time)
                // If the 'time_remaining_seconds' is likely outdated or created_at + total_time < now
                // For now, let's rely on time_remaining_seconds stored. If it's 0, it should be finished.
                // Or if it's been incomplete for > 24 hours, maybe abandon?

                // FORCE COMPLETE if time is up locally but incorrectly active in DB
                if (sessionData.time_remaining_seconds <= 0) {
                    console.log("Found active but expired session. Auto-completing...");
                    await supabase
                        .from('exam_sessions')
                        .update({ status: 'completed', end_time: new Date().toISOString() })
                        .eq('id', sessionData.id);
                    setHasActiveSession(false);
                    setIsLoading(false);
                    return;
                }

                console.log("Found valid active session:", sessionData.id);
                setSessionId(sessionData.id);
                setTimeLeft(sessionData.time_remaining_seconds);
                setCurrentIndex(sessionData.current_question_index || 0);

                let localQuestions: Question[] = [];

                // Re-fetch Questions using the saved IDs order
                if (sessionData.questions_order && Array.isArray(sessionData.questions_order)) {
                    const { data: qData } = await supabase
                        .from('Questoes')
                        .select('*')
                        .in('id', sessionData.questions_order);

                    if (qData) {
                        // Sort questions to match the saved order
                        localQuestions = sessionData.questions_order
                            .map((id: number) => qData.find((q: Question) => q.id === id))
                            .filter((q: Question | undefined) => !!q) as Question[];

                        setQuestions(localQuestions);
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

                    // Smart Resume: If DB index is 0 (or unsafe), try to find the first unanswered question
                    if (sessionData.current_question_index === 0 && localQuestions.length > 0 && answersData.length > 0) {
                        const firstUnansweredIndex = localQuestions.findIndex(q => !restoredAnswers[q.id]);
                        if (firstUnansweredIndex > 0) {
                            console.log(`[ExamContext] Smart Resuming at index ${firstUnansweredIndex} based on answers.`);
                            setCurrentIndex(firstUnansweredIndex);
                        } else if (firstUnansweredIndex === -1) {
                            setCurrentIndex(localQuestions.length - 1);
                        }
                    }
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
            // Only auto-save if we are still 'in_progress' to avoid race conditions with endExam
            // But actually endExam clears isExamActive, so this is safe.
            await supabase
                .from('exam_sessions')
                .update({ time_remaining_seconds: timeLeft, current_question_index: currentIndex })
                .eq('id', sessionId);
        }, 30000);

        return () => clearInterval(syncTimer);
    }, [isExamActive, sessionId, timeLeft, currentIndex]);

    // Note: checkActiveSession was removed because it caused race conditions.
    // resumeExam already handles checking for active sessions and setting hasActiveSession correctly.

    const startExam = useCallback(async (config = { questionCount: 90, durationMinutes: 240 }) => {
        if (!user) return;

        // Strict Check: Don't start if already active
        if (sessionId || hasActiveSession) {
            console.warn("Attempted to start exam while another is active. Resuming instead.");
            await resumeExam();
            return;
        }

        try {
            setIsLoading(true);
            setShouldHideTotal(false); // Default to false for new exam

            // 1. Fetch random questions
            // Fetch MORE than requested to support "Max available" logic without truncation first if possible
            // But if we want to know if we hit the limit, we just fetch generally.
            // Let's just limit by a safe generic max or the requested count.
            // Reverting to fetch all or large pool to shuffle is expensive but fine for this scale.
            const { data, error } = await supabase
                .from('Questoes')
                .select('*')
                .limit(1000); // Reasonable cap for now

            if (error) throw error;
            if (!data || data.length === 0) {
                alert('Não foi possível carregar as questões.');
                return;
            };

            // Check if we have enough questions
            const availableCount = data.length;
            const targetCount = config.questionCount;
            let finalQuestions = data;

            // Logic: If user asked for more than we have -> Use all available & Hide Total
            if (targetCount > availableCount) {
                console.log(`[ExamContext] Requested ${targetCount} questions, but only found ${availableCount}. Using all available and hiding total.`);
                setShouldHideTotal(true);
                // finalQuestions is already all data
            } else {
                setShouldHideTotal(false);
                // Shuffle and slice to target
                finalQuestions = data.sort(() => 0.5 - Math.random()).slice(0, targetCount);
            }

            // Double check shuffling for the "all available" case too
            if (targetCount > availableCount) {
                finalQuestions = finalQuestions.sort(() => 0.5 - Math.random());
            }

            const questionIds = finalQuestions.map((q: Question) => q.id);
            const actualTotal = finalQuestions.length;

            // 3. Create Session in DB
            if (!userId) throw new Error("User ID required");

            const { data: session, error: sessionError } = await supabase
                .from('exam_sessions')
                .insert({
                    user_id: userId,
                    total_questions: actualTotal,
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
            setQuestions(finalQuestions);
            setCurrentIndex(0);
            setAnswers({});
            setFlags([]);
            setTimeLeft(config.durationMinutes * 60);
            setIsExamActive(true);
            setHasActiveSession(true);

        } catch (error) {
            console.error('Error starting exam:', error);
            alert('Erro ao iniciar simulado. Tente novamente.');
        } finally {
            setIsLoading(false);
            // Note: If success, we stay in Exam mode. 
            // If failed, we are not loading anymore.
        }
    }, [user, resumeExam, sessionId, hasActiveSession]);

    const pauseExam = useCallback(async () => {
        if (sessionId) {
            // Save current state to database before pausing
            const { error } = await supabase
                .from('exam_sessions')
                .update({
                    time_remaining_seconds: timeLeft,
                    current_question_index: currentIndex
                })
                .eq('id', sessionId);

            if (error) console.error("Error pausing exam:", error);
        }

        // Always clear local state to "pause" UI
        setIsExamActive(false);
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers({});
        setFlags([]);
        setTimeLeft(0);
        setSessionId(null);
        // Keep hasActiveSession=true because it IS active in DB
        setHasActiveSession(true);
    }, [sessionId, timeLeft, currentIndex]);

    const endExam = useCallback(async () => {
        if (!sessionId) return;

        try {
            // Calculate score and prepare is_correct updates
            let correctCount = 0;
            const totalAnswered = Object.keys(answers).length;
            const correctnessUpdates: { questionId: number; isCorrect: boolean }[] = [];

            for (const [questionId, selectedOption] of Object.entries(answers)) {
                const question = questions.find(q => q.id === parseInt(questionId));
                const isCorrect = question?.resposta_correta?.toUpperCase() === selectedOption?.toUpperCase();
                if (isCorrect) correctCount++;
                correctnessUpdates.push({ questionId: parseInt(questionId), isCorrect });
            }
            const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

            console.log('Completing exam session:', sessionId);

            // Update is_correct for each answer (for analytics)
            for (const update of correctnessUpdates) {
                await supabase
                    .from('exam_answers')
                    .update({ is_correct: update.isCorrect })
                    .eq('session_id', sessionId)
                    .eq('question_id', update.questionId);
            }

            // Update session as completed
            const { error } = await supabase
                .from('exam_sessions')
                .update({
                    status: 'completed',
                    end_time: new Date().toISOString(),
                    score: Math.round(score * 100) / 100,
                    correct_answers: correctCount,
                    answered_count: totalAnswered,
                    time_remaining_seconds: timeLeft
                })
                .eq('id', sessionId);

            if (error) {
                console.error("Failed to complete exam in DB:", error);
                alert("Erro ao salvar finalização no banco de dados. Tente novamente.");
                throw error;
            }

            // Only clear local state if DB update was successful
            setIsExamActive(false);
            setHasActiveSession(false);
            setSessionId(null);
        } catch (error) {
            console.error("Critical error in endExam:", error);
        }
    }, [sessionId, answers, questions]);

    const discardSession = useCallback(async () => {
        try {
            // Hard reset for the user
            if (sessionId) {
                await supabase
                    .from('exam_sessions')
                    .update({ status: 'abandoned', end_time: new Date().toISOString() })
                    .eq('id', sessionId);
            }
            if (userId) {
                // Also check for any other in_progress sessions for this user and mark them abandoned
                // This is a "hard reset" for the user to fix stuck states
                await supabase
                    .from('exam_sessions')
                    .update({ status: 'abandoned' })
                    .eq('user_id', userId)
                    .eq('status', 'in_progress');
            }

            // Clear local
            setIsExamActive(false);
            setHasActiveSession(false);
            setSessionId(null);
            setQuestions([]);
            setCurrentIndex(0);
            setAnswers({});
            setFlags([]);
            setTimeLeft(0);

            // Reload page or force refresh context to ensure clean state
            window.location.reload();

        } catch (error) {
            console.error("Error discarding session:", error);
        }
    }, [sessionId, user]);

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
            shouldHideTotal,
            startExam,
            pauseExam,
            endExam,
            discardSession,
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
