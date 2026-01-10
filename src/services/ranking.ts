import { supabase } from '../lib/supabase';

export interface RankingEntry {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
    score: number;
    position?: number;
}

export const RankingService = {
    async getGlobalRanking(limit = 50): Promise<RankingEntry[]> {
        const { data, error } = await supabase
            .from('ranking_scores')
            .select('*')
            .order('score', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data.map((entry, index) => ({
            ...entry,
            position: index + 1
        }));
    }
};
