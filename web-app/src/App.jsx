import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Paperclip, Sparkles, Sun, Moon, Hash, FileText, ChevronRight, MessageSquare, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = 'http://localhost:8000';

const CATEGORIES = [
    { name: "Fee Structure", icon: <FileText className="w-4 h-4" /> },
    { name: "Hostel Rules", icon: <FileText className="w-4 h-4" /> },
    { name: "Placement Guidelines", icon: <FileText className="w-4 h-4" /> },
    { name: "Scholarship Info", icon: <FileText className="w-4 h-4" /> },
    { name: "Anti-Ragging Policy", icon: <FileText className="w-4 h-4" /> },
];

const RECENT = [
    "What is the BTech fee?",
    "Hostel curfew timings",
    "How to apply for placement?"
];

/* ── Hexagon Vector Logo ──────────────────────────────── */
const HexagonLogo = ({ isProcessing, className = "w-6 h-6", dark }) => {
    const strokeColor = dark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)";
    const glowColor = dark ? "rgba(34, 211, 238, 0.6)" : "rgba(79, 70, 229, 0.4)"; 

    return (
        <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            animate={isProcessing ? {
                filter: [
                    `drop-shadow(0 0 0px ${glowColor.replace(/[\d.]+\)$/g, '0)')})`,
                    `drop-shadow(0 0 8px ${glowColor})`,
                    `drop-shadow(0 0 0px ${glowColor.replace(/[\d.]+\)$/g, '0)')})`
                ],
                stroke: [strokeColor, dark ? '#22d3ee' : '#4f46e5', strokeColor]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <path d="M12 22V16" />
            <path d="M4 8.5L8.5 11" />
            <path d="M20 8.5L15.5 11" />
        </motion.svg>
    );
};

/* ── Markdown Components ──────────────────────────────── */
const getMdComponents = (dark) => ({
    h1: ({node, ...props}) => <h1 className="text-xl font-semibold mt-5 mb-3 tracking-tight" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-4 mb-2 tracking-tight" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-base font-medium mt-4 mb-2 opacity-90" {...props} />,
    p: ({node, ...props}) => <p className="leading-relaxed mb-3 opacity-90 text-[15px]" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 opacity-90 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 opacity-90 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="pl-1" {...props} />,
    table: ({node, ...props}) => <div className="overflow-x-auto my-4 scrollbar-thin"><table className="text-sm text-left border-collapse w-full" {...props} /></div>,
    th: ({node, ...props}) => <th className={`border-b p-3 font-medium ${dark ? 'border-white/10 text-white/70' : 'border-gray-200 text-gray-500'}`} {...props} />,
    td: ({node, ...props}) => <td className={`border-b p-3 ${dark ? 'border-white/5' : 'border-gray-100'}`} {...props} />,
    a: ({node, ...props}) => <a className={`${dark ? 'text-cyan-400' : 'text-indigo-600'} hover:underline font-medium`} {...props} />,
    strong: ({node, ...props}) => <strong className="font-semibold opacity-100" {...props} />,
    code: ({node, inline, children, ...props}) => {
        return inline ? (
            <code className={`px-1.5 py-0.5 rounded-md text-[13px] font-mono ${dark ? 'bg-white/10 text-cyan-200' : 'bg-gray-100 text-indigo-700'}`} {...props}>{children}</code>
        ) : (
            <pre className={`p-4 rounded-xl overflow-x-auto text-[13px] font-mono mb-4 border scrollbar-thin ${dark ? 'bg-[#111] border-white/5 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
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
            whileHover={{ scale: 1.02 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm cursor-default transition-colors ${
                dark 
                ? 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20' 
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
        >
            <Hash className="w-3 h-3 opacity-70" />
            {name}
        </motion.span>
    );
}

/* ── Main App ────────────────────────────────────────── */
function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [dark, setDark] = useState(true); // "Deep Obsidian" default
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
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Data cluster unreachable. Please try again later.",
                isError: true,
            }]);
        } finally {
            setLoading(false);
            if (window.innerWidth > 768) setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    /* ── Theme Definitions ────────────────────────────── */
    const t = {
        bg: dark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]',
        surface: dark ? 'bg-[#121212]' : 'bg-white',
        border: dark ? 'border-white/10' : 'border-gray-200',
        text: dark ? 'text-gray-200' : 'text-gray-800',
        textGhost: dark ? 'text-gray-400' : 'text-gray-500',
        ghostBubble: dark ? 'bg-[#161616] border border-white/5' : 'bg-white border border-gray-100 shadow-sm',
    };

    return (
        <div className={`flex h-screen w-full transition-colors duration-500 ${t.bg} ${t.text} font-sans overflow-hidden antialiased selection:bg-cyan-500/30 selection:text-white`}>
            
            {/* ── Sidebar ─────────────────────────────────── */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex flex-col shrink-0 border-r ${t.border} ${t.surface} z-30 h-full overflow-hidden absolute md:relative shadow-2xl md:shadow-none`}
                    >
                        <div className="w-[280px] h-full flex flex-col pt-4">
                            <div className="px-4 pb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <HexagonLogo isProcessing={false} dark={dark} className="w-5 h-5 opacity-80" />
                                    <span className="text-sm font-semibold tracking-wide">Zeno <span className="opacity-40 italic font-normal text-xs">Vector</span></span>
                                </div>
                                <button onClick={() => setMessages([])} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}>
                                    <Plus className="w-4 h-4 opacity-70" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-6 pt-2 scrollbar-thin">
                                {/* Recent Conversations */}
                                <div>
                                    <h4 className={`px-2 text-[10px] font-bold uppercase tracking-wider mb-2 ${t.textGhost}`}>Recent Consultations</h4>
                                    <div className="space-y-0.5">
                                        {RECENT.map((r, i) => (
                                            <button key={i} className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-[13px] transition-colors text-left truncate ${dark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                                <MessageSquare className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                                <span className="truncate opacity-80">{r}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Policy Categories */}
                                <div>
                                    <h4 className={`px-2 text-[10px] font-bold uppercase tracking-wider mb-2 ${t.textGhost}`}>Policy Clusters</h4>
                                    <div className="space-y-0.5">
                                        {CATEGORIES.map((cat, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => {
                                                    send(`What does the policy say about ${cat.name}?`);
                                                    if(window.innerWidth < 768) setSidebarOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-2 py-2.5 rounded-lg text-[13px] transition-colors text-left group ${dark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                                            >
                                                <div className="flex items-center gap-3 truncate opacity-90 group-hover:opacity-100 transition-opacity">
                                                    <span className="opacity-50">{cat.icon}</span>
                                                    <span className="truncate">{cat.name}</span>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-30 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ── Main Chat Area ──────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                
                {/* Header */}
                <header className={`absolute top-0 inset-x-0 h-16 flex items-center justify-between px-4 z-10 backdrop-blur-md bg-gradient-to-b ${dark ? 'from-[#0a0a0a] to-[#0a0a0a]/0' : 'from-[#fafafa] to-[#fafafa]/0'}`}>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            className={`p-2 rounded-xl transition-all active:scale-95 ${dark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'}`}
                        >
                            <PanelLeft className="w-5 h-5" />
                        </button>
                        
                        {(!sidebarOpen || window.innerWidth < 768) && (
                            <motion.div initial={{ opacity: 0, x:-10 }} animate={{ opacity:1, x:0 }} className="flex items-center gap-2">
                                <HexagonLogo isProcessing={loading} dark={dark} className="w-5 h-5 opacity-80" />
                            </motion.div>
                        )}
                    </div>
                    <button 
                        onClick={() => setDark(!dark)} 
                        className={`p-2 rounded-xl transition-all active:scale-95 ${dark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'}`}
                    >
                        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </header>

                {/* Scroller Area */}
                <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-20 pb-40 scrollbar-thin">
                    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8 md:gap-10">
                        
                        {messages.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="flex flex-col items-center justify-center pt-[15vh]"
                            >
                                <HexagonLogo isProcessing={false} dark={dark} className="w-16 h-16 mb-8 opacity-60" />
                                <h1 className={`text-3xl md:text-4xl font-light tracking-tight mb-4 ${dark ? 'text-white/90' : 'text-black/90'}`}>
                                    Data Cluster Access
                                </h1>
                                <p className={`text-sm md:text-base ${t.textGhost} max-w-sm text-center leading-relaxed backdrop-blur-sm`}>
                                    Vector search across secure academic policy nodes. Ask about fees, hostels, or schedules.
                                </p>
                            </motion.div>
                        ) : (
                            messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'user' ? (
                                        <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[15px] leading-relaxed relative ${t.ghostBubble}`}>
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 md:gap-6 w-full max-w-[95%]">
                                            <div className="shrink-0 mt-1 md:mt-1.5">
                                                <HexagonLogo dark={dark} isProcessing={false} className="w-6 h-6 opacity-70" />
                                            </div>
                                            <div className={`flex-1 min-w-0 font-sans ${msg.isError ? 'text-red-400' : ''}`}>
                                                <ReactMarkdown components={getMdComponents(dark)} remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                                
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-dashed border-current border-opacity-15">
                                                        <span className="text-[10px] font-semibold tracking-widest uppercase opacity-40">Vectors</span>
                                                        {msg.sources.map((s, si) => <SourceBadge key={si} source={s.source} dark={dark} />)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}

                        {loading && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 md:gap-6 w-full"
                            >
                                <div className="shrink-0 mt-1.5">
                                    <HexagonLogo dark={dark} isProcessing={true} className="w-6 h-6" />
                                </div>
                                <div className="flex items-center h-8">
                                    <span className={`text-[12px] tracking-widest uppercase font-medium ${dark ? 'text-cyan-400/80 animate-pulse' : 'text-indigo-600/80 animate-pulse'}`}>
                                        Scanning Nodes...
                                    </span>
                                </div>
                            </motion.div>
                        )}
                        <div ref={bottomRef} className="h-4" />
                    </div>
                </main>

                {/* Floating Input Bar */}
                <div className={`absolute bottom-0 inset-x-0 p-4 md:pb-6 pt-16 pointer-events-none bg-gradient-to-t ${dark ? 'from-[#0a0a0a] via-[#0a0a0a]/95' : 'from-[#fafafa] via-[#fafafa]/95'} to-transparent z-10`}>
                    <div className="max-w-3xl mx-auto w-full pointer-events-auto relative">
                        <div className={`relative flex items-end gap-2 p-2 rounded-2xl transition-all duration-300 backdrop-blur-2xl ${
                            dark 
                            ? 'bg-[#161616]/70 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] focus-within:border-white/20 focus-within:bg-[#161616]' 
                            : 'bg-white/80 border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.05)] focus-within:border-gray-300 focus-within:bg-white'
                        }`}>
                            <div className="relative group shrink-0">
                                <button className={`p-2.5 rounded-xl transition-colors ${dark ? 'text-white/40 hover:text-cyan-400 hover:bg-cyan-400/10' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-600/10'}`}>
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-2 mb-2 px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    Doc Status: Ready
                                </div>
                            </div>
                            
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Query academic nodes..."
                                className={`flex-1 max-h-48 min-h-[44px] py-2.5 bg-transparent resize-none outline-none text-[15px] leading-relaxed scrollbar-thin ${
                                    dark ? 'text-white/90 placeholder:text-white/30' : 'text-gray-900 placeholder:text-gray-400'
                                }`}
                                rows={1}
                            />
                            
                            <button
                                onClick={() => send(input)}
                                disabled={!input.trim() || loading}
                                className={`p-2.5 rounded-xl transition-all shrink-0 ${
                                    !input.trim() || loading 
                                    ? `opacity-30 cursor-not-allowed ${dark ? 'text-white' : 'text-black'}` 
                                    : dark 
                                        ? 'bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20' 
                                        : 'bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20'
                                }`}
                            >
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default App;
