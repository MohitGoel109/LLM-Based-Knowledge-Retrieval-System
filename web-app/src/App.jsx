import React, { useState, useRef, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:8000';

const SUGGESTED_QUESTIONS = [
    { icon: "📋", text: "What's the attendance policy?" },
    { icon: "💼", text: "Tell me about placements" },
    { icon: "🏠", text: "What are the hostel timings?" },
    { icon: "🎓", text: "Scholarship eligibility?" },
    { icon: "💰", text: "Fee structure details" },
    { icon: "🛡️", text: "Anti-ragging helpline?" },
];

/* ── Markdown-lite renderer ──────────────────────────── */
function renderMarkdown(text, dark) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let i = 0;
    const headingClr = dark ? 'text-white/90' : 'text-gray-900';
    const bulletClr = dark ? 'text-indigo-400' : 'text-indigo-600';

    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className={`text-base font-bold mt-3 mb-1 ${headingClr}`}>{line.slice(4)}</h3>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className={`text-lg font-bold mt-3 mb-1 ${headingClr}`}>{line.slice(3)}</h2>);
        } else if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className={`text-xl font-bold mt-3 mb-1 ${headingClr}`}>{line.slice(2)}</h1>);
        } else if (line.match(/^\s*[-•*]\s/)) {
            const bulletText = line.replace(/^\s*[-•*]\s/, '');
            elements.push(
                <div key={i} className="flex gap-2 ml-2 my-0.5">
                    <span className={`${bulletClr} mt-0.5 shrink-0`}>•</span>
                    <span>{renderInline(bulletText, dark)}</span>
                </div>
            );
        } else if (line.match(/^\s*\d+\.\s/)) {
            const num = line.match(/^\s*(\d+)\./)[1];
            const listText = line.replace(/^\s*\d+\.\s/, '');
            elements.push(
                <div key={i} className="flex gap-2 ml-2 my-0.5">
                    <span className={`${bulletClr} font-medium shrink-0`}>{num}.</span>
                    <span>{renderInline(listText, dark)}</span>
                </div>
            );
        } else if (line.trim() === '') {
            elements.push(<div key={i} className="h-2" />);
        } else {
            elements.push(<p key={i} className="my-0.5">{renderInline(line, dark)}</p>);
        }
        i++;
    }
    return elements;
}

