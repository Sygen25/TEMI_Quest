export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            exam_sessions: {
                Row: {
                    id: string
                    user_id: string
                    status: 'in_progress' | 'completed' | 'abandoned'
                    score: number | null
                    total_questions: number
                    correct_answers: number
                    answered_count: number
                    time_limit_seconds: number
                    time_remaining_seconds: number
                    questions_order: number[]
                    current_question_index: number
                    created_at: string
                    updated_at: string
                    end_time: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    status?: 'in_progress' | 'completed' | 'abandoned'
                    score?: number | null
                    total_questions: number
                    correct_answers?: number
                    answered_count?: number
                    time_limit_seconds: number
                    time_remaining_seconds: number
                    questions_order: number[]
                    current_question_index?: number
                    created_at?: string
                    updated_at?: string
                    end_time?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    status?: 'in_progress' | 'completed' | 'abandoned'
                    score?: number | null
                    total_questions?: number
                    correct_answers?: number
                    answered_count?: number
                    time_limit_seconds?: number
                    time_remaining_seconds?: number
                    questions_order?: number[]
                    current_question_index?: number
                    created_at?: string
                    updated_at?: string
                    end_time?: string | null
                }
            }
            exam_answers: {
                Row: {
                    id: string
                    session_id: string
                    question_id: number
                    selected_option: string
                    is_correct: boolean
                    time_spent_seconds: number
                    answered_at: string
                }
                Insert: {
                    id?: string
                    session_id: string
                    question_id: number
                    selected_option: string
                    is_correct: boolean
                    time_spent_seconds?: number
                    answered_at?: string
                }
                Update: {
                    id?: string
                    session_id?: string
                    question_id?: number
                    selected_option?: string
                    is_correct?: boolean
                    time_spent_seconds?: number
                    answered_at?: string
                }
            }
            Questoes: {
                Row: {
                    id: number
                    enunciado: string
                    imagem_url: string | null
                    alt_a: string
                    alt_b: string
                    alt_c: string
                    alt_d: string
                    explicacao_a: string | null
                    explicacao_b: string | null
                    explicacao_c: string | null
                    explicacao_d: string | null
                    resposta_correta: string
                    expansao_conhecimento: string | null
                    topico: string
                    created_at: string
                }
            }
            user_profiles: {
                Row: {
                    id: number
                    user_id: string
                    email: string
                    display_name: string
                    avatar_url: string | null
                    client_id: string
                    created_at: string
                    updated_at: string
                }
            }
        }
    }
}
