export interface QuestionDetail {
    id: number;
    enunciado: string;
    imagem_url: string | null;
    alt_a: string;
    alt_b: string;
    alt_c: string;
    alt_d: string;
    explicacao_a?: string;
    explicacao_b?: string;
    explicacao_c?: string;
    explicacao_d?: string;
    resposta_correta: string;
    expansao_conhecimento?: string;
    topico: string;
    selectedOption: string | null;
    isCorrect: boolean;
    isSkipped: boolean;
}

export interface TopicPerformance {
    name: string;
    total: number;
    correct: number;
    percentage: number;
    avgTimeSeconds: number;
    recommendationCount: number;
}

export interface ExamResult {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    percentage: number;
    timeSpent: string;
    questions: QuestionDetail[];
    topics: TopicPerformance[];
}
