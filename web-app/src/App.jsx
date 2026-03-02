import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PanelLeft, Send, Sun, Moon, MessageSquare, Plus,
    Sparkles, GraduationCap, Building2, Shield, CreditCard,
    Briefcase, Clock, Star, ChevronRight, Hash, ArrowRight,
    BookOpen, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = 'http://localhost:8000';

/* ── Data ─────────────────────────────────────────────── */
const CATEGORIES = [
    { name: "Fee Structure", icon: CreditCard, gradient: "from-amber-400 to-orange-500" },
    { name: "Hostel Rules", icon: Building2, gradient: "from-sky-400 to-blue-500" },
    { name: "Placements", icon: Briefcase, gradient: "from-violet-400 to-purple-600" },
    { name: "Scholarships", icon: GraduationCap, gradient: "from-emerald-400 to-green-600" },
    { name: "Anti-Ragging", icon: Shield, gradient: "from-rose-400 to-pink-600" },
];

const SUGGESTIONS = [
    { text: "What are the hostel timings?", icon: Clock, gradient: "from-blue-500 to-cyan-400" },
    { text: "Scholarship eligibility criteria", icon: Star, gradient: "from-amber-500 to-yellow-400" },
    { text: "Placement cell process", icon: Briefcase, gradient: "from-purple-500 to-violet-400" },
    { text: "Fee structure for BTech", icon: CreditCard, gradient: "from-pink-500 to-rose-400" },
];

const RECENT = [
    "What is the BTech fee?",
    "Hostel curfew timings",
    "How to apply for placement?"
];

/* ── Animated Background Orbs ─────────────────────────── */
const BackgroundOrbs = ({ dark }) => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
            className={`absolute rounded-full animate-float-1 blur-[100px]`}
            style={{
                top: '-10%', left: '-5%', width: 500, height: 500,
                background: dark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.15)',
            }}
        />
        <div
            className={`absolute rounded-full animate-float-2 blur-[120px]`}
            style={{
                top: '20%', right: '-10%', width: 600, height: 600,
                background: dark ? 'rgba(236,72,153,0.06)' : 'rgba(236,72,153,0.12)',
            }}
        />
        <div
            className={`absolute rounded-full animate-float-3 blur-[100px]`}
            style={{
                bottom: '-10%', left: '30%', width: 400, height: 400,
                background: dark ? 'rgba(6,182,212,0.06)' : 'rgba(6,182,212,0.15)',
            }}
        />
        <div
            className={`absolute rounded-full animate-float-2 blur-[80px]`}
            style={{
                top: '60%', left: '-5%', width: 350, height: 350,
                background: dark ? 'rgba(245,158,11,0.04)' : 'rgba(245,158,11,0.10)',
                animationDelay: '-5s',
            }}
        />
        <div
            className={`absolute rounded-full animate-float-1 blur-[90px]`}
            style={{
                top: '10%', left: '50%', width: 300, height: 300,
                background: dark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.08)',
                animationDelay: '-10s',
            }}
        />
    </div>
);

