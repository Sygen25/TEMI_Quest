import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../contexts/ExamContext';
import { supabase } from '../lib/supabase';
import QuestionDisplay from '../components/QuestionDisplay';
import { CheckCircle, XCircle, Clock, Target, ArrowLeft, BarChart2, ChevronDown, ChevronUp, AlertCircle, BookOpen, Timer } from 'lucide-react';

interface QuestionDetail {
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

interface TopicPerformance {
    name: string;
    total: number;
    correct: number;
    percentage: number;
    avgTimeSeconds: number;
    recommendationCount: number;
}

interface ExamResult {
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

export default function ExamResults() {
    const navigate = useNavigate();
    const { sessionId } = useExam();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    useEffect(() => {
        async function loadResults() {
            try {
                // Get session from URL or context
                const urlParams = new URLSearchParams(window.location.search);
                const sid = urlParams.get('session') || sessionId;

                if (!sid) {
                    navigate('/');
                    return;
                }

                // Fetch session data
                const { data: session } = await supabase
                    .from('exam_sessions')
                    .select('*')
                    .eq('id', sid)
                    .single();

                if (!session) {
                    navigate('/');
                    return;
                }

                // Fetch answers with timestamps
                const { data: answers } = await supabase
                    .from('exam_answers')
                    .select('question_id, selected_option, answered_at')
                    .eq('session_id', sid)
                    .order('answered_at', { ascending: true });

                // Fetch full questions data
                const questionIds = session.questions_order || [];
                const { data: questionsData } = await supabase
                    .from('Questoes')
                    .select('*')
                    .in('id', questionIds);

                if (!questionsData) return;

                const answersMap = new Map(answers?.map(a => [a.question_id, a.selected_option]) || []);
                const questionsMap = new Map(questionsData.map(q => [q.id, q]));

                // Process Results
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

                // Calculate Time per Topic
                // Create a map of questionId -> timeSpent
                const questionTimes = new Map<number, number>();
                if (answers && answers.length > 0) {
                    let lastTime = new Date(session.created_at).getTime();

                    answers.forEach((ans: any) => {
                        const currentTime = new Date(ans.answered_at).getTime();
                        let diffSeconds = (currentTime - lastTime) / 1000;

                        // Filter outliers (e.g. pauses > 10 min) and minimal thresholds
                        if (diffSeconds > 600) diffSeconds = 60; // Fallback estimate if too long
                        if (diffSeconds < 2) diffSeconds = 2; // Min threshold

                        questionTimes.set(ans.question_id, diffSeconds);
                        lastTime = currentTime;
                    });
                }

                // Process Topics
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
                    let recommendationCount = 5; // > 80% (Manutenção)
                    if (percentage < 50) recommendationCount = 20; // Reforço urgente
                    else if (percentage < 80) recommendationCount = 10; // Consolidação

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

                // Calculate total time spent
                const timeSpentSeconds = session.time_limit_seconds - session.time_remaining_seconds;
                const hours = Math.floor(timeSpentSeconds / 3600);
                const minutes = Math.floor((timeSpentSeconds % 3600) / 60);
                const timeSpent = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`;

                setResult({
                    totalQuestions: questionIds.length,
                    answeredQuestions: correctCount + incorrectCount,
                    correctAnswers: correctCount,
                    incorrectAnswers: incorrectCount,
                    unanswered: skippedCount,
                    percentage: Math.round((correctCount / questionIds.length) * 100),
                    timeSpent,
                    questions: processedQuestions,
                    topics
                });
            } catch (error) {
                console.error('Error loading results:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadResults();
    }, [sessionId, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!result) return null;

    const isPassing = result.percentage >= 60;
    const filteredQuestions = result.questions.filter(q => {
        if (filter === 'all') return true;
        if (filter === 'correct') return q.isCorrect;
        if (filter === 'incorrect') return !q.isCorrect && !q.isSkipped;
        if (filter === 'skipped') return q.isSkipped;
        return true;
    });

    // Donut Chart Calculations
    const circumference = 2 * Math.PI * 40; // r=40
    const correctDash = (result.correctAnswers / result.totalQuestions) * circumference;
    const incorrectDash = (result.incorrectAnswers / result.totalQuestions) * circumference;
    const skippedDash = (result.unanswered / result.totalQuestions) * circumference;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 fade-in">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sticky top-0 z-20 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Resultado do Simulado</h1>
                            <p className="text-xs text-slate-500">{result.timeSpent} • {result.totalQuestions} Questões</p>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${isPassing ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {result.percentage}% Aprov
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">

                {/* Top Section: Chart & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Donut Chart Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center relative">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" className="dark:stroke-slate-700" />

                                {/* Incorrect Segment (Red) */}
                                <circle
                                    cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12"
                                    strokeDasharray={`${incorrectDash} ${circumference}`}
                                    strokeDashoffset={-correctDash}
                                    className="transition-all duration-1000 ease-out"
                                />

                                {/* Skipped Segment (Gray) */}
                                <circle
                                    cx="50" cy="50" r="40" fill="transparent" stroke="#94a3b8" strokeWidth="12"
                                    strokeDasharray={`${skippedDash} ${circumference}`}
                                    strokeDashoffset={-(correctDash + incorrectDash)}
                                    className="transition-all duration-1000 ease-out"
                                />

                                {/* Correct Segment (Green) - First for base */}
                                <circle
                                    cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="12"
                                    strokeDasharray={`${correctDash} ${circumference}`}
                                    strokeDashoffset="0"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.percentage}%
                                </span>
                                <span className="text-xs text-slate-500 uppercase font-semibold">Acertos</span>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4 text-xs font-medium">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Acertos</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Erros</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Pulos</div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-5 border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center text-center">
                            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{result.correctAnswers}</div>
                            <div className="text-xs text-green-600/80 uppercase font-bold tracking-wide">Questões Corretas</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-5 border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center text-center">
                            <XCircle className="w-8 h-8 text-red-600 mb-2" />
                            <div className="text-3xl font-bold text-red-700 dark:text-red-400">{result.incorrectAnswers}</div>
                            <div className="text-xs text-red-600/80 uppercase font-bold tracking-wide">Questões Erradas</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                            <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                            <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">{result.unanswered}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">Não Respondidas</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center text-center">
                            <Clock className="w-8 h-8 text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{result.timeSpent}</div>
                            <div className="text-xs text-blue-600/80 uppercase font-bold tracking-wide">Tempo Total</div>
                        </div>
                    </div>
                </div>

                {/* Topics Performance */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-primary" />
                        Desempenho por Tópico
                    </h2>
                    <div className="space-y-4">
                        {result.topics.map((topic) => (
                            <div key={topic.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{topic.name}</span>
                                    <span className={`font-bold ${topic.percentage >= 70 ? 'text-green-600' : topic.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {topic.percentage}% ({topic.correct}/{topic.total})
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${topic.percentage >= 70 ? 'bg-green-500' : topic.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${topic.percentage}%` }}
                                    ></div>
                                </div>

                                {/* Metrics Row (Avg Time & Recommendation) */}
                                <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                        <Timer className="w-3.5 h-3.5" />
                                        <span>{topic.avgTimeSeconds > 0 ? `${topic.avgTimeSeconds}s / questão` : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span>
                                            Recomendação: <span className="text-primary font-bold">{topic.recommendationCount} questões</span> em 7 dias
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Revisão Detalhada
                        </h2>
                        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {(['all', 'correct', 'incorrect', 'skipped'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filter === f
                                        ? 'bg-slate-100 dark:bg-slate-700 text-primary'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {f === 'all' && 'Todas'}
                                    {f === 'correct' && 'Acertos'}
                                    {f === 'incorrect' && 'Erros'}
                                    {f === 'skipped' && 'Pulos'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredQuestions.map((q, index) => (
                            <div
                                key={q.id}
                                className={`bg-white dark:bg-slate-800 rounded-xl border transition-all overflow-hidden ${q.isCorrect ? 'border-l-4 border-l-green-500 border-slate-200 dark:border-slate-700' :
                                    q.isSkipped ? 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-700' :
                                        'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <button
                                    onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                    className="w-full text-left p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className={`mt-0.5 min-w-[24px] h-6 flex items-center justify-center rounded-full text-xs font-bold ${q.isCorrect ? 'bg-green-100 text-green-700' :
                                        q.isSkipped ? 'bg-slate-100 text-slate-600' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                                {q.topico}
                                            </span>
                                            {expandedQuestion === q.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                                            {q.enunciado}
                                        </p>
                                    </div>
                                </button>

                                {expandedQuestion === q.id && (
                                    <div className="px-4 pb-6 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2 bg-slate-50/50 dark:bg-slate-800/50">
                                        <div className="pt-4">
                                            <QuestionDisplay
                                                question={q}
                                                selectedOption={q.selectedOption}
                                                onOptionSelect={() => { }}
                                                showFeedback={true}
                                                isAnswered={true}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}
