import { HelpCircle, Check, X, Info } from 'lucide-react';

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

    const parseBold = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

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
        <div className="w-full max-w-lg mx-auto">
            {/* Enunciado */}
            <div className="mb-6 bg-white dark:bg-slate-800/40 rounded-2xl p-5 shadow-soft border border-slate-100 dark:border-slate-700/50">
                <h1 className="text-[18px] leading-[1.6] font-medium text-slate-700 dark:text-slate-200 text-justify whitespace-pre-line">
                    {parseBold(question.enunciado) || question.enunciado}
                </h1>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <p className="text-[17px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
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
            <div className="flex flex-col gap-5">
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
                                <div className={`relative flex shrink-0 items-center justify-center w-10 h-10 rounded-xl font-bold text-base transition-all duration-300 
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
                                    <p className="text-[16px] font-medium text-slate-600 dark:text-slate-300">
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
                                <div className={`animate-in fade-in slide-in-from-top-2 duration-300 ml-2 mr-2 p-4 rounded-xl text-sm leading-relaxed text-justify border
                                    ${isCorrect
                                        ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800 text-slate-700 dark:text-slate-300'
                                        : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800 text-slate-700 dark:text-slate-300'
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
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Info size={100} />
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300 font-bold uppercase text-xs tracking-widest z-10 relative">
                            <Info size={16} />
                            Expansão do Conhecimento
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px] z-10 relative text-justify whitespace-pre-line">
                            {parseBold(question.expansao_conhecimento)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
