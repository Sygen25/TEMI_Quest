import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Shield, Bell, MessageSquare, Lightbulb, Settings } from 'lucide-react';
import { NotificationService } from '../services/notifications';
import type { Notification } from '../services/notifications';

const ICON_OPTIONS = [
    { value: 'notifications', label: 'Sino', icon: Bell },
    { value: 'help', label: 'Questão', icon: MessageSquare },
    { value: 'lightbulb', label: 'Dica', icon: Lightbulb },
    { value: 'settings', label: 'Sistema', icon: Settings },
];

const COLOR_OPTIONS = [
    { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
    { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
    { value: 'amber', label: 'Amarelo', class: 'bg-amber-500' },
    { value: 'purple', label: 'Roxo', class: 'bg-purple-500' },
    { value: 'gray', label: 'Cinza', class: 'bg-slate-500' },
];

export default function AdminPanel() {
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [icon, setIcon] = useState('notifications');
    const [iconColor, setIconColor] = useState('teal');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    async function checkAdmin() {
        const admin = await NotificationService.isAdmin();
        setIsAdmin(admin);
        if (admin) {
            loadNotifications();
        }
        setLoading(false);
    }

    async function loadNotifications() {
        const data = await NotificationService.getAll();
        setNotifications(data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSubmitting(true);
        const success = await NotificationService.createNotification(title, content, icon, iconColor);
        setSubmitting(false);

        if (success) {
            setTitle('');
            setContent('');
            setIcon('notifications');
            setIconColor('teal');
            loadNotifications();
        }
    }

    async function handleDelete(id: number) {
        if (confirm('Tem certeza que deseja excluir esta notificação?')) {
            await NotificationService.deleteNotification(id);
            loadNotifications();
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center">
                <p className="text-slate-500">Verificando permissões...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acesso Negado</h1>
                <p className="text-slate-500 mb-6">Você não tem permissão para acessar esta área.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold"
                >
                    Voltar ao Início
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col font-display">
            {/* Header */}
            <header className="px-4 pt-6 pb-4 bg-white dark:bg-slate-800 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-teal-500" />
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Painel Admin</h1>
                        </div>
                        <p className="text-xs text-slate-500">Gerenciar Notificações</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 pb-24 space-y-6">
                {/* Create Notification Form */}
                <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-soft">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-teal-500" />
                        Nova Notificação
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Simulado Semanal #42"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conteúdo</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Descreva a notificação..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ícone</label>
                                <div className="flex gap-2">
                                    {ICON_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setIcon(opt.value)}
                                            className={`p-2 rounded-xl transition-all ${icon === opt.value
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                                }`}
                                        >
                                            <opt.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor</label>
                                <div className="flex gap-2">
                                    {COLOR_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setIconColor(opt.value)}
                                            className={`w-8 h-8 rounded-full transition-all ${opt.class} ${iconColor === opt.value
                                                ? 'ring-2 ring-offset-2 ring-teal-500'
                                                : ''
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !title.trim() || !content.trim()}
                            className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all"
                        >
                            {submitting ? 'Enviando...' : 'Publicar Notificação'}
                        </button>
                    </form>
                </section>

                {/* Existing Notifications */}
                <section>
                    <h2 className="font-bold text-slate-900 dark:text-white mb-4">Notificações Publicadas ({notifications.length})</h2>

                    {notifications.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">Nenhuma notificação ainda.</p>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 flex items-start gap-4"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white">{notification.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">{notification.content}</p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            {new Date(notification.created_at).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
