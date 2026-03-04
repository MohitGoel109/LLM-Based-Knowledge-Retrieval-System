import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import KRMAILogo from './KRMAILogo';
import { FAQ_CARDS } from '../data/constants';

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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center pt-[15vh] md:pt-[20vh]"
                            >
                                <div className="mb-6">
                                    <KRMAILogo size={48} />
                                </div>

                                <h1 className="text-2xl md:text-3xl font-medium text-center text-white mb-10">
                                    What would you like to know?
                                </h1>

                                {/* Suggestion Chips */}
                                <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl px-4">
                                    {FAQ_CARDS.map((faq, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + i * 0.06 }}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => send(faq.text)}
                                            className="px-4 py-2.5 rounded-full text-[14px] font-medium transition-colors bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white hover:border-[rgba(255,255,255,0.2)] hover:bg-[var(--bg-surface)]"
                                        >
                                            {faq.text}
                                        </motion.button>
                                    ))}
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
                <div className="absolute bottom-0 inset-x-0 p-4 md:px-10 md:pb-6 pt-16 pointer-events-none z-30 bg-gradient-to-t from-[#0d0a08] via-[#0d0a08]/70 to-transparent">
                    <div className="max-w-4xl mx-auto w-full pointer-events-auto flex flex-col gap-2">
                        {/* Input */}
                        <div className="relative flex items-end gap-2 p-1.5 pl-5 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] transition-colors focus-within:border-[rgba(255,255,255,0.15)]">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask KRMAI anything..."
                                className="flex-1 max-h-[200px] min-h-[44px] py-3 bg-transparent resize-none outline-none text-[15px] font-medium leading-relaxed text-white placeholder:text-[var(--text-muted)]"
                                rows={1}
                            />
                            <button
                                onClick={() => send(input)}
                                disabled={!input.trim() || loading}
                                className={`p-2.5 rounded-full transition-all shrink-0 mb-0.5 ${!input.trim() || loading
                                    ? 'opacity-25 cursor-not-allowed bg-[var(--bg-surface)] text-[var(--text-muted)]'
                                    : 'bg-white text-[var(--bg-base)] hover:bg-gray-200'
                                    }`}
                            >
                                <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                        </div>

                        <p className="text-center text-[11px] mt-0.5 font-medium tracking-wide text-[var(--text-muted)]">
                            AI responses may not always be accurate. Please verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;
