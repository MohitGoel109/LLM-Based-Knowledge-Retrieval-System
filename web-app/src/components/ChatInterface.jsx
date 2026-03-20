import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Mic, MicOff, Globe } from 'lucide-react';

/* Text-based rotating thinking animation component */
function ThinkingLoader() {
    const emojis = [':)', '^^', 'O_o', '-_-', 'o_O', '^_^', '>_<', 'o.o'];
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setPhase((p) => (p + 1) % emojis.length), 400);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            className="flex gap-4 md:gap-5 w-full max-w-[85%]"
        >
            <div className="shrink-0 mt-2 hidden sm:block">
                <KRMAILogo size={44} animate />
            </div>
            <div className="rounded-3xl rounded-tl-sm px-7 py-4 bot-bubble flex items-center justify-center min-w-[100px] h-[58px]">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={phase}
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="text-[18px] font-mono font-bold text-[var(--accent)] tracking-widest"
                    >
                        {emojis[phase]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

import Sidebar from './Sidebar';
import HistorySidebar from './HistorySidebar';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import KRMAILogo from './KRMAILogo';
import { FAQ_CARDS } from '../data/constants';

const VOICE_LANG_MAP = { EN: 'en-IN', HI: 'hi-IN', AUTO: 'en-IN' };
const VOICE_LANG_LABELS = { EN: 'English', HI: 'Hindi', AUTO: 'Auto Detect' };
const VOICE_LANG_ORDER = ['EN', 'HI', 'AUTO'];

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
    onClearAll,
    onNavigate,
    voiceLang: externalVoiceLang,
    setVoiceLang: externalSetVoiceLang,
}) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sendPop, setSendPop] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const sendBtnRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const recognitionRef = useRef(null);
    const mainRef = useRef(null);
    const [prevMsgCount, setPrevMsgCount] = useState(0);
    const voiceLang = externalVoiceLang || 'EN';
    const setVoiceLang = externalSetVoiceLang || (() => {});
    const [interimText, setInterimText] = useState('');
    const [voiceJustCaptured, setVoiceJustCaptured] = useState(false);
    const baseTextRef = useRef('');

    const cycleVoiceLang = useCallback(() => {
        if (isListening) return;
        setVoiceLang((prev) => VOICE_LANG_ORDER[(VOICE_LANG_ORDER.indexOf(prev) + 1) % VOICE_LANG_ORDER.length]);
    }, [isListening, setVoiceLang]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Detect scroll position to show/hide scroll-to-bottom button
    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const onScroll = () => {
            const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
            setShowScrollBtn(distFromBottom > 200);
        };
        el.addEventListener('scroll', onScroll);
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, scrollToBottom]);

    // Track message count for ripple effect
    useEffect(() => {
        setPrevMsgCount(messages.length);
    }, [messages.length]);

    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            if (input) {
                inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
            }
        }
    }, [input]);

    const send = async (text) => {
        if (!text.trim() || loading) return;
        const msg = text.trim();
        setInput('');

        // Stop voice recording if active
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            setIsListening(false);
            setInterimText('');
        }

        // Trigger send pop animation
        setSendPop(true);
        setTimeout(() => setSendPop(false), 500);

        const updated = [
            ...messages,
            { role: 'user', content: msg, timestamp: Date.now() },
        ];
        setMessages(updated);
        setLoading(true);

        // Helper: strip <think> blocks (even if unclosed) that Qwen3 may produce
        const stripThink = (s) => s.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();

        // Helper: fallback to regular /chat endpoint
        const fallbackChat = async () => {
            const res = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, history: updated.slice(-4) }),
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            const cleanAnswer = stripThink(data.answer || '');
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: cleanAnswer || "I received an empty response. Please try again.",
                    sources: data.sources || [],
                    timestamp: Date.now(),
                },
            ]);
        };

        try {
            let streamWorked = false;
            try {
                const res = await fetch(`${apiUrl}/chat/stream`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg, history: updated.slice(-4) }),
                });

                if (!res.ok || !res.body) throw new Error('Stream unavailable');

                // DON'T add bot message yet — keep ThinkingLoader visible
                // We'll add it when the first visible token arrives

                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let accumulated = '';
                let buffer = '';
                let botMessageAdded = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const parsed = JSON.parse(line.slice(6));
                            if (parsed.type === 'token') {
                                accumulated += parsed.content;
                                const cleaned = stripThink(accumulated);

                                // Only show the bubble once we have visible content
                                if (cleaned && !botMessageAdded) {
                                    botMessageAdded = true;
                                    setLoading(false); // Hide thinking indicator
                                    setMessages((prev) => [...prev, {
                                        role: 'assistant',
                                        content: cleaned,
                                        sources: [],
                                        timestamp: Date.now(),
                                    }]);
                                } else if (cleaned && botMessageAdded) {
                                    setMessages((prev) => {
                                        const copy = [...prev];
                                        const last = copy.length - 1;
                                        if (last >= 0 && copy[last].role === 'assistant') {
                                            copy[last] = { ...copy[last], content: cleaned };
                                        }
                                        return copy;
                                    });
                                }
                            } else if (parsed.type === 'done') {
                                if (botMessageAdded) {
                                    setMessages((prev) => {
                                        const copy = [...prev];
                                        const last = copy.length - 1;
                                        if (last >= 0 && copy[last].role === 'assistant') {
                                            copy[last] = { ...copy[last], sources: parsed.sources || [] };
                                        }
                                        return copy;
                                    });
                                }
                            }
                        } catch { /* skip malformed SSE lines */ }
                    }
                }

                // If stream produced no visible content, fall back
                if (!botMessageAdded) {
                    throw new Error('Empty stream');
                }

                streamWorked = true;
            } catch {
                if (!streamWorked) {
                    setLoading(true);
                    await fallbackChat();
                }
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "Couldn't reach the server right now. Please try again.",
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

    /* ─── Voice Input (Web Speech API) — FIXED append bug ─── */
    const toggleListening = useCallback(() => {
        if (isListening) {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch {}
                recognitionRef.current = null;
            }
            setIsListening(false);
            setInterimText('');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        // Stop any existing recognition session first
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
            recognitionRef.current = null;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = VOICE_LANG_MAP[voiceLang];
        recognition.continuous = true;
        recognition.interimResults = true;

        // Save the current input text as the base — voice will append to this
        baseTextRef.current = inputRef.current?.value || '';

        // Track accumulated final transcript from this session
        let accumulatedFinal = '';

        recognition.onresult = (event) => {
            let newFinal = '';
            let interim = '';

            // KEY FIX: Only process results from event.resultIndex onwards
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    newFinal += transcript;
                } else {
                    interim += transcript;
                }
            }

            if (newFinal) {
                accumulatedFinal += newFinal;
                const base = baseTextRef.current;
                const separator = base && !base.endsWith(' ') ? ' ' : '';
                const fullText = base + separator + accumulatedFinal;
                setInput(fullText);
                setVoiceJustCaptured(true);
                setTimeout(() => setVoiceJustCaptured(false), 800);
            }
            setInterimText(interim);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                alert('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
            } else if (event.error === 'network') {
                alert('Speech recognition requires an internet connection (Google Speech API). Please check your connection.');
            } else if (event.error !== 'aborted') {
                alert(`Voice input error: ${event.error}. Please try again.`);
            }
            setIsListening(false);
            setInterimText('');
            recognitionRef.current = null;
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimText('');
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
            setIsListening(true);
        } catch (e) {
            console.error('Failed to start speech recognition:', e);
            alert('Could not start voice input. Please check microphone permissions in your browser.');
            recognitionRef.current = null;
            setIsListening(false);
        }
    }, [isListening, voiceLang, setVoiceLang]);

    // Cleanup speech recognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    /* Whether the input has text (for typing glow) */
    const hasText = input.trim().length > 0;

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
                onNavigate={onNavigate}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-warm-gradient">
                {/* Header */}
                <ChatHeader
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    loading={loading}
                    onGoHome={onGoHome}
                    messages={messages}
                />

                {/* Messages */}
                <main ref={mainRef} className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 pb-40" style={{ scrollBehavior: 'smooth' }}>
                    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
                        {messages.length === 0 ? (
                            /* Welcome Empty State */
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center pt-[15vh] md:pt-[20vh]"
                            >
                                <motion.div
                                    className="mb-6"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                                >
                                    <KRMAILogo size={48} />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.5 }}
                                    className="text-2xl md:text-3xl font-medium text-center text-[var(--text-heading)] mb-10"
                                >
                                    What would you like to know?
                                </motion.h1>

                                {/* Suggestion Chips — enhanced wave stagger */}
                                <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl px-4">
                                    {FAQ_CARDS.map((faq, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, y: 30, scale: 0.85, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            transition={{
                                                delay: 0.35 + i * 0.12,
                                                type: 'spring',
                                                stiffness: 180,
                                                damping: 14,
                                                mass: 0.8,
                                                filter: { duration: 0.3, delay: 0.35 + i * 0.12 },
                                            }}
                                            whileHover={{
                                                scale: 1.06,
                                                y: -3,
                                                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                                                borderColor: 'rgba(59, 130, 246, 0.3)',
                                            }}
                                            whileTap={{ scale: 0.93 }}
                                            onClick={() => send(faq.text)}
                                            className="px-4 py-2.5 rounded-full text-[14px] font-medium transition-colors bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[var(--bg-surface)]"
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
                                        isNew={idx >= prevMsgCount}
                                    />
                                ))}
                            </AnimatePresence>
                        )}

                        {/* Thinking Indicator — smiley to dots loop */}
                        {loading && <ThinkingLoader />}

                        <div ref={bottomRef} className="h-8" />
                    </div>

                    {/* Scroll-to-bottom FAB */}
                    <AnimatePresence>
                        {showScrollBtn && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ type: 'spring', bounce: 0.4 }}
                                onClick={scrollToBottom}
                                className="scroll-fab fixed bottom-36 right-8 z-40 p-3 rounded-full bg-[var(--accent)] text-white shadow-lg hover:bg-[var(--accent-hover)]"
                                title="Scroll to bottom"
                            >
                                <ArrowDown className="w-5 h-5" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </main>

                {/* Bottom Input Area */}
                <div className="absolute bottom-0 inset-x-0 p-4 md:px-10 md:pb-6 pt-16 pointer-events-none z-30 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/80 to-transparent">
                    <div className="max-w-4xl mx-auto w-full pointer-events-auto flex flex-col gap-2">
                        {/* Interim Voice Transcript Preview */}
                        <AnimatePresence>
                            {isListening && interimText && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="mx-4 mb-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--accent)]/25 text-[14px] text-[var(--text-secondary)] italic"
                                >
                                    <span className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mr-2 not-italic">Hearing:</span>
                                    <motion.span
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                    >
                                        {interimText}
                                    </motion.span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className={`relative flex items-end gap-2 p-1.5 pl-5 rounded-3xl macos-glass border border-[var(--border-subtle)] shadow-[0_4px_24px_rgba(0,0,0,0.5)] focus-within:border-[var(--accent)]/50 focus-within:shadow-[0_4px_24px_rgba(59,130,246,0.15)] transition-all ${voiceJustCaptured ? 'ring-2 ring-[var(--accent)]' : ''}`}>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask KRMAI anything..."
                                className="flex-1 max-h-[200px] min-h-[44px] py-3 bg-transparent resize-none outline-none text-[15px] font-medium leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] mt-1"
                                rows={1}
                            />

                            {/* Language Toggle */}
                            <button
                                onClick={cycleVoiceLang}
                                disabled={isListening}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 mb-1 transition-all ${isListening
                                    ? 'opacity-40 cursor-not-allowed text-[var(--text-muted)]'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)]'
                                    }`}
                                title={`Voice language: ${VOICE_LANG_LABELS[voiceLang]}. Click to change.`}
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span>{voiceLang}</span>
                            </button>

                            {/* Mic Button with Pulsing Rings */}
                            <div className="relative shrink-0 mb-0.5 flex items-center justify-center">
                                <AnimatePresence>
                                    {isListening && (
                                        <>
                                            <motion.div
                                                key="ring1"
                                                className="absolute inset-0 rounded-full border-2 border-[var(--accent)]"
                                                initial={{ scale: 1, opacity: 0.5 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                                            />
                                            <motion.div
                                                key="ring2"
                                                className="absolute inset-0 rounded-full border-2 border-[var(--accent)]"
                                                initial={{ scale: 1, opacity: 0.4 }}
                                                animate={{ scale: 2.5, opacity: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                                            />
                                            <motion.div
                                                key="ring3"
                                                className="absolute inset-0 rounded-full border border-[var(--accent)]/60"
                                                initial={{ scale: 1, opacity: 0.3 }}
                                                animate={{ scale: 3, opacity: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                                            />
                                        </>
                                    )}
                                </AnimatePresence>
                                <motion.button
                                    onClick={toggleListening}
                                    whileTap={{ scale: 0.85 }}
                                    className={`relative z-10 p-2.5 rounded-full transition-all ${isListening
                                        ? 'bg-[var(--accent)] text-white shadow-[0_0_20px_var(--accent-glow)]'
                                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent)]/20'
                                        }`}
                                    title={isListening ? 'Stop recording' : `Voice input (${VOICE_LANG_LABELS[voiceLang]})`}
                                >
                                    {isListening
                                        ? <MicOff className="w-5 h-5" strokeWidth={2.5} />
                                        : <Mic className="w-5 h-5" strokeWidth={2.5} />
                                    }
                                </motion.button>
                            </div>

                            <motion.button
                                ref={sendBtnRef}
                                onClick={() => send(input)}
                                whileTap={{ scale: 0.9 }}
                                disabled={!input.trim() || loading}
                                className={`p-2.5 rounded-full transition-all shrink-0 mb-0.5 ${!input.trim() || loading
                                    ? 'opacity-25 cursor-not-allowed bg-[var(--bg-surface)] text-[var(--text-muted)]'
                                    : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                                    }`}
                            >
                                <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                            </motion.button>
                        </div>

                        <p className="text-center text-[11px] mt-0.5 font-medium tracking-wide text-[var(--text-muted)]">
                            {isListening ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="text-[var(--accent)]"
                                >
                                    Listening ({VOICE_LANG_LABELS[voiceLang]})... tap mic to stop
                                </motion.span>
                            ) : (
                                'AI responses may not always be accurate. Please verify important information.'
                            )}
                        </p>
                    </div>
                </div>
            </div>
            {/* History Sidebar - Only visible on Desktop */}
            {!isMobile && (
                <HistorySidebar
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onLoadSession={onLoadSession}
                    onDeleteSession={onDeleteSession}
                    onClearAll={onClearAll}
                />
            )}
        </div>
    );
}

export default ChatInterface;
