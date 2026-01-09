import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../contexts/ExamContext';
import QuestionDisplay from '../components/QuestionDisplay';
import ExamSidebar from '../components/ExamSidebar';
import { ExamHeader } from '../components/ExamHeader';
import { ExamFooter } from '../components/ExamFooter';

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
    if (!currentQuestion) return null; // Should be handled by effect, but failsafe

    const selectedOption = answers[currentQuestion.id] || null;
    const isFlagged = flags.includes(currentQuestion.id);

    const handlePause = async () => {
        await pauseExam();
        navigate('/');
    };

    const handleFinish = async () => {
        if (window.confirm('Tem certeza que deseja finalizar o simulado? Você não poderá retomar depois.')) {
            setIsSubmitting(true);
            const currentSessionId = sessionId;
            await endExam();
            navigate(`/exam/results?session=${currentSessionId}`);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 pb-28 sm:pb-24">
            <ExamHeader
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                timeLeft={timeLeft}
                onPause={handlePause}
                onFinish={handleFinish}
                onOpenSidebar={() => setIsSidebarOpen(true)}
            />

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        <ExamSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-6 transition-all duration-300 ease-in-out">
                <QuestionDisplay
                    question={currentQuestion}
                    selectedOption={selectedOption}
                    onOptionSelect={(opt) => selectAnswer(currentQuestion.id, opt)}
                    showFeedback={false} // Exam mode: No feedback!
                    isAnswered={false} // Exam mode: Always interactive
                />
            </main>

            <ExamFooter
                onPrev={prevQuestion}
                onNext={nextQuestion}
                onToggleFlag={() => toggleFlag(currentQuestion.id)}
                isFlagged={isFlagged}
                isFirst={currentIndex === 0}
                isLast={currentIndex === questions.length - 1}
            />
        </div>
    );
}
