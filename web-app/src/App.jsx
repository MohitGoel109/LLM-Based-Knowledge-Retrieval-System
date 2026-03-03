import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PanelLeft, Send, Sun, Moon, MessageSquare, Plus,
    Sparkles, GraduationCap, Building2, Shield, CreditCard,
    Briefcase, Clock, Star, ChevronRight, Hash, ArrowRight,
    Zap, Bot, Sparkle, Settings, Palette, BookOpen, Calendar, Map
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = 'http://localhost:8000';

/* ── Themes Data ─────────────────────────────────────── */
const THEMES = [
    { id: 'default', name: 'Cyberpunk', icon: Sparkles, color: 'bg-gradient-to-br from-pink-500 to-violet-500' },
    { id: 'theme-sunset', name: 'Sunset', icon: Sun, color: 'bg-gradient-to-br from-orange-500 to-rose-500' },
    { id: 'theme-emerald', name: 'Emerald', icon: Map, color: 'bg-gradient-to-br from-emerald-400 to-cyan-500' },
    { id: 'theme-ocean', name: 'Ocean', icon: Zap, color: 'bg-gradient-to-br from-blue-500 to-indigo-500' },
];

/* ── Expanded Data ────────────────────────────────────── */
const CATEGORIES = [
    { name: "Fee Structure", icon: CreditCard, color: "from-[#ff6a00] to-[#ee0979]", shadow: "shadow-[#ee0979]/40" },
    { name: "Hostel Rules", icon: Building2, color: "from-[#00c6ff] to-[#0072ff]", shadow: "shadow-[#0072ff]/40" },
    { name: "Placements", icon: Briefcase, color: "from-[#8E2DE2] to-[#4A00E0]", shadow: "shadow-[#4A00E0]/40" },
    { name: "Scholarships", icon: GraduationCap, color: "from-[#11998e] to-[#38ef7d]", shadow: "shadow-[#38ef7d]/40" },
    { name: "Anti-Ragging", icon: Shield, color: "from-[#ff0084] to-[#33001b]", shadow: "shadow-[#ff0084]/40" },
    { name: "Curriculum Details", icon: BookOpen, color: "from-[#f2709c] to-[#ff9472]", shadow: "shadow-[#ff9472]/40" },
    { name: "Academic Calendar", icon: Calendar, color: "from-[#5B86E5] to-[#36D1DC]", shadow: "shadow-[#36D1DC]/40" },
    { name: "Campus Map", icon: Map, color: "from-[#1D976C] to-[#93F9B9]", shadow: "shadow-[#1D976C]/40" }
];

const SUGGESTIONS = [
    { text: "What are the hostel timings?", icon: Clock, color: "from-[#00c6ff] to-[#0072ff]", shadow: "shadow-[#0072ff]/40" },
    { text: "Scholarship eligibility criteria", icon: Star, color: "from-[#f12711] to-[#f5af19]", shadow: "shadow-[#f5af19]/40" },
    { text: "Placement cell process for BTech", icon: Briefcase, color: "from-[#8E2DE2] to-[#4A00E0]", shadow: "shadow-[#4A00E0]/40" },
    { text: "Fee structure for CSE department", icon: CreditCard, color: "from-[#ee0979] to-[#ff6a00]", shadow: "shadow-[#ee0979]/40" },
    { text: "Where is the central library?", icon: BookOpen, color: "from-[#11998e] to-[#38ef7d]", shadow: "shadow-[#38ef7d]/40" },
    { text: "When do the mid-sem exams start?", icon: Calendar, color: "from-[#f2709c] to-[#ff9472]", shadow: "shadow-[#ff9472]/40" },
];

const QUICK_ACTIONS = [
    "Summarize placement rules 📄",
    "Latest hostel circular 🏠",
    "List of BTech courses 📚",
    "Who is the anti-ragging head? 🛡️"
];

const RECENT = [
    "What is the BTech fee?",
    "Hostel curfew timings",
    "How to apply for placement?",
    "Where is the CSE department?",
    "Library seating capacity"
];

