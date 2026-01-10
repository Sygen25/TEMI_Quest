import { supabase } from '../lib/supabase';

interface ExtendedStats {
    percentage: number;
    avgTimeSeconds: number;
    total: number;
    correct: number;
    uniqueDays: number;
}

interface TopicStat {
    name: string;
    correct: number;
    total: number;
    percentage: number;
    avgTimeSeconds: number;
}

export const ProgressService = {
    async getAllStats(userId?: string): Promise<ExtendedStats> {
        let targetUserId = userId;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');
            targetUserId = user.id;
        }

        const { data: sessions, error: sessionsError } = await supabase
            .from('exam_sessions')
            .select(`
                id,
                score,
                total_questions,
                correct_answers,
                time_limit_seconds,
                time_remaining_seconds,
                created_at
            `)
            .eq('user_id', targetUserId)
            .eq('status', 'completed')
            // .not('score', 'is', null) // Removed to include 'quiz' mode sessions which have null score
            .order('created_at', { ascending: false });

        if (sessionsError) {
            console.error('Error fetching sessions:', sessionsError);
            return { percentage: 0, avgTimeSeconds: 0, total: 0, correct: 0, uniqueDays: 0 };
        }

        let totalCorrect = 0;
        let totalQuestions = 0;
        let totalTimeSpent = 0;
        const uniqueDates = new Set<string>();

        sessions?.forEach((s: any) => {
            totalCorrect += s.correct_answers || 0;
            totalQuestions += s.total_questions || 0;
            const timeLimit = s.time_limit_seconds || 0;
            const timeRemaining = s.time_remaining_seconds || 0;
            totalTimeSpent += (timeLimit - timeRemaining);
            if (s.created_at) {
                uniqueDates.add(new Date(s.created_at).toDateString());
            }
        });

        const globalPercentage = totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        const globalAvgTime = totalQuestions > 0
            ? Math.round(totalTimeSpent / totalQuestions)
            : 0;

        return {
            percentage: globalPercentage,
            avgTimeSeconds: globalAvgTime,
            total: totalQuestions,
            correct: totalCorrect,
            uniqueDays: uniqueDates.size
        };
    },

    async getTopicInsights(userId?: string): Promise<TopicStat[]> {
        let targetUserId = userId;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];
            targetUserId = user.id;
        }

        const { data: sessions } = await supabase
            .from('exam_sessions')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('status', 'completed');

        if (!sessions || sessions.length === 0) return [];

        const sessionIds = sessions.map(s => s.id);

        const { data: answers, error } = await supabase
            .from('exam_answers')
            .select(`
                is_correct,
                question_id,
                time_spent_seconds,
                Questoes (
                    topico
                )
            `)
            .in('session_id', sessionIds)
            .not('is_correct', 'is', null);

        if (error || !answers) {
            console.error('Error fetching topic insights:', error);
            return [];
        }

        const topicsMap = new Map<string, { correct: number; total: number; totalTime: number }>();

        answers.forEach((a: any) => {
            const topicName = a.Questoes?.topico || 'Geral';
            const existing = topicsMap.get(topicName) || { correct: 0, total: 0, totalTime: 0 };
            existing.total++;
            existing.totalTime += (a.time_spent_seconds || 0);
            if (a.is_correct) existing.correct++;
            topicsMap.set(topicName, existing);
        });

        const result: TopicStat[] = Array.from(topicsMap.entries())
            .map(([name, data]) => ({
                name,
                correct: data.correct,
                total: data.total,
                percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                avgTimeSeconds: data.total > 0 ? Math.round(data.totalTime / data.total) : 0
            }))
            .sort((a, b) => a.percentage - b.percentage);

        return result;
    },

    async getTopicStats(topicName: string): Promise<{ total: number; percentage: number }> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { total: 0, percentage: 0 };

        const { data: sessions } = await supabase
            .from('exam_sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed');

        if (!sessions || sessions.length === 0) return { total: 0, percentage: 0 };

        const sessionIds = sessions.map(s => s.id);

        const { data: answers } = await supabase
            .from('exam_answers')
            .select(`
                is_correct,
                Questoes (
                    topico
                )
            `)
            .in('session_id', sessionIds)
            .not('is_correct', 'is', null);

        if (!answers) return { total: 0, percentage: 0 };

        const filtered = answers.filter((a: any) => a.Questoes?.topico === topicName);
        const correct = filtered.filter((a: any) => a.is_correct).length;
        const total = filtered.length;

        return {
            total,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0
        };
    },

    async getWeeklyStats(): Promise<{ date: string; percentage: number | null; total: number }[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Get last 7 days
        const days: { date: string; percentage: number | null; total: number }[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push({ date: d.toISOString().split('T')[0], percentage: null, total: 0 });
        }

        const startDate = days[0].date;

        const { data: sessions } = await supabase
            .from('exam_sessions')
            .select('created_at, score, total_questions, correct_answers')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .gte('created_at', startDate);
        // .not('score', 'is', null); // Removed to include quiz sessions

        if (sessions) {
            sessions.forEach((s: any) => {
                const sessionDate = new Date(s.created_at).toISOString().split('T')[0];
                const dayEntry = days.find(d => d.date === sessionDate);
                if (dayEntry) {
                    dayEntry.total += s.total_questions || 0;
                    const correctInSession = s.correct_answers || 0;
                    const currentCorrect = dayEntry.percentage !== null
                        ? (dayEntry.percentage / 100) * (dayEntry.total - (s.total_questions || 0))
                        : 0;
                    const newTotal = dayEntry.total;
                    dayEntry.percentage = newTotal > 0
                        ? Math.round(((currentCorrect + correctInSession) / newTotal) * 100)
                        : null;
                }
            });
        }

        return days;
    },

    async getHistory(limit: number = 100): Promise<any[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: sessions } = await supabase
            .from('exam_sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed');

        if (!sessions || sessions.length === 0) return [];

        const sessionIds = sessions.map(s => s.id);

        const { data: answers, error } = await supabase
            .from('exam_answers')
            .select(`
                id,
                is_correct,
                selected_option,
                answered_at,
                question_id,
                Questoes (
                    id,
                    enunciado,
                    resposta_correta,
                    topico
                )
            `)
            .in('session_id', sessionIds)
            .not('is_correct', 'is', null)
            .order('answered_at', { ascending: false })
            .limit(limit);

        if (error || !answers) return [];

        return answers.map((a: any) => ({
            id: a.id,
            is_correct: a.is_correct,
            created_at: a.answered_at,
            topico: a.Questoes?.topico || 'Geral',
            selected_option: a.selected_option,
            questao: {
                enunciado: a.Questoes?.enunciado || '',
                resposta_correta: a.Questoes?.resposta_correta || ''
            }
        }));
    },

    async saveAnswer(
        questionId: number,
        isCorrect: boolean,
        timeSpentSeconds: number,
        selectedOption: string
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const sessionId = await this.getOrCreateDailyQuizSession(user.id);
            if (!sessionId) return;

            // Check if answer already exists
            const { data: existingAnswer } = await supabase
                .from('exam_answers')
                .select('id, is_correct')
                .eq('session_id', sessionId)
                .eq('question_id', questionId)
                .maybeSingle();

            const { data: session } = await supabase
                .from('exam_sessions')
                .select('total_questions, correct_answers')
                .eq('id', sessionId)
                .single();

            if (!session) return;

            let newTotal = session.total_questions || 0;
            let newCorrect = session.correct_answers || 0;

            if (existingAnswer) {
                if (!existingAnswer.is_correct && isCorrect) {
                    newCorrect++;
                } else if (existingAnswer.is_correct && !isCorrect) {
                    newCorrect--;
                }
            } else {
                newTotal++;
                if (isCorrect) newCorrect++;
            }

            // Save/Update answer
            await supabase.from('exam_answers').upsert({
                session_id: sessionId,
                question_id: questionId,
                selected_option: selectedOption,
                is_correct: isCorrect,
                time_spent_seconds: timeSpentSeconds,
                answered_at: new Date().toISOString()
            }, {
                onConflict: 'session_id, question_id'
            });

            // Update session stats
            await supabase.from('exam_sessions').update({
                total_questions: newTotal,
                correct_answers: newCorrect,
                updated_at: new Date().toISOString()
            }).eq('id', sessionId);

            console.log('[ProgressService] Answer saved successfully', { isCorrect, sessionId, updated: !!existingAnswer });
        } catch (err) {
            console.error('[ProgressService] Unexpected error in saveAnswer:', err);
        }
    },

    async getOrCreateDailyQuizSession(userId: string): Promise<string | null> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Find existing session for today with mode='quiz'
        const query = (supabase as any)
            .from('exam_sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('mode', 'quiz')
            .gte('created_at', `${today}T00:00:00`)
            .lt('created_at', `${today}T23:59:59`)
            .limit(1);

        const { data: sessions } = await query;

        if (sessions && sessions.length > 0) {
            return sessions[0].id;
        }

        // Create new session
        const { data: newSession, error } = await supabase
            .from('exam_sessions')
            .insert({
                user_id: userId,
                status: 'completed', // Completed so it doesn't show up as "Resumable"
                mode: 'quiz',
                total_questions: 0,
                correct_answers: 0,
                score: null,
                questions_order: [],
                time_limit_seconds: 0,
                time_remaining_seconds: 0
            })
            .select('id')
            .single();

        if (error) {
            console.error('[ProgressService] Error creating daily session:', error);
            return null;
        }

        return newSession.id;
    }
};
