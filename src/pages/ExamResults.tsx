import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../contexts/ExamContext';
import { supabase } from '../lib/supabase';
import type { ExamResult } from '../types/exam';
import { processExamResults } from '../utils/examCalculations';
import { ResultHeader } from '../components/ResultHeader';
import { ResultChart } from '../components/ResultChart';
import { ResultStats } from '../components/ResultStats';
import { TopicList } from '../components/TopicList';
import { DetailedReview } from '../components/DetailedReview';

export default function ExamResults() {
    const navigate = useNavigate();
    const { sessionId } = useExam();
    const [result, setResult] = useState<ExamResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                // Handle case where session has no questions yet (edge case)
                if (questionIds.length === 0) {
                    setResult(null); // Or some empty state
                    setIsLoading(false);
                    return;
                }

                const { data: questionsData } = await supabase
                    .from('Questoes')
                    .select('*')
                    .in('id', questionIds);

                if (!questionsData) return;

                // Process Results using utility
                const processedResult = processExamResults(session, answers || [], questionsData);
                setResult(processedResult);

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

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                <div className="w-20 h-20 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-4xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Ops! Resultados indisponíveis</h2>
                <p className="mb-6 text-slate-500 max-w-sm">Não foi possível carregar os dados desta sessão. Ela pode ter sido interrompida ou os dados ainda não foram processados.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg"
                >
                    Voltar ao Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 fade-in">
            <ResultHeader
                percentage={result.percentage}
                timeSpent={result.timeSpent}
                totalQuestions={result.totalQuestions}
            />

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Top Section: Chart & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ResultChart
                        percentage={result.percentage}
                        correct={result.correctAnswers}
                        incorrect={result.incorrectAnswers}
                        skipped={result.unanswered}
                        total={result.totalQuestions}
                    />

                    <ResultStats
                        correct={result.correctAnswers}
                        incorrect={result.incorrectAnswers}
                        unanswered={result.unanswered}
                        timeSpent={result.timeSpent}
                    />
                </div>

                {/* Topics Performance */}
                <TopicList topics={result.topics} />

                {/* Questions Review */}
                <DetailedReview questions={result.questions} />

                <div className="pt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}
