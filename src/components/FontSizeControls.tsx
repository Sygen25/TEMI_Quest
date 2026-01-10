import { Minus, Plus } from 'lucide-react';
import { useFontSize } from '../contexts/FontSizeContext';

export function FontSizeControls() {
    const { fontSize, increaseFont, decreaseFont } = useFontSize();

    return (
        <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
                onClick={decreaseFont}
                disabled={fontSize === 'sm'}
                className="px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-end"
                title="Diminuir fonte"
            >
                <span className="text-xs font-bold leading-none mb-0.5">A</span>
                <Minus size={10} strokeWidth={3} className="mb-1" />
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button
                onClick={increaseFont}
                disabled={fontSize === 'xl'}
                className="px-2.5 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-start"
                title="Aumentar fonte"
            >
                <span className="text-lg font-bold leading-none">A</span>
                <Plus size={10} strokeWidth={3} className="mt-0.5" />
            </button>
        </div>
    );
}
