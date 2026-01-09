import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User, Mail, Save, Shield } from 'lucide-react';
import { ProfileService } from '../services/profile';
import { NotificationService } from '../services/notifications';
import { useUser } from '../contexts/UserContext';

export default function Settings() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { refreshUser, user } = useUser();

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // UI state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const data = await ProfileService.getProfile();
        setDisplayName(data.display_name);
        setAvatarUrl(data.avatar_url || '');

        const admin = await NotificationService.isAdmin();
        setIsAdmin(admin);

        setLoading(false);
    }

    async function handleSave() {
        setSaving(true);
        const success = await ProfileService.updateProfile({
            display_name: displayName
        });

        if (success) {
            await refreshUser();
            setSaving(false);
            alert('Perfil atualizado com sucesso!');
        } else {
            setSaving(false);
            alert('Erro ao salvar. Tente novamente.');
        }
    }

    async function handleAvatarClick() {
        fileInputRef.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem.');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 2MB.');
            return;
        }

        setUploading(true);
        const newUrl = await ProfileService.uploadAvatar(file);
        setUploading(false);

        if (newUrl) {
            setAvatarUrl(newUrl);
            await refreshUser();
        } else {
            alert('Erro ao fazer upload. Tente novamente.');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex items-center justify-center">
                <p className="text-slate-500">Carregando...</p>
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
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Configurações</h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 pb-24 space-y-6">
                {/* Avatar Section */}
                <section className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div
                            onClick={handleAvatarClick}
                            className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-teal-400 to-emerald-400 cursor-pointer group"
                        >
                            <img
                                src={avatarUrl}
                                alt="Foto de perfil"
                                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-800"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <p className="text-sm text-slate-400">Toque para alterar a foto</p>
                </section>

                {/* Form */}
                <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-soft space-y-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <User className="w-4 h-4" />
                            Nome de exibição
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Ex: Dr. João Silva"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 font-bold opacity-50">
                            <Mail className="w-4 h-4" />
                            E-mail (Não pode ser alterado)
                        </label>
                        <div className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                            {(user?.email) || 'Não informado'}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </section>

                {/* Admin Link */}
                {isAdmin && (
                    <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-soft">
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full flex items-center justify-between text-slate-700 dark:text-slate-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold">Painel Admin</h3>
                                    <p className="text-xs text-slate-400">Gerenciar notificações</p>
                                </div>
                            </div>
                            <ArrowLeft className="w-5 h-5 rotate-180 text-slate-400" />
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
}
