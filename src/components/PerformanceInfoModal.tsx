import { X, Sparkles, ShieldCheck, Database } from 'lucide-react';

interface PerformanceInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PerformanceInfoModal({ isOpen, onClose }: PerformanceInfoModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-surface-dark rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-slide-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 pb-4 flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Gestão de Performance</h2>
                            <p className="text-xs text-primary font-bold uppercase tracking-wider">Powered by TE.MI AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="border-l-4 border-primary pl-4 py-1">
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            Este não é um chat genérico.
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            O sistema analisa suas métricas reais de estudo antes de cada resposta.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <Database className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Baseado em Dados</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    A IA do TEMI Quest lê inúmeros dados e métricas do seu desempenho, entre elas histórico de questões, tempo de resposta e taxas de erro por tópico para dar conselhos táticos.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <ShieldCheck className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Privacidade Garantida</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Seus dados são processados de forma anônima apenas para gerar a estratégia de estudo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                        Entendi, vamos começar
                    </button>
                </div>
            </div>
        </div>
    );
}
