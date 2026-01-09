import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../contexts/ExamContext';
import QuestionDisplay from '../components/QuestionDisplay';
import ExamSidebar from '../components/ExamSidebar';
import { ArrowLeft, ArrowRight, Flag, Clock, Menu, Pause } from 'lucide-react';

export default function Exam() {
    const navigate = useNavigate();
    const {
        isExamActive,
        questions,
        currentIndex,
        answers,
        flags,
        timeLeft,
        selectAnswer,
        toggleFlag,
        nextQuestion,
        prevQuestion,
        pauseExam,
        endExam,
        isLoading,
        sessionId
    } = useExam();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if no active exam AND not loading AND not submitting
    useEffect(() => {
        if (!isLoading && !isSubmitting && (!isExamActive || questions.length === 0)) {
            navigate('/');
        }
    }, [isExamActive, questions, navigate, isLoading, isSubmitting]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isExamActive && !isSubmitting) return null;

    const currentQuestion = questions[currentIndex];

    // Safety check for empty questions array (should be handled by redirect, but prevents crash)
    if (!currentQuestion) return null;

    const selectedOption = answers[currentQuestion.id] || null;
    const isFlagged = flags.includes(currentQuestion.id);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handlePause = async () => {
        await pauseExam();
        navigate('/');
    };

    const handleFinish = async () => {
        if (window.confirm('Tem certeza que deseja finalizar o simulado? Você não poderá retomar depois.')) {
            setIsSubmitting(true);
            // IMPORTANT: Capture sessionId BEFORE calling endExam, which clears it
            const currentSessionId = sessionId;
            await endExam();
            // Navigate with session in URL so ExamResults can load it
            navigate(`/exam/results?session=${currentSessionId}`);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                        <Menu size={24} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulado</span>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">Questão {currentIndex + 1} de {questions.length}</span>
                    </div>
                </div>

                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePause}
                        className="flex items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Pausar e continuar depois"
                    >
                        <Pause size={18} />
                        <span className="hidden sm:inline text-sm font-medium">Pausar</span>
                    </button>
                    <button
                        onClick={handleFinish}
                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Finalizar
                    </button>
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        <ExamSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6">
                <QuestionDisplay
                    question={currentQuestion}
                    selectedOption={selectedOption}
                    onOptionSelect={(opt) => selectAnswer(currentQuestion.id, opt)}
                    showFeedback={false} // Exam mode: No feedback!
                    isAnswered={false} // Exam mode: Always interactive
                />
            </main>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between max-w-3xl mx-auto w-full">
                <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden sm:inline">Anterior</span>
                </button>

                <button
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${isFlagged
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <Flag size={20} className={isFlagged ? 'fill-yellow-600' : ''} />
                    <span className="hidden sm:inline">{isFlagged ? 'Marcada' : 'Marcar para Revisão'}</span>
                </button>

                <button
                    onClick={nextQuestion}
                    disabled={currentIndex === questions.length - 1}
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    <span className="hidden sm:inline">Próxima</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}
