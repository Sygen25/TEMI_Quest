import { supabase } from '../lib/supabase';

interface ExtendedStats {
    percentage: number;
    avgTimeSeconds: number;
}

interface TopicStat {
    name: string;
    correct: number;
    total: number;
    percentage: number;
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
                time_remaining_seconds
            `)
            .eq('user_id', targetUserId)
            .eq('status', 'completed')
            .not('score', 'is', null)
            .order('created_at', { ascending: false });

        if (sessionsError) {
            console.error('Error fetching sessions:', sessionsError);
            return { percentage: 0, avgTimeSeconds: 0 };
        }

        let totalCorrect = 0;
        let totalQuestions = 0;
        let totalTimeSpent = 0;

        sessions?.forEach((s: any) => {
            totalCorrect += s.correct_answers || 0;
            totalQuestions += s.total_questions || 0;
            const timeLimit = s.time_limit_seconds || 0;
            const timeRemaining = s.time_remaining_seconds || 0;
            totalTimeSpent += (timeLimit - timeRemaining);
        });

        const globalPercentage = totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        const globalAvgTime = totalQuestions > 0
            ? Math.round(totalTimeSpent / totalQuestions)
            : 0;

        return {
            percentage: globalPercentage,
            avgTimeSeconds: globalAvgTime
        };
    },

    async getTopicInsights(userId?: string): Promise<TopicStat[]> {
        let targetUserId = userId;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];
            targetUserId = user.id;
        }

        // Get completed session IDs for this user
        const { data: sessions } = await supabase
            .from('exam_sessions')
            .select('id')
            .eq('user_id', targetUserId)
            .eq('status', 'completed');

        if (!sessions || sessions.length === 0) return [];

        const sessionIds = sessions.map(s => s.id);

        // Get answers with is_correct populated (only from finalized exams)
        const { data: answers, error } = await supabase
            .from('exam_answers')
            .select(`
                is_correct,
                question_id,
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

        // Aggregate by topic
        const topicsMap = new Map<string, { correct: number; total: number }>();

        answers.forEach((a: any) => {
            const topicName = a.Questoes?.topico || 'Geral';
            const existing = topicsMap.get(topicName) || { correct: 0, total: 0 };
            existing.total++;
            if (a.is_correct) existing.correct++;
            topicsMap.set(topicName, existing);
        });

        // Convert to array and calculate percentages
        const result: TopicStat[] = Array.from(topicsMap.entries())
            .map(([name, data]) => ({
                name,
                correct: data.correct,
                total: data.total,
                percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
            }))
            .sort((a, b) => a.percentage - b.percentage); // Worst first

        return result;
    }
};
