import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, GraduationCap } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import KRMAILogo from './KRMAILogo';
import { SUGGESTIONS, QUICK_ACTIONS, FAQ_CARDS } from '../data/constants';

function ChatInterface({
    apiUrl,
    onGoHome,
    messages,
    setMessages,
    sessions,
    activeSessionId,
    onNewSession,
    onLoadSession,
    onDeleteSession,
}) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, scrollToBottom]);

    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    };

    useEffect(() => {
        if (!input && inputRef.current) inputRef.current.style.height = 'auto';
    }, [input]);

    const send = async (text) => {
        if (!text.trim() || loading) return;
        const msg = text.trim();
        setInput('');

        const updated = [
            ...messages,
            { role: 'user', content: msg, timestamp: Date.now() },
        ];
        setMessages(updated);
        setLoading(true);

        try {
            const res = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, history: updated.slice(-6) }),
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.answer,
                    sources: data.sources || [],
                    timestamp: Date.now(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content:
                        "Couldn't reach the server right now. Please try again.",
                    isError: true,
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setLoading(false);
            if (!isMobile) setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobile={isMobile}
                onSend={send}
                onNewSession={onNewSession}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onLoadSession={onLoadSession}
                onDeleteSession={onDeleteSession}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-warm-gradient">
                {/* Header */}
                <ChatHeader
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    loading={loading}
                    onGoHome={onGoHome}
                />

                {/* Messages */}
                <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 pb-52">
                    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
                        {messages.length === 0 ? (
                            /* Welcome Empty State */
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="flex flex-col items-center justify-center pt-[3vh] md:pt-[6vh]"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: 'spring',
                                        bounce: 0.4,
                                        duration: 1,
                                    }}
                                    className="mb-5"
                                >
                                    <KRMAILogo size={80} animate />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="font-display text-4xl md:text-5xl text-center mb-3 text-white"
                                >
                                    Welcome to KRMAI
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg text-[var(--text-secondary)] text-center max-w-xl mb-10"
                                >
                                    Your AI guide to KR Mangalam University
                                </motion.p>

                                {/* FAQ Cards - Primary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl px-2 mb-8">
                                    {FAQ_CARDS.map((faq, i) => {
                                        const Icon = faq.icon;
                                        return (
                                            <motion.button
                                                key={i}
                                                initial={{
                                                    opacity: 0,
                                                    y: 20,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay: 0.45 + i * 0.1,
                                                    type: 'spring',
                                                    bounce: 0.3,
                                                }}
                                                whileHover={{
                                                    scale: 1.03,
                                                    y: -4,
                                                }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => send(faq.text)}
                                                className="group p-6 rounded-2xl text-left transition-all bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[rgba(255,77,0,0.4)] hover:shadow-[0_0_30px_rgba(255,77,0,0.08)]"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-[rgba(255,77,0,0.12)] flex items-center justify-center group-hover:bg-[rgba(255,77,0,0.22)] transition">
                                                        <Icon className="w-6 h-6 text-[#ff4d00]" />
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#ff4d00] transition-colors" />
                                                </div>
                                                <span className="text-[15px] font-semibold text-[var(--text-secondary)] group-hover:text-white transition-colors block mb-1.5">
                                                    {faq.text}
                                                </span>
                                                <span className="text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors leading-relaxed">
                                                    {faq.description}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Suggestion Cards - Secondary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl px-2">
                                    {SUGGESTIONS.map((s, i) => {
                                        const Icon = s.icon;
                                        return (
                                            <motion.button
                                                key={i}
                                                initial={{
                                                    opacity: 0,
                                                    y: 20,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay: 0.8 + i * 0.06,
                                                    type: 'spring',
                                                    bounce: 0.3,
                                                }}
                                                whileHover={{
                                                    scale: 1.03,
                                                    y: -3,
                                                }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => send(s.text)}
                                                className="group p-5 rounded-2xl text-left transition-all bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[rgba(255,77,0,0.3)]"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[rgba(255,77,0,0.1)] flex items-center justify-center group-hover:bg-[rgba(255,77,0,0.2)] transition">
                                                        <Icon className="w-5 h-5 text-[#ff4d00]" />
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#ff4d00] transition-colors" />
                                                </div>
                                                <span className="text-[14px] font-medium text-[var(--text-secondary)] group-hover:text-white transition-colors">
                                                    {s.text}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ) : (
                            /* Messages */
                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => (
                                    <MessageBubble
                                        key={idx}
                                        message={msg}
                                        index={idx}
                                    />
                                ))}
                            </AnimatePresence>
                        )}

                        {/* Typing Indicator */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 md:gap-5 w-full max-w-[85%]"
                            >
                                <div className="shrink-0 mt-2 hidden sm:block">
                                    <KRMAILogo size={44} animate />
                                </div>
                                <div className="rounded-3xl rounded-tl-sm px-7 py-4 bot-bubble flex items-center gap-3">
                                    <motion.span
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{
                                            duration: 1.4,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="inline-block w-2 h-2 rounded-full bg-[#ff4d00]"
                                    />
                                    <span className="text-[14px] font-medium text-[var(--text-secondary)]">
                                        KRMAI is thinking...
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        <div ref={bottomRef} className="h-8" />
                    </div>
                </main>

                {/* Bottom Input Area */}
                <div className="absolute bottom-0 inset-x-0 p-5 md:px-10 md:pb-6 pt-24 pointer-events-none z-30 bg-gradient-to-t from-[#0d0a08] via-[#0d0a08]/80 to-transparent">
                    <div className="max-w-4xl mx-auto w-full pointer-events-auto flex flex-col gap-2.5">
                        {/* Quick Actions */}
                        <AnimatePresence>
                            {messages.length === 0 && !loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                                    className="flex items-center gap-2.5 overflow-x-auto pb-1.5"
                                >
                                    {QUICK_ACTIONS.map((action, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.03, y: -1 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => send(action)}
                                            className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white hover:border-[rgba(255,77,0,0.2)]"
                                        >
                                            {action}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <motion.div
                            layout
                            className="relative flex items-end gap-3 p-2.5 rounded-2xl input-glow bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
                        >
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask KRMAI anything..."
                                className="flex-1 max-h-[200px] min-h-[52px] py-4 px-5 bg-transparent resize-none outline-none text-[16px] font-medium leading-relaxed text-white placeholder:text-[var(--text-muted)]"
                                rows={1}
                            />
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => send(input)}
                                disabled={!input.trim() || loading}
                                className={`p-4 rounded-xl transition-all shrink-0 mb-0.5 mr-0.5 ${!input.trim() || loading
                                        ? 'opacity-30 cursor-not-allowed bg-[var(--bg-surface)] text-[var(--text-muted)]'
                                        : 'bg-[#ff4d00] text-white shadow-[0_0_20px_rgba(255,77,0,0.3)] hover:shadow-[0_0_30px_rgba(255,77,0,0.5)]'
                                    }`}
                            >
                                <Send className="w-5 h-5" strokeWidth={2} />
                            </motion.button>
                        </motion.div>

                        <p className="text-center text-[11px] mt-1 font-medium tracking-wide text-[var(--text-muted)]">
                            AI responses may not always be accurate. Please verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;
