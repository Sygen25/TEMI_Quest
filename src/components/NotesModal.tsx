import { useState, useEffect, useRef } from 'react';
import { X, Save, StickyNote } from 'lucide-react';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialNote: string;
    onSave: (note: string) => void;
}

export function NotesModal({ isOpen, onClose, initialNote, onSave }: NotesModalProps) {
    const [note, setNote] = useState(initialNote);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync with initial note when modal opens
    useEffect(() => {
        if (isOpen) {
            setNote(initialNote);
            // Focus textarea after a short delay for animation
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen, initialNote]);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(note);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal with glassmorphism */}
            <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <StickyNote size={20} className="text-amber-500" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Minhas Anotações
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <textarea
                        ref={textareaRef}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Escreva suas observações sobre esta questão..."
                        className="w-full h-40 p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        💡 Suas anotações ficam salvas e você pode acessá-las quando revisar esta questão novamente.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 py-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/30">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Salvar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