function renderInline(text, dark) {
    const boldClr = dark ? 'text-white' : 'text-gray-900';
    const codeClr = dark ? 'bg-white/10 text-indigo-300' : 'bg-indigo-50 text-indigo-700';
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className={`font-semibold ${boldClr}`}>{part.slice(2, -2)}</strong>;
        }
        const codeParts = part.split(/(`[^`]+`)/g);
        return codeParts.map((cp, j) => {
            if (cp.startsWith('`') && cp.endsWith('`')) {
                return <code key={`${i}-${j}`} className={`${codeClr} px-1.5 py-0.5 rounded text-[13px] font-mono`}>{cp.slice(1, -1)}</code>;
            }
            return cp;
        });
    });
}

/* ── Source Badge ─────────────────────────────────────── */
function SourceBadge({ source, dark }) {
    const name = source.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
    const icon = name.includes('fee') ? '💰' :
        name.includes('hostel') ? '🏠' :
            name.includes('placement') ? '💼' :
                name.includes('scholarship') ? '🎓' :
                    name.includes('ragging') ? '🛡️' : '📄';
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs backdrop-blur-sm ${dark ? 'bg-white/8 border border-white/10 text-white/60' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
            <span>{icon}</span>
            <span className="capitalize">{name}</span>
        </span>
    );
}

/* ── Animated Sun/Moon SVGs ──────────────────────────── */
function SunIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" className="origin-center animate-spin-slow" />
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    );
}

/* ── Floating Animated Shapes (decorative) ───────────── */
function FloatingShapes({ dark }) {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Blob 1 */}
            <div className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[100px] animate-float-1 ${dark ? 'bg-indigo-600/10' : 'bg-indigo-300/20'}`} />
            {/* Blob 2 */}
            <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-[90px] animate-float-2 ${dark ? 'bg-violet-600/8' : 'bg-pink-200/25'}`} />
            {/* Blob 3 */}
            <div className={`absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-[80px] animate-float-3 ${dark ? 'bg-blue-600/5' : 'bg-amber-200/20'}`} />
            {/* Small animated circles */}
            <div className={`absolute top-1/4 left-[15%] w-3 h-3 rounded-full animate-float-dot-1 ${dark ? 'bg-indigo-400/20' : 'bg-indigo-400/30'}`} />
            <div className={`absolute top-[60%] right-[20%] w-2 h-2 rounded-full animate-float-dot-2 ${dark ? 'bg-violet-400/20' : 'bg-pink-400/30'}`} />
            <div className={`absolute bottom-[30%] left-[40%] w-2.5 h-2.5 rounded-full animate-float-dot-3 ${dark ? 'bg-blue-400/15' : 'bg-amber-400/25'}`} />
        </div>
    );
}

/* ── Theme Transition Overlay ────────────────────────── */
function ThemeTransition({ active, isDark, origin }) {
    if (!active) return null;
    return (
        <div
            className="theme-transition-overlay"
            style={{
                '--origin-x': `${origin.x}px`,
                '--origin-y': `${origin.y}px`,
                '--bg-color': isDark ? '#0a0a12' : '#f8f7f4',
            }}
        />
    );
}

/* ── Main App ────────────────────────────────────────── */
function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dark, setDark] = useState(false);
    const [themeTransition, setThemeTransition] = useState({ active: false, isDark: false, origin: { x: 0, y: 0 } });
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const themeButtonRef = useRef(null);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    const toggleTheme = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const origin = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
        const newDark = !dark;
        setThemeTransition({ active: true, isDark: newDark, origin });
        setTimeout(() => {
            setDark(newDark);
        }, 400);
        setTimeout(() => {
            setThemeTransition({ active: false, isDark: newDark, origin });
        }, 900);
    };

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;
        const userMsg = text.trim();
        setInput('');
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: newMessages.slice(-6),
                })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.detail || `Server error: ${res.status}`);
            }
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer,
                sources: data.sources || [],
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Couldn't get a response right now. Please try again in a moment.`,
                sources: [],
                isError: true,
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };
    const clearChat = () => setMessages([]);

    // ── Theme-aware classes ──────────────────────────
    const bg = dark ? 'bg-[#0a0a12]' : 'bg-[#f8f7f4]';
    const text = dark ? 'text-white/90' : 'text-gray-800';
    const textMuted = dark ? 'text-white/40' : 'text-gray-400';
    const textSubtle = dark ? 'text-white/20' : 'text-gray-300';
    const cardBg = dark ? 'bg-white/[0.04]' : 'bg-white';
    const cardBorder = dark ? 'border-white/[0.08]' : 'border-gray-200/80';
    const inputBg = dark ? 'bg-[#12121a]' : 'bg-white';
    const inputText = dark ? 'text-white placeholder:text-white/25' : 'text-gray-800 placeholder:text-gray-400';
    const navBg = dark ? 'bg-[#0a0a12]/80' : 'bg-[#f8f7f4]/80';

    return (
        <div className={`min-h-screen ${bg} ${text} font-sans overflow-x-hidden transition-colors duration-500 selection:bg-indigo-500/30`}>

            <ThemeTransition {...themeTransition} />
            <FloatingShapes dark={dark} />

            {/* ── Floating Navbar ──────────────────────────── */}
            <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl z-50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
                <div className={`flex items-center justify-between px-5 py-3 rounded-2xl ${navBg} backdrop-blur-2xl border ${cardBorder} shadow-[0_2px_24px_rgba(0,0,0,0.06)] transition-colors duration-500`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/25 animate-logo-breathe">
                            Z
                        </div>
                        <div>
                            <h1 className="font-bold text-[16px] tracking-tight leading-tight">Zeno</h1>
                            <p className={`text-[10px] ${textMuted} font-medium tracking-wider uppercase leading-tight`}>College Assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {messages.length > 0 && (
                            <button onClick={clearChat} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${dark ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} transition-all cursor-pointer`}>
                                Clear
                            </button>
                        )}
                        {/* Animated Theme Toggle */}
                        <button
                            ref={themeButtonRef}
                            onClick={toggleTheme}
                            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer group ${dark ? 'bg-white/[0.06] hover:bg-white/[0.12] text-amber-300' : 'bg-gray-100 hover:bg-gray-200 text-indigo-600'}`}
                            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            <div className={`transition-all duration-500 ${dark ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'}`}>
                                <SunIcon />
                            </div>
                            <div className={`transition-all duration-500 ${!dark ? 'rotate-0 scale-100' : '-rotate-90 scale-0 absolute'}`}>
                                <MoonIcon />
                            </div>
                            {/* Ring animation on hover */}
                            <div className={`absolute inset-0 rounded-xl border-2 scale-100 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 ${dark ? 'border-amber-400/30' : 'border-indigo-400/30'}`} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Main Content ─────────────────────────────── */}
            <main className="relative pt-24 pb-6 px-4 max-w-3xl mx-auto flex flex-col min-h-screen z-10">

                {/* Hero */}
                {messages.length === 0 && (
                    <div className={`flex-1 flex flex-col justify-center items-center text-center py-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {/* Animated rings */}
                        <div className="relative mb-10">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/30 rotate-3 hover:rotate-0 transition-transform duration-500 animate-logo-breathe">
                                Z
                            </div>
                            <div className="absolute -inset-4 rounded-[28px] border-2 border-indigo-400/20 animate-ring-1" />
                            <div className="absolute -inset-8 rounded-[32px] border border-violet-400/10 animate-ring-2" />
                            <div className="absolute -inset-3 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 rounded-[28px] blur-2xl -z-10 animate-pulse-slow" />
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[1.1] mb-4">
                            <span className={dark ? 'text-white' : 'text-gray-800'}>Hey there! </span>
                            <span className="wave-emoji inline-block animate-wave">👋</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500">Ask me anything</span>
                        </h1>
                        <p className={`text-base md:text-lg ${textMuted} font-medium max-w-md mb-10 leading-relaxed`}>
                            Get instant answers about college fees, placements, hostel rules, scholarships, and more.
                        </p>

                        {/* Suggested Questions */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-w-xl w-full">
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q.text)}
                                    className={`group flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 active:scale-[0.97] cursor-pointer text-left animate-fade-in-up ${dark
                                        ? 'bg-white/[0.04] border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-indigo-500/30'
                                        : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm hover:shadow-md'
                                    }`}
                                    style={{ animationDelay: `${300 + i * 100}ms` }}
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform">{q.icon}</span>
                                    <span className="truncate font-medium">{q.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                {messages.length > 0 && (
                    <div className="flex-1 flex flex-col gap-1.5 py-4 animate-fade-in">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-down`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-3 mr-2.5 shadow-lg shadow-indigo-500/20">Z</div>
                                )}
                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed mb-1 ${msg.role === 'user'
                                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-br-md shadow-lg shadow-indigo-500/20'
                                    : msg.isError
                                        ? dark ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-md' : 'bg-red-50 border border-red-200 text-red-600 rounded-bl-md'
                                        : `${cardBg} border ${cardBorder} ${dark ? 'text-white/80' : 'text-gray-700'} rounded-bl-md ${!dark && 'shadow-sm'}`
                                    }`}>
                                    <div className={msg.role === 'assistant' ? 'prose-zeno' : 'whitespace-pre-wrap'}>
                                        {msg.role === 'assistant' ? renderMarkdown(msg.content, dark) : msg.content}
                                    </div>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className={`mt-3 pt-2.5 border-t ${dark ? 'border-white/[0.06]' : 'border-gray-100'} flex flex-wrap gap-1.5`}>
                                            <span className={`text-[10px] ${textSubtle} uppercase tracking-wider font-semibold mr-1 self-center`}>Sources</span>
                                            {msg.sources.map((s, si) => <SourceBadge key={si} source={s.source} dark={dark} />)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-start gap-2.5 animate-fade-in">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1 shadow-lg shadow-indigo-500/20">Z</div>
                                <div className={`${cardBg} border ${cardBorder} rounded-2xl rounded-bl-md px-4 py-3.5 flex items-center gap-2 ${!dark && 'shadow-sm'}`}>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className={`text-[11px] ${textMuted} ml-1`}>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Bar */}
                <div className={`sticky bottom-0 z-40 pb-4 pt-2 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ background: dark ? 'linear-gradient(to top, #0a0a12, #0a0a12ee, transparent)' : 'linear-gradient(to top, #f8f7f4, #f8f7f4ee, transparent)' }}>
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-500" />
                        <div className={`relative flex items-center ${inputBg} border ${cardBorder} rounded-2xl group-focus-within:border-indigo-400/50 transition-all duration-300 ${dark ? 'shadow-2xl shadow-black/40' : 'shadow-lg shadow-gray-200/60'}`}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about rules, placements, fees..."
                                className={`flex-1 bg-transparent pl-5 pr-4 py-4 text-[15px] ${inputText} focus:outline-none`}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="mr-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl px-4 py-2.5 font-semibold text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </button>
                        </div>
                    </form>
                    <p className={`text-center mt-2.5 text-[10px] font-medium tracking-[0.12em] uppercase ${dark ? 'text-white/15' : 'text-gray-300'}`}>
                        Powered by Zeno
                    </p>
                </div>
            </main>
        </div>
    );
}

export default App;
