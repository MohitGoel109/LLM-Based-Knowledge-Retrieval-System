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

/* ── Markdown renderer ───────────────────────────────── */
function renderMarkdown(text, dark) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let i = 0;
    const headClr = dark ? 'text-gray-100' : 'text-gray-900';
    const dotClr = dark ? 'text-gray-500' : 'text-gray-400';

    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith('### '))
            elements.push(<h3 key={i} className={`text-sm font-semibold mt-3 mb-1 ${headClr}`}>{line.slice(4)}</h3>);
        else if (line.startsWith('## '))
            elements.push(<h2 key={i} className={`text-base font-semibold mt-3 mb-1 ${headClr}`}>{line.slice(3)}</h2>);
        else if (line.startsWith('# '))
            elements.push(<h1 key={i} className={`text-lg font-semibold mt-3 mb-1 ${headClr}`}>{line.slice(2)}</h1>);
        else if (line.match(/^\s*[-•*]\s/)) {
            const t = line.replace(/^\s*[-•*]\s/, '');
            elements.push(
                <div key={i} className="flex gap-2 ml-1 my-0.5">
                    <span className={`${dotClr} mt-0.5 shrink-0 text-[10px]`}>●</span>
                    <span>{renderInline(t, dark)}</span>
                </div>
            );
        } else if (line.match(/^\s*\d+\.\s/)) {
            const num = line.match(/^\s*(\d+)\./)[1];
            const t = line.replace(/^\s*\d+\.\s/, '');
            elements.push(
                <div key={i} className="flex gap-2 ml-1 my-0.5">
                    <span className={`${dotClr} font-medium shrink-0 text-xs`}>{num}.</span>
                    <span>{renderInline(t, dark)}</span>
                </div>
            );
        } else if (line.trim() === '')
            elements.push(<div key={i} className="h-2" />);
        else
            elements.push(<p key={i} className="my-0.5 leading-relaxed">{renderInline(line, dark)}</p>);
        i++;
    }
    return elements;
}

