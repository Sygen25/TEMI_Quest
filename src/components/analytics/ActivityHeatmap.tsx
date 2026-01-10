import React, { useMemo, useState } from 'react';

interface ActivityDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

interface ActivityHeatmapProps {
    data: ActivityDay[];
    endDate?: Date;
    daysToShow?: number;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
    data,
    endDate = new Date(),
    daysToShow = 30
}) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Generate flat list of days
    const days = useMemo(() => {
        const list: { date: Date; dateStr: string; level: number; count: number }[] = [];
        const dataMap = new Map(data.map(d => [d.date, { count: d.count, level: d.level }]));

        const current = new Date(endDate);

        // We want to show exactly 'daysToShow' days, ending today.
        // We will render them in order from oldest to newest (left to right, top to bottom)

        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date(current);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const activity = dataMap.get(dateStr);

            list.push({
                date: d,
                dateStr,
                level: activity?.level || 0,
                count: activity?.count || 0
            });
        }
        return list;
    }, [data, endDate, daysToShow]);

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-slate-100 dark:bg-slate-800/50';
            case 1: return 'bg-teal-200 dark:bg-teal-900/40';
            case 2: return 'bg-teal-300 dark:bg-teal-700/60';
            case 3: return 'bg-teal-400 dark:bg-teal-600/80';
            case 4: return 'bg-teal-500 dark:bg-teal-500';
            default: return 'bg-slate-100 dark:bg-slate-800/50';
        }
    };

    const selectedInfo = useMemo(() => {
        if (!selectedDate) return null;
        return days.find(d => d.dateStr === selectedDate);
    }, [selectedDate, days]);

    return (
        <div className="w-full">
            {/* Grid Layout: Row Major (Horizontal flow) */}
            {/* Using flex-wrap for a responsive natural flow, or grid-cols-7 for calendar feel. 
                User asked for "11 12 13... next line", which implies a constrained width grid.
                Let's use a 6 or 7 column grid to keep it compact and calendar-like. 
            */}
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 mb-4">
                {days.map((day) => (
                    <button
                        key={day.dateStr}
                        onClick={() => setSelectedDate(day.dateStr === selectedDate ? null : day.dateStr)}
                        className={`
                            aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all
                            ${getLevelColor(day.level)}
                            ${day.dateStr === selectedDate ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 z-10' : 'hover:scale-105 active:scale-95'}
                            ${day.level > 2 ? 'text-white/90' : 'text-slate-400/80 dark:text-slate-500'}
                        `}
                    >
                        {day.date.getDate()}
                    </button>
                ))}
            </div>

            {/* Selected Info / Legend Area */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between min-h-[3rem]">
                {selectedInfo ? (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className={`w-3 h-3 rounded-full ${getLevelColor(selectedInfo.level)}`}></div>
                        <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {selectedInfo.date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {selectedInfo.count} {selectedInfo.count === 1 ? 'questão' : 'questões'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-[10px] text-slate-400 italic">Toque em um dia para ver detalhes</p>
                )}

                {/* Mini Legend */}
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-sm bg-slate-200 dark:bg-slate-700"></div>
                    <div className="w-2 h-2 rounded-sm bg-teal-500"></div>
                </div>
            </div>
        </div>
    );
};
