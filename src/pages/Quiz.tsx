import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import QuestionDisplay from '../components/QuestionDisplay';
import { QuizHeader } from '../components/QuizHeader';
import { QuizFooter } from '../components/QuizFooter';
import { NotesModal } from '../components/NotesModal';
import type { Question } from '../hooks/useQuiz';

export default function Quiz() {
    const { topic } = useParams<{ topic: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for review mode data in navigation state
    const stateQuestion = location.state?.question as Question | undefined;
    const stateSelectedOption = location.state?.selectedOption as string | undefined;
    const isReviewMode = !!stateQuestion;

    const [isNotesOpen, setIsNotesOpen] = useState(false);

    const {
        question,
        loading,
        error,
        selectedOption,
        isAnswered,
        handleNext,
        handlePrevious,
        submitAnswer,
        currentSessionIndex,
        hasPrevious,
        filter,
        setFilter,
        toggleFlag,
        isFlagged,
        totalQuestions,
        note,
        saveNote
    } = useQuiz({
        topic,
        initialQuestion: stateQuestion,
        initialSelectedOption: stateSelectedOption
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500 bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-2">
                    <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
                    <span className="text-sm font-medium">Carregando questão...</span>
                </div>
            </div>
        );
    }

    if (error || !question) {
        // Safe access to topic even if question is null
        const displayTopic = question?.topico || topic || 'Quiz';
        const isFilterEmptyError = error?.includes('filtro') || error?.includes('respondeu todas'); // Heuristic based on useQuiz error messages

        if (isFilterEmptyError) {
            return (
                <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-50">
                    <QuizHeader
                        topic={displayTopic}
                        currentIndex={currentSessionIndex >= 0 ? currentSessionIndex : 0}
                        totalQuestions={totalQuestions}
                        onBack={() => navigate(-1)}
                        filter={filter}
                        setFilter={setFilter}
                        hasNote={!!note}
                        onOpenNotes={() => setIsNotesOpen(true)}
                    />

                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-3xl">🔍</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Ops! Nada por aqui.</h3>
                        <p className="mb-6 text-slate-500 max-w-sm">{error || 'Tente ajustar os filtros para encontrar mais questões.'}</p>

                        <button
                            onClick={() => setFilter(['not_answered'])}
                            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            Limpar Filtros e Tentar Novamente
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
                <p className="mb-4 text-lg font-medium">{error || 'Não encontramos questões para este tópico.'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg"
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-50 pb-32">
            <QuizHeader
                topic={question.topico}
                currentIndex={currentSessionIndex}
                totalQuestions={totalQuestions}
                onBack={() => navigate(-1)}
                filter={filter}
                setFilter={setFilter}
                hasNote={!!note}
                onOpenNotes={() => setIsNotesOpen(true)}
            />

            {/* Progress Bar (Static for now in Quiz mode) */}
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-primary rounded-r-full" style={{ width: '30%' }}></div>
            </div>

            <main className="flex-1 px-5 py-6 w-full max-w-lg mx-auto">
                <QuestionDisplay
                    question={question}
                    selectedOption={selectedOption}
                    onOptionSelect={(opt) => submitAnswer(opt)}
                    showFeedback={true}
                    isAnswered={isAnswered}
                />
            </main>

            <QuizFooter
                isReviewMode={isReviewMode}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasPrevious={hasPrevious}
                onBack={() => navigate(-1)}
                isAnswered={isAnswered}
                onToggleFlag={toggleFlag}
                isFlagged={isFlagged}
            />

            <NotesModal
                isOpen={isNotesOpen}
                onClose={() => setIsNotesOpen(false)}
                initialNote={note}
                onSave={saveNote}
            />
        </div>
    );
}

