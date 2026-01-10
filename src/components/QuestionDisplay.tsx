import { HelpCircle, Check, X, Info } from 'lucide-react';
import { parseBold } from '../utils/text';
import { useFontSize } from '../contexts/FontSizeContext';

interface Question {
    id: number;
    enunciado: string;
    imagem_url: string | null;
    alt_a: string;
    explicacao_a?: string;
    alt_b: string;
    explicacao_b?: string;
    alt_c: string;
    explicacao_c?: string;
    alt_d: string;
    explicacao_d?: string;
    resposta_correta: string;
    expansao_conhecimento?: string;
    topico: string;
}

interface QuestionDisplayProps {
    question: Question;
    selectedOption: string | null;
    onOptionSelect: (option: string) => void;
    showFeedback: boolean; // Controls whether colors/explanations are shown
    isAnswered: boolean; // Controls interaction state
}

export default function QuestionDisplay({
    question,
    selectedOption,
    onOptionSelect,
    showFeedback,
    isAnswered
}: QuestionDisplayProps) {
    const { fontSize } = useFontSize();

    // Map font sizes to Tailwind classes for different elements
    const textSize = {
        sm: { body: 'text-[15px]', option: 'text-[15px]', badge: 'text-sm' },
        base: { body: 'text-[18px]', option: 'text-[17px]', badge: 'text-base' },
        lg: { body: 'text-[20px]', option: 'text-[19px]', badge: 'text-lg' },
        xl: { body: 'text-[24px]', option: 'text-[22px]', badge: 'text-xl' },
    };

    const currentSize = textSize[fontSize];

    const getOptionStyle = (option: string) => {
        const baseStyle = "group relative flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300";

        // If generic feedback is hidden (Exam Mode), we might still want to show "Selected" state visually
        // but NOT "Correct/Incorrect" colors.

        if (!isAnswered) {
            return `${baseStyle} bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5`;
        }

        const isSelected = selectedOption === option;

        // EXAM MODE LOGIC: If feedback is hidden, just highlight selected
        if (!showFeedback) {
            if (isSelected) {
                return `${baseStyle} border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary`;
            }
            return `${baseStyle} bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60`;
        }

        // PRACTICE MODE LOGIC (Standard Feedback)
        const isCorrect = question.resposta_correta === option;
        if (isCorrect) {
            return `${baseStyle} border-green-500 bg-green-50 dark:bg-green-900/20 shadow-glow ring-1 ring-green-500`;
        }
        if (isSelected && !isCorrect) {
            return `${baseStyle} border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500`;
        }

        return `${baseStyle} bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60`;
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Enunciado */}
            <div className="mb-6 bg-white dark:bg-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
                <h1 className={`${currentSize.body} leading-relaxed font-medium text-slate-800 dark:text-slate-100 text-justify whitespace-pre-line tracking-wide`}>
                    {parseBold(question.enunciado) || question.enunciado}
                </h1>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                    <p className={`font-bold text-slate-900 dark:text-white flex items-center gap-2 ${currentSize.option}`}>
                        <HelpCircle className="text-primary w-6 h-6" />
                        Qual a alternativa correta?
                    </p>
                </div>
            </div>

            {question.imagem_url && question.imagem_url.trim().length > 10 && (
                <div className="mb-8 group relative w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
                    <img src={question.imagem_url} alt="Questão" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Options List */}
            <div className="flex flex-col gap-4">
                {['A', 'B', 'C', 'D'].map((opt) => {
                    const optLower = opt.toLowerCase() as 'a' | 'b' | 'c' | 'd';
                    const text = (question as any)[`alt_${optLower}`];
                    const explanation = (question as any)[`explicacao_${optLower}`];

                    if (!text) return null;

                    const isSelected = selectedOption === opt;
                    const isCorrect = question.resposta_correta === opt;

                    return (
                        <div key={opt} className="flex flex-col gap-2">
                            <label className={getOptionStyle(opt)} onClick={() => !isAnswered && onOptionSelect(opt)}>
                                <div className={`relative flex shrink-0 items-center justify-center w-12 h-12 rounded-2xl font-bold transition-all duration-300 
                                    ${currentSize.badge}
                                    ${
                                    // Dynamic Badge Color
                                    showFeedback && isAnswered && isCorrect ? 'bg-green-500 text-white' :
                                        showFeedback && isAnswered && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                                            !showFeedback && isSelected ? 'bg-primary text-white' : // Exam selected
                                                'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100'
                                    }`}>
                                    {opt}
                                </div>
                                <div className="flex-1 py-1">
                                    <p className={`${currentSize.option} font-medium text-slate-700 dark:text-slate-200 leading-relaxed`}>
                                        {parseBold(text) || text}
                                    </p>
                                </div>

                                {showFeedback && isAnswered && isCorrect && (
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}
                                {showFeedback && isAnswered && isSelected && !isCorrect && (
                                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                                        <X size={16} strokeWidth={3} />
                                    </div>
                                )}
                            </label>

                            {/* Inline Explanation Card (Only if showFeedback is true) */}
                            {showFeedback && isAnswered && explanation && (
                                <div className={`animate-in fade-in slide-in-from-top-2 duration-300 ml-4 mr-4 p-5 rounded-2xl leading-relaxed text-justify border ${currentSize.option}
                                    ${isCorrect
                                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800 text-slate-700 dark:text-slate-300'
                                        : 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    <span className={`font-bold mr-1 ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {isCorrect ? 'Correto:' : 'Incorreto:'}
                                    </span>
                                    {parseBold(explanation)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Expansão do Conhecimento (Only if showFeedback is true) */}
            {showFeedback && isAnswered && question.expansao_conhecimento && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Info size={100} />
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-300 font-bold uppercase text-xs tracking-widest z-10 relative">
                            <Info size={16} />
                            Expansão do Conhecimento
                        </div>
                        <p className={`text-slate-700 dark:text-slate-300 leading-relaxed z-10 relative text-justify whitespace-pre-line ${currentSize.body}`}>
                            {parseBold(question.expansao_conhecimento)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
