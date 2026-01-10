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
            .select(`id, created_at`)
            .eq('user_id', targetUserId)
            .eq('status', 'completed');

        if (sessionsError || !sessions || sessions.length === 0) {
            return { percentage: 0, avgTimeSeconds: 0, total: 0, correct: 0, uniqueDays: 0 };
        }

        const sessionIds = sessions.map(s => s.id);
        const uniqueDates = new Set<string>();
        sessions.forEach(s => {
            if (s.created_at) uniqueDates.add(new Date(s.created_at).toDateString());
        });

        // Count actual answers for these sessions
        const { data: answers, error: answersError } = await supabase
            .from('exam_answers')
            .select('is_correct, time_spent_seconds')
            .in('session_id', sessionIds)
            .not('is_correct', 'is', null);

        if (answersError || !answers) {
            return { percentage: 0, avgTimeSeconds: 0, total: 0, correct: 0, uniqueDays: uniqueDates.size };
        }

        let totalCorrect = 0;
        let totalQuestions = answers.length;
        let totalTimeSpent = 0;

        answers.forEach(a => {
            if (a.is_correct) totalCorrect++;
            totalTimeSpent += (a.time_spent_seconds || 0);
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
        const days: { date: string; percentage: number | null; total: number; correct: number }[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push({ date: d.toISOString().split('T')[0], percentage: null, total: 0, correct: 0 });
        }

        const startDate = days[0].date;

        // Get all completed sessions for this user
        const { data: sessions } = await supabase
            .from('exam_sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed');

        if (!sessions || sessions.length === 0) return days.map(d => ({ date: d.date, percentage: d.percentage, total: d.total }));

        const sessionIds = sessions.map(s => s.id);

        // Get actual answers from these sessions, filtered by date
        const { data: answers } = await supabase
            .from('exam_answers')
            .select('answered_at, is_correct')
            .in('session_id', sessionIds)
            .not('is_correct', 'is', null)
            .gte('answered_at', `${startDate}T00:00:00`);

        if (answers) {
            answers.forEach((a: any) => {
                if (!a.answered_at) return;
                const answerDate = new Date(a.answered_at).toISOString().split('T')[0];
                const dayEntry = days.find(d => d.date === answerDate);
                if (dayEntry) {
                    dayEntry.total++;
                    if (a.is_correct) dayEntry.correct++;
                }
            });
        }

        // Calculate percentages
        return days.map(d => ({
            date: d.date,
            percentage: d.total > 0 ? Math.round((d.correct / d.total) * 100) : null,
            total: d.total
        }));
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

    async toggleFlag(questionId: number, isFlagged: boolean): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const sessionId = await this.getOrCreateDailyQuizSession(user.id);
            if (!sessionId) return;

            // Check if answer already exists
            const { data: existingAnswer } = await supabase
                .from('exam_answers')
                .select('id, selected_option, is_correct, time_spent_seconds')
                .eq('session_id', sessionId)
                .eq('question_id', questionId)
                .maybeSingle();

            if (existingAnswer) {
                // Update existing
                await supabase
                    .from('exam_answers')
                    .update({ is_flagged: isFlagged })
                    .eq('id', existingAnswer.id);
            } else {
                // Insert new (Flag only, no answer yet)
                // Note: assuming selected_option is nullable or defaults are handled. 
                // Using empty string/false for required fields if necessary.
                await supabase
                    .from('exam_answers')
                    .insert({
                        session_id: sessionId,
                        question_id: questionId,
                        is_flagged: isFlagged,
                        selected_option: '', // Placeholder if required
                        is_correct: false,    // Placeholder
                        time_spent_seconds: 0
                    });
            }
        } catch (err) {
            console.error('[ProgressService] Error toggling flag:', err);
        }
    },

    async saveNote(questionId: number, notes: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            const sessionId = await this.getOrCreateDailyQuizSession(user.id);
            if (!sessionId) return;

            // Check if answer already exists
            const { data: existingAnswer } = await supabase
                .from('exam_answers')
                .select('id')
                .eq('session_id', sessionId)
                .eq('question_id', questionId)
                .maybeSingle();

            if (existingAnswer) {
                // Update existing
                await supabase
                    .from('exam_answers')
                    .update({ notes })
                    .eq('id', existingAnswer.id);
            } else {
                // Insert new (Note only, no answer yet)
                await supabase
                    .from('exam_answers')
                    .insert({
                        session_id: sessionId,
                        question_id: questionId,
                        notes,
                        selected_option: '',
                        is_correct: false,
                        time_spent_seconds: 0
                    });
            }
            console.log('[ProgressService] Note saved successfully');
        } catch (err) {
            console.error('[ProgressService] Error saving note:', err);
        }
    },

    async getAIDashboardData(): Promise<any> {
        // Get user profile for name
        const { data: { user } } = await supabase.auth.getUser();
        let userName = 'Candidato';
        if (user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('display_name')
                .eq('user_id', user.id)
                .single();
            if (profile?.display_name) {
                userName = profile.display_name;
            }
        }

        const [allStats, topicInsights, weeklyStats] = await Promise.all([
            this.getAllStats(),
            this.getTopicInsights(),
            this.getWeeklyStats()
        ]);

        // Filter for weak points (score < 60% or very few questions answered)
        const weakPoints = topicInsights
            .filter(t => t.percentage < 60 && t.total > 5)
            .map(t => ({ topic: t.name, score: t.percentage + '%', total: t.total }));

        // Filter for strong points
        const strongPoints = topicInsights
            .filter(t => t.percentage > 80 && t.total > 10)
            .map(t => ({ topic: t.name, score: t.percentage + '%', total: t.total }));

        return {
            user_name: userName,
            summary: {
                total_questions: allStats.total,
                global_score: allStats.percentage + '%',
                average_time: allStats.avgTimeSeconds + 's',
                consistency_days: allStats.uniqueDays
            },
            weak_areas: weakPoints,
            strong_areas: strongPoints,
            recent_trend: weeklyStats.map(w => ({ date: w.date, score: w.percentage }))
        };
    },

    async getYearlyActivity(userId?: string): Promise<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[]> {
        let targetUserId = userId;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];
            targetUserId = user.id;
        }

        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Get all completed sessions in the last year
        const { data: sessions } = await supabase
            .from('exam_sessions')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('status', 'completed')
            .gte('created_at', oneYearAgo.toISOString());

        if (!sessions || sessions.length === 0) return [];

        const sessionIds = sessions.map(s => s.id);

        // Get answers from these sessions
        const { data: answers } = await supabase
            .from('exam_answers')
            .select('answered_at')
            .in('session_id', sessionIds)
            .gte('answered_at', oneYearAgo.toISOString());

        if (!answers || answers.length === 0) return [];

        const activityMap = new Map<string, number>();

        answers.forEach((a: any) => {
            if (!a.answered_at) return;
            const date = a.answered_at.split('T')[0];
            activityMap.set(date, (activityMap.get(date) || 0) + 1);
        });

        // Determine max activity for scaling levels
        const counts = Array.from(activityMap.values());
        const maxCount = Math.max(...counts, 1);

        const result: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];

        // Fill dates for calendar visualization if needed, but for now just return active days.
        // The heatmap component can handle filling gaps if necessary, or we send sparse data.
        // Let's send sparse data to save bandwidth, unless the component needs full range.

        activityMap.forEach((count, date) => {
            let level: 0 | 1 | 2 | 3 | 4 = 0;
            if (count === 0) level = 0;
            else if (count <= maxCount * 0.25) level = 1;
            else if (count <= maxCount * 0.50) level = 2;
            else if (count <= maxCount * 0.75) level = 3;
            else level = 4;

            result.push({ date, count, level });
        });

        return result.sort((a, b) => a.date.localeCompare(b.date));
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
