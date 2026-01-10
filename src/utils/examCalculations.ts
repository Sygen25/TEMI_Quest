import type { QuestionDetail, TopicPerformance, ExamResult } from '../types/exam';

export function processExamResults(
    session: any,
    answers: any[],
    questionsData: any[]
): ExamResult {
    const questionIds = session.questions_order || [];
    const answersMap = new Map(answers?.map(a => [a.question_id, a.selected_option]) || []);
    const questionsMap = new Map(questionsData.map(q => [q.id, q]));

    // 1. Process Individual Questions
    const processedQuestions: QuestionDetail[] = questionIds.map((qId: number) => {
        const q = questionsMap.get(qId);
        const selected = answersMap.get(qId) || null;
        const isSkipped = !selected;
        const isCorrect = selected?.toUpperCase() === q?.resposta_correta?.toUpperCase();

        return {
            id: qId,
            enunciado: q?.enunciado || '',
            imagem_url: q?.imagem_url || null,
            alt_a: q?.alt_a || '',
            alt_b: q?.alt_b || '',
            alt_c: q?.alt_c || '',
            alt_d: q?.alt_d || '',
            explicacao_a: q?.explicacao_a,
            explicacao_b: q?.explicacao_b,
            explicacao_c: q?.explicacao_c,
            explicacao_d: q?.explicacao_d,
            resposta_correta: q?.resposta_correta || '',
            expansao_conhecimento: q?.expansao_conhecimento,
            topico: q?.topico || 'Geral',
            selectedOption: selected ? selected.toUpperCase() : null,
            isCorrect,
            isSkipped
        };
    });

    const correctCount = processedQuestions.filter(q => q.isCorrect).length;
    const skippedCount = processedQuestions.filter(q => q.isSkipped).length;
    const incorrectCount = processedQuestions.length - correctCount - skippedCount;

    // 2. Calculate Time per Topic
    const questionTimes = new Map<number, number>();
    if (answers && answers.length > 0) {
        let lastTime = new Date(session.created_at).getTime();

        answers.forEach((ans: any) => {
            const currentTime = new Date(ans.answered_at).getTime();
            let diffSeconds = (currentTime - lastTime) / 1000;

            // Filter outliers
            if (diffSeconds > 600) diffSeconds = 60;
            if (diffSeconds < 2) diffSeconds = 2;

            questionTimes.set(ans.question_id, diffSeconds);
            lastTime = currentTime;
        });
    }

    // 3. Process Topics
    const topicsMap = new Map<string, { total: number; correct: number; totalTime: number; answeredCount: number }>();

    processedQuestions.forEach(q => {
        const current = topicsMap.get(q.topico) || { total: 0, correct: 0, totalTime: 0, answeredCount: 0 };
        const time = questionTimes.get(q.id) || 0;

        topicsMap.set(q.topico, {
            total: current.total + 1,
            correct: current.correct + (q.isCorrect ? 1 : 0),
            totalTime: current.totalTime + (time > 0 ? time : 0),
            answeredCount: current.answeredCount + (time > 0 ? 1 : 0)
        });
    });

    const topics: TopicPerformance[] = Array.from(topicsMap.entries()).map(([name, data]) => {
        const percentage = Math.round((data.correct / data.total) * 100);

        // Recommendation Logic
        let recommendationCount = 5;
        if (percentage < 50) recommendationCount = 20;
        else if (percentage < 80) recommendationCount = 10;

        // Avg Time
        const avgTimeSeconds = data.answeredCount > 0 ? Math.round(data.totalTime / data.answeredCount) : 0;

        return {
            name,
            total: data.total,
            correct: data.correct,
            percentage,
            avgTimeSeconds,
            recommendationCount
        };
    }).sort((a, b) => b.percentage - a.percentage);

    // 4. Calculate total time spent string
    const timeSpentSeconds = session.time_limit_seconds - session.time_remaining_seconds;
    const hours = Math.floor(timeSpentSeconds / 3600);
    const minutes = Math.floor((timeSpentSeconds % 3600) / 60);
    const seconds = Math.floor(timeSpentSeconds % 60);

    let timeSpentString = '';
    if (hours > 0) {
        timeSpentString = `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
        timeSpentString = `${minutes} min`;
    } else {
        timeSpentString = `${seconds} seg`;
    }

    return {
        totalQuestions: questionIds.length,
        answeredQuestions: correctCount + incorrectCount,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        unanswered: skippedCount,
        percentage: Math.round((correctCount / questionIds.length) * 100),
        timeSpent: timeSpentString,
        questions: processedQuestions,
        topics
    };
}
