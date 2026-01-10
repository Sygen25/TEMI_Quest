import { supabase } from '../lib/supabase';
import { ProgressService } from './progress';

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
}

export const AIPerformanceService = {
    async analyzeDataAndStartChat(): Promise<AIMessage> {
        try {
            // 1. Get real user data
            const dashboardData = await ProgressService.getAIDashboardData();
            console.log('[AI Tutor] Context Data:', dashboardData);

            // 2. Call Edge Function (Real Backend)
            const { data, error } = await supabase.functions.invoke('ai-tutor', {
                body: {
                    action: 'analyze',
                    contextData: dashboardData,
                    userMessage: null
                }
            });

            if (error) {
                console.error('[AI Tutor] Edge Function Error:', error);
                throw error;
            }

            // Fallback content if API returns empty or mock
            const content = data?.content || data?.mock_reply || "Ocorreu um erro ao conectar com o preceptor.";

            return {
                id: '1',
                role: 'assistant',
                content: content,
                timestamp: new Date()
            };

        } catch (err: any) {
            console.error(err);
            return {
                id: 'error',
                role: 'assistant',
                content: `Erro técnico: ${err.message || JSON.stringify(err)}. Verifique o console.`,
                timestamp: new Date()
            };
        }
    },

    async sendMessage(userMessage: string): Promise<AIMessage> {
        try {
            const dashboardData = await ProgressService.getAIDashboardData(); // Refresh context

            const { data, error } = await supabase.functions.invoke('ai-tutor', {
                body: {
                    action: 'chat',
                    contextData: dashboardData,
                    userMessage: userMessage
                }
            });

            if (error) throw error;

            const content = data?.content || data?.mock_reply || "Sem resposta.";

            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: content,
                timestamp: new Date()
            };

        } catch (err) {
            console.error(err);
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Erro ao enviar mensagem.",
                timestamp: new Date()
            };
        }
    }
};
