import { supabase } from '../lib/supabase';

/**
 * ProgressService handles saving and retrieving user quiz performance.
 * It now uses the authenticated Supabase user ID for persistent tracking.
 */
export const ProgressService = {
    async getCurrentUserId() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user?.id || null;
    },

    async saveAnswer(questionId: number, topic: string, isCorrect: boolean, timeSpentSeconds?: number, selectedOption?: string) {
        const userId = await this.getCurrentUserId();
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    client_id: userId,
                    question_id: questionId,
                    topico: topic,
                    is_correct: isCorrect,
                    time_spent_seconds: timeSpentSeconds || null,
                    selected_option: selectedOption || null
                }, { onConflict: 'client_id,question_id' });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    },

    async getTopicStats(topic: string) {
        const userId = await this.getCurrentUserId();
        if (!userId) return { total: 0, correct: 0, percentage: 0 };

        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('is_correct')
                .eq('client_id', userId)
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
        const userId = await this.getCurrentUserId();
        if (!userId) return { total: 0, correct: 0, percentage: 0, uniqueDays: 0, avgTimeSeconds: 0, history: [] };

        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select('is_correct, created_at, time_spent_seconds')
                .eq('client_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const total = data.length;
            const correct = data.filter(r => r.is_correct).length;
            const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

            const uniqueDays = new Set(data.map(item => new Date(item.created_at).toDateString())).size;

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
        const userId = await this.getCurrentUserId();
        if (!userId) return [];

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const { data, error } = await supabase
                .from('user_progress')
                .select('is_correct, created_at')
                .eq('client_id', userId)
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            const dailyMap = new Map<string, { correct: number; total: number }>();

            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const key = date.toDateString();
                dailyMap.set(key, { correct: 0, total: 0 });
            }

            data.forEach(item => {
                const key = new Date(item.created_at).toDateString();
                const existing = dailyMap.get(key) || { correct: 0, total: 0 };
                existing.total++;
                if (item.is_correct) existing.correct++;
                dailyMap.set(key, existing);
            });

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
        const userId = await this.getCurrentUserId();
        if (!userId) return [];

        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select(`
                    id,
                    is_correct,
                    created_at,
                    topico,
                    selected_option,

                    questao:question_id (
                        id,
                        enunciado,
                        imagem_url,
                        alt_a,
                        alt_b,
                        alt_c,
                        alt_d,
                        resposta_correta,
                        expansao_conhecimento,
                        explicacao_a,
                        explicacao_b,
                        explicacao_c,
                        explicacao_d,
                        topico
                    )
                `)
                .eq('client_id', userId)
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