/* ── Immersive Background ─────────────────────────────── */
const ImmersiveBackground = ({ dark }) => (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 transition-opacity duration-1000 ${dark ? 'opacity-100' : 'opacity-80'}`}>
        <div className="bg-liquid-aurora w-full h-[200%] absolute top-[-50%] left-[-50%] w-[200%]" />

        {/* Floating aesthetic particles */}
        <div className="absolute top-[10%] left-[15%] text-white/30 animate-float-star z-0">
            <Sparkle size={24} className={dark ? 'text-pink-400/30' : 'text-pink-500/20'} />
        </div>
        <div className="absolute top-[20%] right-[10%] text-white/20 animate-float-star-delayed z-0">
            <Sparkle size={32} className={dark ? 'text-indigo-400/30' : 'text-indigo-500/20'} />
        </div>
        <div className="absolute bottom-[20%] left-[25%] text-white/10 animate-float-star z-0">
            <Sparkle size={16} className={dark ? 'text-teal-400/30' : 'text-teal-500/20'} />
        </div>
        <div className="absolute bottom-[30%] right-[20%] text-white/10 animate-float-star-delayed z-0">
            <Sparkle size={40} className={dark ? 'text-yellow-400/20' : 'text-yellow-500/10'} />
        </div>

        {/* Deep noise overlay for texture */}
        <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-0"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
    </div>
);

/* ── Theme Switcher Component ─────────────────────────── */
const ThemeSwitcher = ({ currentTheme, onSelectTheme }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(!open)}
                className="p-3.5 rounded-2xl transition-all ultra-glass text-white shadow-[0_0_20px_var(--primary-glow)] flex items-center justify-center gap-2 group"
            >
                <Palette className="w-5 h-5 group-hover:animate-spin-slow" />
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute right-0 top-16 w-48 ultra-glass rounded-2xl p-2 flex flex-col gap-1 z-50 shadow-2xl backdrop-blur-3xl"
                    >
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { onSelectTheme(t.id); setOpen(false); }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${currentTheme === t.id ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                            >
                                <div className={`w-6 h-6 rounded-full ${t.color} shadow-lg`} />
                                {t.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Zeno Logo ────────────────────────────────────────── */
const ZenoLogo = ({ size = 48, animate = false, colorStyle = {} }) => (
    <motion.div
        className="relative flex items-center justify-center rounded-[30%] shrink-0 overflow-hidden"
        style={{
            width: size, height: size,
            background: 'linear-gradient(135deg, var(--aurora-1) 0%, var(--aurora-3) 100%)',
            boxShadow: animate
                ? '0 0 30px var(--primary-glow), inset 0 0 15px rgba(255,255,255,0.6)'
                : '0 10px 25px var(--secondary-glow), inset 0 2px 6px rgba(255,255,255,0.4)',
            border: '2px solid rgba(255,255,255,0.3)',
            ...colorStyle
        }}
        animate={animate ? {
            boxShadow: [
                '0 0 20px var(--primary-glow), inset 0 0 10px rgba(255,255,255,0.4)',
                '0 0 60px var(--secondary-glow), inset 0 0 20px rgba(255,255,255,0.8)',
                '0 0 20px var(--primary-glow), inset 0 0 10px rgba(255,255,255,0.4)',
            ],
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.15, rotate: 10 }}
    >
        <div className="absolute inset-0 bg-white opacity-20 pointer-events-none" style={{ mixBlendMode: 'overlay' }}></div>
        <Sparkles className="text-white relative z-10" style={{ width: size * 0.55, height: size * 0.55 }} />
    </motion.div>
);

/* ── Loading Dots ─────────────────────────────────────── */
const LoadingDots = () => (
    <div className="flex items-center gap-1.5 px-3 py-3">
        {[0, 1, 2].map(i => (
            <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                animate={{ y: [-4, 4, -4], scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                style={{
                    background: 'linear-gradient(135deg, var(--aurora-2), var(--aurora-3))',
                    boxShadow: '0 0 10px var(--primary-glow)'
                }}
            />
        ))}
        <span className="ml-3 text-[14px] font-black tracking-widest uppercase" style={{ backgroundImage: 'linear-gradient(110deg, var(--aurora-2), var(--aurora-3))', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'brightness(2)' }}>
            Processing
        </span>
    </div>
);

/* ── Markdown Components ──────────────────────────────── */
const getMdComponents = (dark) => ({
    h1: ({ node, ...props }) => <h1 className="text-2xl font-black mt-6 mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500" {...props} />,
    h2: ({ node, ...props }) => <h2 className={`text-xl font-extrabold mt-5 mb-3 tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`} {...props} />,
    h3: ({ node, ...props }) => <h3 className={`text-lg font-bold mt-4 mb-2 ${dark ? 'text-gray-200' : 'text-gray-800'}`} {...props} />,
    p: ({ node, ...props }) => <p className={`leading-relaxed mb-4 text-[16px] ${dark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
    ul: ({ node, ...props }) => <ul className={`list-disc list-outside ml-6 mb-4 space-y-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
    ol: ({ node, ...props }) => <ol className={`list-decimal list-outside ml-6 mb-4 space-y-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`} {...props} />,
    li: ({ node, ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
    table: ({ node, ...props }) => (
        <div className="overflow-x-auto my-5 rounded-2xl ultra-glass shadow-lg">
            <table className="text-[15px] text-left w-full whitespace-nowrap" {...props} />
        </div>
    ),
    th: ({ node, ...props }) => (
        <th className={`p-4 font-black text-xs uppercase tracking-widest ${dark ? 'bg-white/10 text-pink-300 border-b border-white/10' : 'bg-gray-100/50 text-indigo-700 border-b border-gray-200'}`} {...props} />
    ),
    td: ({ node, ...props }) => (
        <td className={`p-4 ${dark ? 'border-b border-white/5' : 'border-b border-gray-200/50'}`} {...props} />
    ),
    a: ({ node, ...props }) => <a className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-pink-500 hover:to-orange-400 font-bold decoration-2 underline-offset-4 transition-all" {...props} />,
    strong: ({ node, ...props }) => <strong className={`font-black tracking-wide ${dark ? 'text-white' : 'text-black'}`} {...props} />,
    code: ({ node, inline, children, ...props }) => {
        return inline ? (
            <code className={`px-2 py-1 rounded-lg text-[14px] font-mono shadow-sm ${dark ? 'bg-white/10 text-white/90 border border-white/20' : 'bg-indigo-100/50 text-indigo-800 border border-indigo-200'}`} {...props}>{children}</code>
        ) : (
            <pre className={`p-5 rounded-2xl overflow-x-auto text-[14px] font-mono mb-4 border shadow-inner ${dark ? 'bg-[#000000]/60 border-white/10 text-[#00d2ff]' : 'bg-gray-50/80 border-gray-200/80 text-blue-700'}`}>
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
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black tracking-widest uppercase cursor-pointer transition-all shadow-xl ${dark
                ? 'bg-white/10 border border-white/20 text-white hover:border-white/50 hover:bg-white/20'
                : 'bg-white/50 border border-indigo-200 text-indigo-800 hover:bg-white hover:shadow-lg'
                }`}
        >
            <Hash className={`w-3.5 h-3.5 ${dark ? 'text-[#00ff88]' : 'text-pink-500'}`} />
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
    const [dark, setDark] = useState(true);
    const [theme, setTheme] = useState('default'); // Default Cyberpunk
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
            if (!isMobile) setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    /* ────────────────────────── RENDER ────────────────── */
    return (
        // The root div receives the theme class and light mode toggle
        <div className={`flex h-screen w-full font-sans overflow-hidden antialiased bg-transition ${dark ? '' : 'light-mode-bg'} ${theme}`}>

            {/* Intense Animated Aurora Background */}
            <ImmersiveBackground dark={dark} />

            {/* ══════════ SIDEBAR (Ultra Glass) ══════════ */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0, x: -50 }}
                        animate={{ width: 340, opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: -50 }}
                        transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                        className="flex flex-col shrink-0 border-r z-30 h-full overflow-hidden absolute md:relative ultra-glass border-r-white/20"
                    >
                        <div className="w-[340px] h-full flex flex-col pt-2">

                            {/* Sidebar Header */}
                            <div className="px-6 py-8 flex items-center justify-between">
                                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-4 cursor-pointer">
                                    <ZenoLogo size={44} dark={dark} />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-3xl tracking-tighter text-white drop-shadow-md" style={{ color: 'var(--text-main)' }}>Zeno</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow-lg backdrop-blur-md border border-white/20" style={{ background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))' }}>AI</span>
                                        </div>
                                    </div>
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.2, rotate: 90 }}
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => setMessages([])}
                                    className="p-2.5 rounded-2xl transition-all ultra-glass hover:bg-white/20 shadow-lg"
                                >
                                    <Plus className="w-6 h-6" style={{ color: 'var(--text-main)' }} />
                                </motion.button>
                            </div>

                            {/* New Chat CTA */}
                            <div className="px-6 pb-6">
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setMessages([])}
                                    className="relative w-full overflow-hidden group rounded-[20px] p-[2px] touch-bounce shadow-xl"
                                >
                                    <span className="absolute inset-0 animate-spin-slow opacity-100" style={{ background: 'linear-gradient(to right, var(--aurora-1), var(--aurora-2), var(--aurora-3))' }}></span>
                                    <div className={`relative flex items-center justify-center gap-3 px-5 py-4 rounded-[18px] font-black tracking-wide text-[15px] transition-all backdrop-blur-xl group-hover:bg-opacity-80 ${dark ? 'bg-[#0a0a1a]/90 text-white' : 'bg-white/90 text-gray-900'}`}>
                                        <Sparkles className="w-5 h-5" style={{ color: 'var(--aurora-3)' }} />
                                        <span>Start New Session</span>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Scrollable list */}
                            <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-10 scrollbar-thin">

                                {/* Recent */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <h4 className={`px-2 text-[12px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
                                        <Clock size={14} /> History
                                    </h4>
                                    <div className="space-y-1.5">
                                        {RECENT.map((r, i) => (
                                            <motion.button
                                                key={i}
                                                whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                                whileTap={{ scale: 0.96 }}
                                                onClick={() => {
                                                    send(r);
                                                    if (isMobile) setSidebarOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[14px] font-bold transition-all text-left truncate touch-bounce border border-transparent hover:border-white/10 ${dark ? 'text-white/80' : 'text-gray-800'
                                                    }`}
                                            >
                                                <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                                                <span className="truncate">{r}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Categories */}
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <h4 className={`px-2 text-[12px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${dark ? 'text-white/50' : 'text-gray-500'}`}>
                                        <Zap size={14} /> Power Topics
                                    </h4>
                                    <div className="space-y-2.5">
                                        {CATEGORIES.map((cat, i) => {
                                            const Icon = cat.icon;
                                            return (
                                                <motion.button
                                                    key={i}
                                                    whileHover={{ scale: 1.03, x: 5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        send(`Tell me about ${cat.name}`);
                                                        if (isMobile) setSidebarOpen(false);
                                                    }}
                                                    className={`w-full relative overflow-hidden flex items-center gap-4 px-3 py-3 rounded-[20px] text-[15px] font-black transition-all text-left group touch-bounce ultra-glass hover:bg-white/10 ${dark ? 'text-white' : 'text-gray-900'}`}
                                                >
                                                    <div className={`w-11 h-11 rounded-[16px] bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0 shadow-xl ${cat.shadow} relative overflow-hidden`}>
                                                        <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors"></div>
                                                        <Icon className="w-5 h-5 text-white relative z-10" />
                                                    </div>
                                                    <span className="truncate flex-1 mt-0.5">{cat.name}</span>
                                                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                                        <ChevronRight className="w-4 h-4 opacity-50" />
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Sidebar Footer with Settings */}
                            <div className="px-6 py-5 border-t border-white/10 ultra-glass rounded-none mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center relative shadow-lg" style={{ background: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-4))' }}>
                                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
                                        <span className="text-white font-black text-sm">US</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-black ${dark ? 'text-white' : 'text-gray-900'}`}>Guest User</span>
                                        <span className={`text-[10px] font-bold tracking-widest uppercase ${dark ? 'text-white/50' : 'text-gray-500'}`}>Student</span>
                                    </div>
                                </div>
                                <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }} className="cursor-pointer opacity-70 hover:opacity-100">
                                    <Settings className={`w-5 h-5 ${dark ? 'text-white' : 'text-gray-800'}`} />
                                </motion.div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-20 backdrop-blur-md"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ══════════ MAIN CHAT AREA ══════════ */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">

                {/* Header Navbar */}
                <header className="absolute top-0 inset-x-0 h-24 flex items-center justify-between px-8 z-10 select-none">
                    <div className="flex items-center gap-5">
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3.5 rounded-2xl transition-all ultra-glass shadow-xl"
                        >
                            <PanelLeft className="w-6 h-6" style={{ color: 'var(--text-main)' }} />
                        </motion.button>
                        <AnimatePresence>
                            {!sidebarOpen && (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-4">
                                    <ZenoLogo size={40} animate={loading} dark={dark} />
                                    <span className="font-black text-2xl tracking-tighter drop-shadow-lg hidden sm:block" style={{ color: 'var(--text-main)' }}>Zeno</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Theme Switcher Component */}
                        <ThemeSwitcher currentTheme={theme} onSelectTheme={setTheme} />

                        <div className="w-px h-8 bg-white/20 mx-1"></div>

                        <motion.button
                            whileHover={{ scale: 1.2, rotate: 180 }}
                            whileTap={{ scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            onClick={() => setDark(!dark)}
                            className="p-3.5 rounded-[18px] transition-all ultra-glass hover:bg-white/20 text-yellow-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </motion.button>
                    </div>
                </header>

                {/* ── Messages Area ───────────────────────── */}
                <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-28 pb-56 scrollbar-thin relative z-0">
                    <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 relative z-10">

                        {messages.length === 0 ? (
                            /* ─── Immersive Empty State ─── */
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="flex flex-col items-center justify-center pt-[3vh] md:pt-[8vh]"
                            >
                                {/* Massive Glowing Logo Entrance */}
                                <motion.div
                                    initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
                                    className="relative mb-6"
                                >
                                    <div className="absolute inset-0 blur-[80px] scale-150 rounded-full animate-pulse z-0" style={{ background: 'radial-gradient(circle, var(--aurora-2) 0%, transparent 70%)' }}></div>
                                    <div className="relative z-10">
                                        <ZenoLogo size={120} animate={true} dark={dark} />
                                    </div>
                                </motion.div>

                                {/* Extreme Gradient Heading */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mt-4 mb-6 text-center leading-tight drop-shadow-2xl"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    Experience <br className="md:hidden" /><span className="text-transparent px-2 block md:inline" style={{ backgroundImage: 'linear-gradient(110deg, var(--aurora-1), var(--aurora-2), var(--aurora-3))', WebkitBackgroundClip: 'text', animation: 'shimmer-text 5s linear infinite', textShadow: '0 0 40px var(--primary-glow)' }}>Zeno.</span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className={`text-lg md:text-2xl font-bold text-center max-w-2xl mb-12 leading-relaxed drop-shadow-md ${dark ? 'text-white/70' : 'text-gray-600'}`}
                                >
                                    Your ultra-intelligent nexus. Ask me absolutely anything.
                                </motion.p>

                                {/* Huge, Bright Suggestion Tokens (Expanded to 6) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl px-2">
                                    {SUGGESTIONS.map((s, i) => {
                                        const Icon = s.icon;
                                        return (
                                            <motion.button
                                                key={i}
                                                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ delay: 0.7 + i * 0.1, type: "spring", bounce: 0.4 }}
                                                whileHover={{ scale: 1.05, y: -6, rotateX: 3, rotateY: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => send(s.text)}
                                                className="relative group p-[2px] rounded-[28px] rounded-br-xl overflow-hidden shadow-2xl touch-bounce perspective-1000"
                                                style={{ transformStyle: 'preserve-3d' }}
                                            >
                                                <span className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}></span>

                                                <div className={`relative h-full flex flex-col items-start gap-4 p-6 rounded-[26px] rounded-br-[8px] transition-all duration-300 ${dark ? 'bg-[#0a0a15]/90 hover:bg-[#0a0a15]/70' : 'bg-white/90 hover:bg-white/70'} backdrop-blur-2xl`}>
                                                    <div className="flex w-full items-center justify-between">
                                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0 shadow-lg ${s.shadow} transform-gpu group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-500`}>
                                                            <Icon className="w-7 h-7 text-white drop-shadow-md" />
                                                        </div>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${dark ? 'bg-white/5 group-hover:bg-white group-hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'bg-black/5 group-hover:bg-black group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]'}`}>
                                                            <ArrowRight className={`w-5 h-5 transition-colors ${dark ? 'text-white group-hover:text-black' : 'text-gray-800 group-hover:text-white'}`} />
                                                        </div>
                                                    </div>
                                                    <span className={`text-[16px] font-black leading-snug tracking-wide text-left ${dark ? 'text-white' : 'text-gray-900'}`}>{s.text}</span>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                        ) : (
                            /* ─── Extreme Chat Bubbles ─── */
                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        layout
                                        initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: -10 }}
                                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                                        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        style={{ perspective: 1000 }}
                                    >
                                        {msg.role === 'user' ? (
                                            /* User bubble — Dynamic gradient via CSS class */
                                            <motion.div whileHover={{ scale: 1.02, rotateZ: 1 }} className="max-w-[90%] md:max-w-[70%] z-20">
                                                <div className="px-8 py-5 rounded-[32px] rounded-br-none text-[17px] font-bold leading-relaxed user-bubble-vivid shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 blur-2xl rounded-full transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 pointer-events-none"></div>
                                                    <span className="relative z-10 block tracking-wide">{msg.content}</span>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* Bot bubble — Thick Frosted Glass Card */
                                            <div className="flex gap-4 md:gap-6 w-full max-w-[98%] md:max-w-[85%] relative z-10">
                                                <div className="shrink-0 mt-2 relative z-20 hidden sm:block">
                                                    <ZenoLogo size={48} dark={dark} />
                                                </div>
                                                <div className={`flex-1 min-w-0 rounded-[32px] rounded-tl-none px-8 py-7 relative z-10 bot-bubble-glass ${msg.isError ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''}`}>
                                                    <div className={msg.isError ? 'text-red-400 font-bold' : ''}>
                                                        <ReactMarkdown components={getMdComponents(dark)} remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                    {msg.sources && msg.sources.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                                            className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-white/10"
                                                        >
                                                            <div className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-1 ${dark ? 'bg-white/10 text-white/70' : 'bg-black/5 text-gray-700'}`}>
                                                                <Zap className="w-3.5 h-3.5" /> Sources
                                                            </div>
                                                            {msg.sources.map((s, si) => <SourceBadge key={si} source={s.source} dark={dark} />)}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}

                        {/* Extreme Loading indicator */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="flex gap-4 md:gap-6 w-full max-w-[85%] z-10"
                            >
                                <div className="shrink-0 mt-2 hidden sm:block">
                                    <ZenoLogo size={48} animate dark={dark} />
                                </div>
                                <div className="rounded-[32px] rounded-tl-none px-8 py-4 bot-bubble-glass flex items-center justify-center shadow-xl">
                                    <LoadingDots />
                                </div>
                            </motion.div>
                        )}

                        <div ref={bottomRef} className="h-12" />
                    </div>
                </main>

                {/* ── Extemely aesthetic bottom area ── */}
                <div className={`absolute bottom-0 inset-x-0 p-6 md:px-12 md:pb-8 pt-32 pointer-events-none z-30 transition-all duration-500 ${dark ? 'bg-gradient-to-t from-black/90 via-black/50 to-transparent' : 'bg-gradient-to-t from-white/95 via-white/80 to-transparent'}`}>
                    <div className="max-w-5xl mx-auto w-full pointer-events-auto flex flex-col gap-3">

                        {/* Quick Action Pills (New Option) */}
                        <AnimatePresence>
                            {(messages.length === 0 && !loading) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                                    className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x"
                                >
                                    {QUICK_ACTIONS.map((action, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => send(action.replace(/ [^\w\s].*$/, ''))} // Send without emoji for cleaner query
                                            className={`shrink-0 snap-center px-4 py-2 rounded-2xl text-[13px] font-black tracking-wide transition-all shadow-lg border ${dark ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800'}`}
                                            backdropFilter="blur(10px)"
                                        >
                                            {action}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Input Component */}
                        <motion.div
                            layout
                            className="relative flex items-end gap-3 p-3 rounded-[32px] input-glow-extreme ultra-glass shadow-2xl"
                            whileTap={{ scale: 0.99 }}
                        >
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Command Zeno..."
                                className={`flex-1 max-h-[200px] min-h-[60px] py-5 px-6 bg-transparent resize-none outline-none text-[18px] font-bold leading-relaxed scrollbar-thin ${dark ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'}`}
                                rows={1}
                            />
                            <motion.button
                                whileHover={{ scale: 1.15, rotate: 10 }}
                                whileTap={{ scale: 0.8 }}
                                onClick={() => send(input)}
                                disabled={!input.trim() || loading}
                                className={`p-5 rounded-[24px] transition-all shrink-0 mb-1 mr-1 relative overflow-hidden group touch-bounce ${!input.trim() || loading
                                    ? `opacity-40 cursor-not-allowed ${dark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-500'}`
                                    : 'text-white shadow-[0_0_30px_var(--primary-glow)] hover:shadow-[0_0_40px_var(--secondary-glow)]'
                                    }`}
                                style={input.trim() && !loading ? { backgroundImage: 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2))' } : {}}
                            >
                                {(input.trim() && !loading) && (
                                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30"></div>
                                )}
                                <Send className="w-7 h-7 ml-0.5 relative z-10" strokeWidth={2.5} />
                            </motion.button>
                        </motion.div>

                        <p className={`text-center text-[12px] mt-2 font-black tracking-widest uppercase ${dark ? 'text-white/40' : 'text-gray-400'} drop-shadow-md`}>
                            AI CAN FABRICATE DATA. VERIFY CRITICAL INTELLIGENCE.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
