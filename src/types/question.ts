/**
 * Unified Question type used across Quiz and Exam modules.
 */
export interface Question {
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
