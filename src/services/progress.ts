import { supabase } from '../lib/supabase';

const GUEST_ID_KEY = 'temi_quest_guest_id';

// Helper to get or create a persistent Guest ID
export function getClientId(): string {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
}

export const ProgressService = {
    async saveAnswer(questionId: number, topic: string, isCorrect: boolean, timeSpentSeconds?: number) {
        const clientId = getClientId();

        try {
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    client_id: clientId,
                    question_id: questionId,
                    topico: topic,
                    is_correct: isCorrect,
                    time_spent_seconds: timeSpentSeconds || null
                }, { onConflict: 'client_id,question_id' });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    },

    async getTopicStats(topic: string) {
        const clientId = getClientId();

        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('is_correct')
                .eq('client_id', clientId)
                .eq('topico', topic);

            if (error) throw error;

            const total = data.length;
            const correct = data.filter(r => r.is_correct).length;
            const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

            return { total, correct, percentage };
        } catch (error) {
            console.error('Error fetching topic stats:', error);
            return { total: 0, correct: 0, percentage: 0 };
        }
    },

    async getAllStats() {
        const clientId = getClientId();

        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('is_correct, created_at, time_spent_seconds')
                .eq('client_id', clientId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const total = data.length;
            const correct = data.filter(r => r.is_correct).length;
            const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

            // Calculate streak (consecutive days with at least one answer)
            const uniqueDays = new Set(data.map(item => new Date(item.created_at).toDateString())).size;

            // Calculate average time per question
            const timesWithData = data.filter(r => r.time_spent_seconds !== null && r.time_spent_seconds > 0);
            const avgTimeSeconds = timesWithData.length > 0
                ? Math.round(timesWithData.reduce((sum, r) => sum + r.time_spent_seconds, 0) / timesWithData.length)
                : 0;

            return { total, correct, percentage, uniqueDays, avgTimeSeconds, history: data };
        } catch (error) {
            console.error('Error fetching global stats:', error);
            return { total: 0, correct: 0, percentage: 0, uniqueDays: 0, avgTimeSeconds: 0, history: [] };
        }
    },

    async getWeeklyStats() {
        const clientId = getClientId();

        try {
            // Get data from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('user_progress')
                .select('is_correct, created_at')
                .eq('client_id', clientId)
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by day and calculate accuracy
            const dailyMap = new Map<string, { correct: number; total: number }>();

            // Initialize all 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const key = date.toDateString();
                dailyMap.set(key, { correct: 0, total: 0 });
            }

            // Fill with actual data
            data.forEach(item => {
                const key = new Date(item.created_at).toDateString();
                const existing = dailyMap.get(key) || { correct: 0, total: 0 };
                existing.total++;
                if (item.is_correct) existing.correct++;
                dailyMap.set(key, existing);
            });

            // Convert to array with percentages
            const dailyStats = Array.from(dailyMap.entries()).map(([date, stats]) => ({
                date,
                percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null,
                total: stats.total
            }));

            return dailyStats;
        } catch (error) {
            console.error('Error fetching weekly stats:', error);
            return [];
        }
    },

    async getHistory(limit: number = 50) {
        const clientId = getClientId();

        try {
            // Join with questao table to get question details
            const { data, error } = await supabase
                .from('user_progress')
                .select(`
                    id,
                    is_correct,
                    created_at,
                    topico,
                    questao:question_id (
                        enunciado,
                        resposta_correta
                    )
                `)
                .eq('client_id', clientId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    }
};
