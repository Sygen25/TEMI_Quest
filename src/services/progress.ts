import { supabase } from '../lib/supabase';

interface ExtendedStats {
    percentage: number;
    avgTimeSeconds: number;
}

export const ProgressService = {
    async getAllStats(userId?: string): Promise<ExtendedStats> {
        // Use provided userId or fallback to current user
        let targetUserId = userId;

        if (!targetUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');
            targetUserId = user.id;
        }

        // Get Completed Sessions (using only columns that exist)
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

        // Calculate Global Stats from Sessions
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
    }
};
