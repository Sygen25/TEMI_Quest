import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, User, Info, MoreHorizontal } from 'lucide-react';
import { AIPerformanceService } from '../services/aiPerformance';
import type { AIMessage } from '../services/aiPerformance';
import { AIContextBanner } from '../components/AIContextBanner';
import { PerformanceInfoModal } from '../components/PerformanceInfoModal';
import { BottomNavigation } from '../components/BottomNavigation';
import ReactMarkdown from 'react-markdown';

export default function PerformancePage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startSession();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    async function startSession() {
        setIsAnalyzing(true);
        try {
            const initialMessage = await AIPerformanceService.analyzeDataAndStartChat();
            setMessages([initialMessage]);
        } catch (error) {
            console.error('Failed to start AI session', error);
        } finally {
            setIsAnalyzing(false);
        }
    }

    async function handleSendMessage() {
        if (!inputValue.trim()) return;

        const userMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await AIPerformanceService.sendMessage(inputValue);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setIsTyping(false);
        }
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300 flex flex-col">
            {/* Header */}
            <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800/50">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                Gestão de Performance
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-transparent bg-clip-text text-[10px] uppercase border border-amber-500/20 px-1.5 py-0.5 rounded-full">Beta</span>
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Powered by TE.MI AI
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Context Banner */}
            <div className="sticky top-16 z-40 max-w-2xl mx-auto w-full">
                <AIContextBanner isAnalyzing={isAnalyzing} analyzedTopics={['Hemodinâmica', 'Neurointensivismo']} />
            </div>

            {/* Chat Area */}
            <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-500/20'
                            }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                        </div>



                        {/* Bubble */}
                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-primary text-white rounded-tr-sm'
                            : 'bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                            }`}>

                            <ReactMarkdown
                                components={{
                                    strong: ({ node, ...props }) => <span className="font-bold text-slate-900 dark:text-white" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>

                            <div className={`text-[10px] mt-1 opacity-50 font-medium flex justify-end ${msg.role === 'user' ? 'text-teal-200' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shrink-0">
                            <MoreHorizontal className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="bg-white dark:bg-surface-dark border border-slate-100 dark:border-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 text-slate-400">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="fixed bottom-[72px] left-0 w-full bg-white/90 dark:bg-surface-dark/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 p-3 z-40">
                <div className="max-w-2xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Pergunte sobre sua estratégia..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                        disabled={isAnalyzing || isTyping}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isAnalyzing || isTyping}
                        className="w-12 rounded-xl bg-primary hover:bg-teal-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <PerformanceInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
            <BottomNavigation />
        </div>
    );
}