function renderInline(text, dark) {
    const boldClr = dark ? 'text-gray-100' : 'text-gray-900';
    const codeClr = dark ? 'bg-gray-700/60 text-gray-200' : 'bg-gray-100 text-gray-700';
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={i} className={`font-semibold ${boldClr}`}>{part.slice(2, -2)}</strong>;
        const codeParts = part.split(/(`[^`]+`)/g);
        return codeParts.map((cp, j) => {
            if (cp.startsWith('`') && cp.endsWith('`'))
                return <code key={`${i}-${j}`} className={`${codeClr} px-1 py-0.5 rounded text-[13px] font-mono`}>{cp.slice(1, -1)}</code>;
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
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs ${dark ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            <span className="text-[11px]">{icon}</span>
            <span className="capitalize">{name}</span>
        </span>
    );
}

/* ── Theme toggle icons ──────────────────────────────── */
function SunIcon() {
    return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    );
}

/* ── Theme Transition Overlay ────────────────────────── */
function ThemeOverlay({ active, isDark, origin }) {
    if (!active) return null;
    return (
        <div
            className="theme-transition-overlay"
            style={{
                '--origin-x': `${origin.x}px`,
                '--origin-y': `${origin.y}px`,
                '--bg-color': isDark ? '#1a1a1a' : '#ffffff',
            }}
        />
    );
}

/* ── Main App ────────────────────────────────────────── */
function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [dark, setDark] = useState(false);
    const [transition, setTransition] = useState({ active: false, isDark: false, origin: { x: 0, y: 0 } });
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

    const scrollDown = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollDown(); }, [messages, scrollDown]);

    const toggleTheme = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        const next = !dark;
        setTransition({ active: true, isDark: next, origin });
        setTimeout(() => setDark(next), 350);
        setTimeout(() => setTransition({ active: false, isDark: next, origin }), 850);
    };

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
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.detail || `Server error: ${res.status}`);
            }
            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer,
                sources: data.sources || [],
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Couldn't get a response right now. Please try again in a moment.",
                sources: [],
                isError: true,
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const submit = (e) => { e.preventDefault(); send(input); };

    /* ── theme tokens ──────────────────────────────────── */
    const t = {
        page: dark ? 'bg-[#1a1a1a]' : 'bg-white',
        text: dark ? 'text-gray-200' : 'text-gray-800',
        muted: dark ? 'text-gray-500' : 'text-gray-400',
        faint: dark ? 'text-gray-600' : 'text-gray-300',
        card: dark ? 'bg-[#232323]' : 'bg-[#f7f7f5]',
        border: dark ? 'border-[#333]' : 'border-gray-200',
        inputBg: dark ? 'bg-[#232323]' : 'bg-[#f7f7f5]',
        inputBorder: dark ? 'border-[#444]' : 'border-gray-300',
        inputFocusBorder: dark ? 'focus-within:border-gray-500' : 'focus-within:border-gray-400',
        inputText: dark ? 'text-gray-100 placeholder:text-gray-600' : 'text-gray-800 placeholder:text-gray-400',
        userBubble: dark ? 'bg-[#303030] text-gray-100' : 'bg-[#f0f0ee] text-gray-800',
        botBubble: dark ? 'text-gray-300' : 'text-gray-700',
        errBubble: dark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600',
        hover: dark ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-50',
        gradient: dark ? 'from-[#1a1a1a]' : 'from-white',
    };

    return (
        <div className={`min-h-screen ${t.page} ${t.text} font-sans transition-colors duration-500`}>

            <ThemeOverlay {...transition} />

            {/* ── Header ──────────────────────────────────── */}
            <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                <div className={`mx-auto max-w-3xl flex items-center justify-between px-5 py-3 ${t.page} transition-colors duration-500`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${dark ? 'bg-gray-200 text-gray-900' : 'bg-gray-900 text-white'} transition-colors duration-500`}>
                            Z
                        </div>
                        <span className="font-semibold text-[15px] tracking-tight">Zeno</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                onClick={() => setMessages([])}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${t.muted} ${t.hover} transition-colors cursor-pointer`}
                            >
                                New chat
                            </button>
                        )}
                        <button
                            onClick={toggleTheme}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.muted} ${t.hover} transition-all duration-300 cursor-pointer`}
                            title={dark ? 'Light mode' : 'Dark mode'}
                        >
                            <div className={`transition-all duration-400 ${dark ? 'rotate-0 scale-100' : 'rotate-180 scale-0 absolute'}`}><SunIcon /></div>
                            <div className={`transition-all duration-400 ${!dark ? 'rotate-0 scale-100' : '-rotate-180 scale-0 absolute'}`}><MoonIcon /></div>
                        </button>
                    </div>
                </div>
                <div className={`mx-auto max-w-3xl h-px ${dark ? 'bg-[#333]' : 'bg-gray-100'} transition-colors duration-500`} />
            </header>

            {/* ── Main ────────────────────────────────────── */}
            <main className="mx-auto max-w-3xl px-5 pt-16 pb-4 flex flex-col min-h-screen">

                {/* ── Welcome screen ──────────────────────── */}
                {messages.length === 0 && (
                    <div className={`flex-1 flex flex-col justify-center items-center text-center pb-20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold mb-8 ${dark ? 'bg-gray-200 text-gray-900' : 'bg-gray-900 text-white'} transition-colors duration-500`}>
                            Z
                        </div>

                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                            What do you want to know?
                        </h1>
                        <p className={`text-sm ${t.muted} max-w-sm mb-10 leading-relaxed`}>
                            Ask about college fees, placements, hostel rules, scholarships, and more.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-lg w-full">
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => send(q.text)}
                                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] text-left transition-all duration-150 active:scale-[0.98] cursor-pointer animate-fade-in-up ${dark
                                        ? `border-[#333] ${t.muted} hover:text-gray-200 hover:border-gray-500 hover:bg-[#232323]`
                                        : `border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50`
                                    }`}
                                    style={{ animationDelay: `${150 + i * 60}ms` }}
                                >
                                    <span className="text-sm shrink-0">{q.icon}</span>
                                    <span className="truncate">{q.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Messages ────────────────────────────── */}
                {messages.length > 0 && (
                    <div className="flex-1 flex flex-col gap-6 pt-6 pb-2 animate-fade-in">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="animate-slide-down">
                                {msg.role === 'user' ? (
                                    /* ── User message ── */
                                    <div className="flex justify-end">
                                        <div className={`max-w-[80%] md:max-w-[70%] rounded-3xl rounded-br-lg px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap ${t.userBubble}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Assistant message ── */
                                    <div className="flex gap-3">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${dark ? 'bg-gray-200 text-gray-900' : 'bg-gray-900 text-white'}`}>Z</div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-[14px] leading-relaxed ${msg.isError ? t.errBubble + ' rounded-xl px-3 py-2' : t.botBubble}`}>
                                                <div className="prose-zeno">
                                                    {renderMarkdown(msg.content, dark)}
                                                </div>
                                            </div>
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                                    <span className={`text-[10px] ${t.faint} uppercase tracking-wider font-medium`}>Sources</span>
                                                    {msg.sources.map((s, si) => <SourceBadge key={si} source={s.source} dark={dark} />)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3 animate-fade-in">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${dark ? 'bg-gray-200 text-gray-900' : 'bg-gray-900 text-white'}`}>Z</div>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0ms' }} />
                                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '150ms' }} />
                                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}

                {/* ── Input ───────────────────────────────── */}
                <div className={`sticky bottom-0 z-40 pb-3 pt-3 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* fade gradient */}
                    <div className={`absolute inset-x-0 -top-8 h-8 bg-gradient-to-t ${t.gradient} to-transparent pointer-events-none`} />
                    <form onSubmit={submit} className="relative">
                        <div className={`flex items-center ${t.inputBg} border ${t.inputBorder} ${t.inputFocusBorder} rounded-2xl transition-colors duration-200 shadow-sm`}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className={`flex-1 bg-transparent px-4 py-3.5 text-[14px] ${t.inputText} focus:outline-none`}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className={`mr-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed active:scale-90 cursor-pointer ${dark
                                    ? 'bg-gray-200 text-gray-900 hover:bg-white'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </form>
                    <p className={`text-center mt-2 text-[10px] ${t.faint} tracking-wide`}>
                        Zeno can make mistakes. Verify important info.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default App;
