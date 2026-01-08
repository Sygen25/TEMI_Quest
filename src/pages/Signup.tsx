import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';

export default function SignUp() {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: displayName,
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                alert('Conta criada com sucesso! Verifique seu e-mail (se ativado) ou faça login.');
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-center px-6 py-12 transition-colors duration-300">
            {/* Background ambient light effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                        <UserPlus className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        Criar <span className="text-primary">Conta</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Junte-se ao TEMI Quest hoje</p>
                </div>

                <div className="bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl rounded-3xl p-8 shadow-soft border border-white/20 dark:border-slate-800">
                    <form onSubmit={handleSignUp} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Doutor(a) Nome"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">E-mail Profissional</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@medico.com"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Senha de Acesso</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Criar Conta
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Já possui uma conta?{' '}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
