import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MessageSquare, Lightbulb, Settings, X, Clock } from 'lucide-react';
import { NotificationService } from '../services/notifications';
import type { Notification } from '../services/notifications';

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(true);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        const data = await NotificationService.getAll();
        setNotifications(data);
        setLoading(false);
    }

    async function handleMarkAllRead() {
        await NotificationService.markAllAsRead();
        loadNotifications();
    }

    async function handleNotificationClick(notification: Notification) {
        setSelectedNotification(notification);
        if (!notification.is_read) {
            await NotificationService.markAsRead(notification.id);
            // Non-blocking refresh
            NotificationService.getAll().then(setNotifications);
        }
    }

    // Group notifications by date
    const groupedNotifications = notifications
        .filter(n => filter === 'all' || !n.is_read)
        .reduce((groups, notification) => {
            const date = new Date(notification.created_at);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let label: string;
            if (date.toDateString() === today.toDateString()) {
                label = 'HOJE';
            } else if (date.toDateString() === yesterday.toDateString()) {
                label = 'ONTEM';
            } else {
                label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(notification);
            return groups;
        }, {} as Record<string, Notification[]>);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'help': return <MessageSquare className="w-5 h-5" />;
            case 'lightbulb': return <Lightbulb className="w-5 h-5" />;
            case 'settings': return <Settings className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getIconBgClass = (color: string) => {
        const colors: Record<string, string> = {
            teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
            amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
            gray: 'bg-slate-100 dark:bg-slate-700 text-slate-500',
        };
        return colors[color] || colors.teal;
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) return 'Agora';
        if (diffHours < 24) return `Há ${diffHours} horas`;
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col font-display">
            {/* Header */}
            <header className="px-4 pt-6 pb-4 bg-white dark:bg-slate-800 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Notificações</h1>
                    <button onClick={handleMarkAllRead} className="text-sm font-medium text-teal-600 hover:text-teal-700">
                        Ler todas
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'all'
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === 'unread'
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        Não lidas
                    </button>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 pb-24">
                {loading ? (
                    <div className="text-center text-slate-400 py-8">Carregando...</div>
                ) : Object.keys(groupedNotifications).length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        {filter === 'unread' ? 'Nenhuma notificação não lida!' : 'Nenhuma notificação ainda.'}
                    </div>
                ) : (
                    Object.entries(groupedNotifications).map(([label, items]) => (
                        <div key={label} className="mb-6">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{label}</h2>
                            <div className="space-y-3">
                                {items.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 cursor-pointer transition-all hover:shadow-md ${!notification.is_read ? 'ring-1 ring-teal-500/20' : ''
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getIconBgClass(notification.icon_bg_color)}`}>
                                                {getIcon(notification.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{notification.title}</h3>
                                                    {!notification.is_read && (
                                                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0 mt-1.5"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                                    {notification.content}
                                                </p>
                                                <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                                                    {formatTime(notification.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNotification(null)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getIconBgClass(selectedNotification.icon_bg_color)}`}>
                                    {getIcon(selectedNotification.icon)}
                                </div>
                                <button
                                    onClick={() => setSelectedNotification(null)}
                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                {selectedNotification.title}
                            </h2>

                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                                <Clock className="w-4 h-4" />
                                {new Date(selectedNotification.created_at).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-[16px]">
                                    {selectedNotification.content}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="w-full mt-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simple Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 pb-safe z-50">
                <div className="flex justify-around items-center h-16 px-4">
                    <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-[24px]">home</span>
                        <span className="text-[10px]">Início</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-[24px]">help</span>
                        <span className="text-[10px]">Questões</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-[24px]">bar_chart</span>
                        <span className="text-[10px]">Desempenho</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="material-symbols-outlined text-[24px]">person</span>
                        <span className="text-[10px]">Perfil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