/* ── Zeno Logo ────────────────────────────────────────── */
const ZenoLogo = ({ size = 40, animate = false, dark }) => (
    <motion.div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500"
        style={{
            width: size, height: size,
            boxShadow: animate
                ? '0 0 24px rgba(139,92,246,0.35)'
                : '0 4px 12px rgba(139,92,246,0.2)',
        }}
        animate={animate ? {
            boxShadow: [
                '0 0 20px rgba(139,92,246,0.3)',
                '0 0 40px rgba(139,92,246,0.55)',
                '0 0 20px rgba(139,92,246,0.3)',
            ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
        <Sparkles className="text-white" style={{ width: size * 0.5, height: size * 0.5 }} />
    </motion.div>
);

/* ── Loading Dots ─────────────────────────────────────── */
const LoadingDots = () => (
    <div className="flex items-center gap-1.5 px-1 py-3">
        {[0, 1, 2].map(i => (
            <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
        ))}
        <span className="ml-2 text-sm font-semibold gradient-text-subtle">
            Thinking...
        </span>
    </div>
);

/* ── Markdown Components ──────────────────────────────── */
const getMdComponents = (dark) => ({
    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-5 mb-3 tracking-tight gradient-text-subtle" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2 tracking-tight" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-4 mb-2" {...props} />,
    p: ({ node, ...props }) => <p className="leading-relaxed mb-3 text-[15px]" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1.5" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1.5" {...props} />,
    li: ({ node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
    table: ({ node, ...props }) => (
        <div className={`overflow-x-auto my-4 rounded-xl border ${dark ? 'border-purple-500/20' : 'border-purple-200/60'}`}>
            <table className="text-sm text-left w-full" {...props} />
        </div>
    ),
    th: ({ node, ...props }) => (
        <th className={`p-3 font-semibold text-xs uppercase tracking-wider ${dark ? 'bg-purple-500/10 text-purple-300 border-b border-purple-500/20' : 'bg-purple-50 text-purple-700 border-b border-purple-100'}`} {...props} />
    ),
    td: ({ node, ...props }) => (
        <td className={`p-3 ${dark ? 'border-b border-white/5' : 'border-b border-gray-100'}`} {...props} />
    ),
    a: ({ node, ...props }) => <a className={`${dark ? 'text-violet-400' : 'text-violet-600'} hover:underline font-medium`} {...props} />,
    strong: ({ node, ...props }) => <strong className={`font-bold ${dark ? 'text-purple-300' : 'text-purple-700'}`} {...props} />,
    code: ({ node, inline, children, ...props }) => {
        return inline ? (
            <code className={`px-1.5 py-0.5 rounded-md text-[13px] font-mono ${dark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-100 text-purple-700'}`} {...props}>{children}</code>
        ) : (
            <pre className={`p-4 rounded-xl overflow-x-auto text-[13px] font-mono mb-4 border ${dark ? 'bg-[#111] border-purple-500/10 text-gray-300' : 'bg-gray-50 border-purple-200/50 text-gray-800'}`}>
                <code {...props}>{children}</code>
            </pre>
        );
    }
});

/* ── Source Badge ─────────────────────────────────────── */
function SourceBadge({ source, dark }) {
    const name = source.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
    return (
        <motion.span
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase cursor-default transition-all ${dark
                    ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/20 text-purple-300 hover:border-purple-400/40'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-600 hover:border-purple-300 hover:shadow-md hover:shadow-purple-100'
                }`}
        >
            <Hash className="w-3 h-3" />
            {name}
        </motion.span>
    );
}

/* ══════════════════════════════════════════════════════════
   ██  MAIN APP
   ══════════════════════════════════════════════════════════ */
function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [dark, setDark] = useState(false);       // bright by default
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    };

    useEffect(() => {
        if (!input && inputRef.current) inputRef.current.style.height = 'auto';
    }, [input]);

    /* ── Send Message ─────────────────────────────────── */
    const send = async (text) => {
        if (!text.trim() || loading) return;
        const msg = text.trim();
        setInput('');

        const updated = [...messages, { role: 'user', content: msg }];
        setMessages(updated);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, history: updated.slice(-6) }),
            });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer,
                sources: data.sources || [],
            }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Oops! Couldn't reach the server right now. Please try again.",
                isError: true,
            }]);
        } finally {
            setLoading(false);
            if (window.innerWidth > 768) setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
    };

    /* ────────────────────────── RENDER ────────────────── */
    return (
        <div className={`flex h-screen w-full transition-colors duration-500 font-sans overflow-hidden antialiased ${dark ? 'bg-[#0a0a0a] text-gray-200' : 'bg-white text-gray-800'}`}>

            <BackgroundOrbs dark={dark} />

            {/* ══════════ SIDEBAR ══════════ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex flex-col shrink-0 border-r z-30 h-full overflow-hidden absolute md:relative ${dark
                                ? 'glass-dark border-white/10 shadow-2xl'
                                : 'glass border-purple-100/50 shadow-xl'
                            }`}
                        style={!dark ? { boxShadow: '4px 0 24px rgba(139,92,246,0.06)' } : {}}
                    >
                        <div className="w-[300px] h-full flex flex-col">

                            {/* Sidebar Header */}
                            <div className="px-5 py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ZenoLogo size={32} dark={dark} />
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-base tracking-tight">Zeno</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white">AI</span>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setMessages([])}
                                    className={`p-2 rounded-xl transition-colors ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-purple-50 text-purple-400'}`}
                                >
                                    <Plus className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* New Chat CTA */}
                            <div className="px-4 pb-5">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setMessages([])}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white font-semibold text-sm shadow-lg transition-shadow hover:shadow-xl"
                                    style={{ boxShadow: '0 6px 20px rgba(139,92,246,0.3)' }}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    New Conversation
                                </motion.button>
                            </div>

                            {/* Scrollable list */}
                            <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-6 scrollbar-thin">

                                {/* Recent */}
                                <div>
                                    <h4 className={`px-2 text-[10px] font-bold uppercase tracking-widest mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Recent</h4>
                                    <div className="space-y-1">
                                        {RECENT.map((r, i) => (
                                            <motion.button
                                                key={i}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => send(r)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all text-left truncate ${dark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-purple-50 text-gray-600'
                                                    }`}
                                            >
                                                <MessageSquare className="w-4 h-4 opacity-40 shrink-0" />
                                                <span className="truncate">{r}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Categories */}
                                <div>
                                    <h4 className={`px-2 text-[10px] font-bold uppercase tracking-widest mb-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Categories</h4>
                                    <div className="space-y-1.5">
                                        {CATEGORIES.map((cat, i) => {
                                            const Icon = cat.icon;
                                            return (
                                                <motion.button
                                                    key={i}
                                                    whileHover={{ x: 4, scale: 1.01 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        send(`Tell me about ${cat.name}`);
                                                        if (window.innerWidth < 768) setSidebarOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-medium transition-all text-left group ${dark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-sm`}>
                                                        <Icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="truncate flex-1">{cat.name}</span>
                                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Footer */}
                            <div className={`px-5 py-4 border-t ${dark ? 'border-white/5' : 'border-purple-100/50'}`}>
                                <div className={`flex items-center gap-2.5 ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    <Zap className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-medium">Powered by RAG Engine</span>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ══════════ MAIN CHAT AREA ══════════ */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">

                {/* Header */}
                <header className={`absolute top-0 inset-x-0 h-16 flex items-center justify-between px-4 z-10 ${dark
                        ? 'bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent'
                        : 'bg-gradient-to-b from-white/95 via-white/80 to-transparent backdrop-blur-md'
                    }`}>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2.5 rounded-xl transition-all ${dark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-purple-50 text-purple-400'}`}
                        >
                            <PanelLeft className="w-5 h-5" />
                        </motion.button>
                        {!sidebarOpen && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5">
                                <ZenoLogo size={28} animate={loading} dark={dark} />
                                <span className="font-bold text-sm">Zeno</span>
                            </motion.div>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => setDark(!dark)}
                        className={`p-2.5 rounded-xl transition-all ${dark ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-purple-50 text-purple-400'}`}
                    >
                        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.button>
                </header>

                {/* ── Messages Area ───────────────────────── */}
                <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 pb-48 scrollbar-thin">
                    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">

                        {messages.length === 0 ? (
                            /* ─── Welcome / Empty State ─── */
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center pt-[8vh] md:pt-[10vh]"
                            >
                                {/* Logo entrance */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
                                >
                                    <ZenoLogo size={72} dark={dark} />
                                </motion.div>

                                {/* Gradient heading */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="text-4xl md:text-5xl font-extrabold tracking-tight mt-8 mb-4 text-center gradient-text leading-tight"
                                >
                                    What can I help you with?
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                    className={`text-base md:text-lg text-center max-w-md mb-10 leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                    Ask about college policies, fees, hostels, placements & more. I'm here to help! ✨
                                </motion.p>

                                {/* Suggestion Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                                    {SUGGESTIONS.map((s, i) => {
                                        const Icon = s.icon;
                                        return (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.55 + i * 0.1 }}
                                                whileHover={{ scale: 1.03, y: -3 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => send(s.text)}
                                                className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-all group ${dark
                                                        ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                                                        : 'bg-white hover:bg-white border border-gray-200/80 hover:border-purple-200 shadow-sm hover:shadow-lg'
                                                    }`}
                                                style={!dark ? { '--tw-shadow-color': 'rgba(139,92,246,0.08)' } : {}}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow`}>
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-sm font-medium leading-snug flex-1">{s.text}</span>
                                                <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-60 transition-all transform group-hover:translate-x-1 shrink-0 ${dark ? 'text-white' : 'text-purple-500'}`} />
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Floating feature badges */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.1 }}
                                    className="flex flex-wrap justify-center gap-2 mt-10"
                                >
                                    {[
                                        { label: '🚀 Fast', delay: 0 },
                                        { label: '🔒 Secure', delay: 0.3 },
                                        { label: '🎯 Accurate', delay: 0.6 },
                                        { label: '💡 Smart', delay: 0.9 },
                                    ].map((badge, i) => (
                                        <motion.span
                                            key={i}
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 2.5, repeat: Infinity, delay: badge.delay, ease: "easeInOut" }}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${dark ? 'bg-white/5 text-gray-400 border border-white/5' : 'bg-purple-50 text-purple-500 border border-purple-100'
                                                }`}
                                        >
                                            {badge.label}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            </motion.div>

                        ) : (
                            /* ─── Message Bubbles ─── */
                            messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'user' ? (
                                        /* User bubble — gradient */
                                        <motion.div whileHover={{ scale: 1.01 }} className="max-w-[85%]">
                                            <div className="px-5 py-3.5 rounded-2xl rounded-br-md text-[15px] leading-relaxed bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                                                style={{ boxShadow: '0 4px 20px rgba(139,92,246,0.25)' }}
                                            >
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        /* Bot bubble — card */
                                        <div className="flex gap-3 md:gap-4 w-full max-w-[95%]">
                                            <div className="shrink-0 mt-1">
                                                <ZenoLogo size={32} dark={dark} />
                                            </div>
                                            <div className={`flex-1 min-w-0 rounded-2xl rounded-tl-md px-5 py-4 ${msg.isError
                                                    ? (dark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200')
                                                    : (dark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200/80 shadow-sm')
                                                }`}>
                                                <div className={msg.isError ? (dark ? 'text-red-400' : 'text-red-600') : ''}>
                                                    <ReactMarkdown components={getMdComponents(dark)} remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${dark ? 'border-white/5' : 'border-purple-100'}`}>
                                                        <span className={`text-[10px] font-bold tracking-widest uppercase ${dark ? 'text-gray-500' : 'text-purple-300'}`}>Sources</span>
                                                        {msg.sources.map((s, si) => <SourceBadge key={si} source={s.source} dark={dark} />)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}

                        {/* Loading indicator */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 md:gap-4 w-full"
                            >
                                <div className="shrink-0 mt-1">
                                    <ZenoLogo size={32} animate dark={dark} />
                                </div>
                                <div className={`rounded-2xl rounded-tl-md px-5 py-1 ${dark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200/80 shadow-sm'}`}>
                                    <LoadingDots />
                                </div>
                            </motion.div>
                        )}

                        <div ref={bottomRef} className="h-4" />
                    </div>
                </main>

                {/* ── Floating Input Bar ──────────────────── */}
                <div className={`absolute bottom-0 inset-x-0 p-4 md:pb-6 pt-20 pointer-events-none z-10 ${dark
                        ? 'bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent'
                        : 'bg-gradient-to-t from-white via-white/95 to-transparent'
                    }`}>
                    <div className="max-w-3xl mx-auto w-full pointer-events-auto">
                        <motion.div
                            className={`relative flex items-end gap-2 p-2 rounded-2xl input-glow transition-all duration-300 ${dark
                                    ? 'glass-dark border border-white/10 shadow-2xl focus-within:border-purple-500/40'
                                    : 'glass border border-purple-200/60 shadow-xl focus-within:border-purple-400'
                                }`}
                            style={!dark ? { boxShadow: '0 8px 32px rgba(139,92,246,0.08)' } : {}}
                            whileTap={{ scale: 0.998 }}
                        >
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything about college..."
                                className={`flex-1 max-h-48 min-h-[44px] py-3 px-3 bg-transparent resize-none outline-none text-[15px] leading-relaxed scrollbar-thin ${dark ? 'text-white/90 placeholder:text-white/30' : 'text-gray-800 placeholder:text-gray-400'
                                    }`}
                                rows={1}
                            />
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.88 }}
                                onClick={() => send(input)}
                                disabled={!input.trim() || loading}
                                className={`p-3 rounded-xl transition-all shrink-0 ${!input.trim() || loading
                                        ? `opacity-30 cursor-not-allowed ${dark ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-400'}`
                                        : 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                                    }`}
                                style={input.trim() && !loading ? { boxShadow: '0 4px 16px rgba(139,92,246,0.35)' } : {}}
                            >
                                <Send className="w-5 h-5" />
                            </motion.button>
                        </motion.div>

                        <p className={`text-center text-[11px] mt-3 font-medium ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                            Zeno can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
