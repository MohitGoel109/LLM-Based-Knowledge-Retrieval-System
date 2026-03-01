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
function renderMarkdown(text) {
    if (!text) return null;
    const lines = text.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Headers
        if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-base font-bold mt-3 mb-1 text-white/90">{line.slice(4)}</h3>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-lg font-bold mt-3 mb-1 text-white/90">{line.slice(3)}</h2>);
        } else if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className="text-xl font-bold mt-3 mb-1 text-white/90">{line.slice(2)}</h1>);
        }
        // Bullet points
        else if (line.match(/^\s*[-•*]\s/)) {
            const bulletText = line.replace(/^\s*[-•*]\s/, '');
            elements.push(
                <div key={i} className="flex gap-2 ml-2 my-0.5">
                    <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
                    <span>{renderInline(bulletText)}</span>
                </div>
            );
        }
        // Numbered lists
        else if (line.match(/^\s*\d+\.\s/)) {
            const num = line.match(/^\s*(\d+)\./)[1];
            const listText = line.replace(/^\s*\d+\.\s/, '');
            elements.push(
                <div key={i} className="flex gap-2 ml-2 my-0.5">
                    <span className="text-indigo-400 font-medium shrink-0">{num}.</span>
                    <span>{renderInline(listText)}</span>
                </div>
            );
        }
        // Empty lines
        else if (line.trim() === '') {
            elements.push(<div key={i} className="h-2" />);
        }
        // Regular text
        else {
            elements.push(<p key={i} className="my-0.5">{renderInline(line)}</p>);
        }
        i++;
    }
    return elements;
}

function renderInline(text) {
    // Bold with **
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        // Inline code with backticks
        const codeParts = part.split(/(`[^`]+`)/g);
        return codeParts.map((cp, j) => {
            if (cp.startsWith('`') && cp.endsWith('`')) {
                return <code key={`${i}-${j}`} className="bg-white/10 px-1.5 py-0.5 rounded text-[13px] font-mono text-indigo-300">{cp.slice(1, -1)}</code>;
            }
            return cp;
        });
    });
}

/* ── Source Badge ─────────────────────────────────────── */
function SourceBadge({ source }) {
    const name = source.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
    const icon = name.includes('fee') ? '💰' :
        name.includes('hostel') ? '🏠' :
            name.includes('placement') ? '💼' :
                name.includes('scholarship') ? '🎓' :
                    name.includes('ragging') ? '🛡️' : '📄';
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/8 border border-white/10 text-xs text-white/60 backdrop-blur-sm">
            <span>{icon}</span>
            <span className="capitalize">{name}</span>
        </span>
    );
}

/* ── Status Indicator ────────────────────────────────── */
function StatusDot({ status }) {
    const isReady = status === 'online';
    return (
        <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
                {isReady && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isReady ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                {isReady ? 'Online' : 'Connecting...'}
            </span>
        </div>
    );
}

/* ── Main App ────────────────────────────────────────── */
function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Check server health
    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
                if (res.ok) {
                    const data = await res.json();
                    setServerStatus(data.ready ? 'online' : 'partial');
                }
            } catch {
                setServerStatus('offline');
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

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
                content: `⚠️ ${err.message || 'Could not connect to the backend. Make sure the server is running on port 8000.'}`,
                sources: [],
                isError: true,
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const clearChat = () => {
        setMessages([]);
        setSidebarOpen(false);
    };

    const messageCount = messages.filter(m => m.role === 'user').length;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white/90 font-sans overflow-hidden selection:bg-indigo-500/30">

            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/[0.07] rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/[0.03] rounded-full blur-[150px]" />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-72 bg-[#0e0e16]/95 backdrop-blur-2xl border-r border-white/[0.06] z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:z-30 flex flex-col`}>
                <div className="p-5 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">Z</div>
                            <div>
                                <h1 className="font-bold text-[15px] tracking-tight">Zeno</h1>
                                <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase">Knowledge Engine</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/40 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <button onClick={clearChat} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm text-white/70 hover:text-white transition-all group cursor-pointer">
                        <svg className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Chat
                    </button>

                    <div className="pt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/20 mb-2 px-1">Knowledge Base</p>
                        <div className="space-y-1">
                            {['📋 Anti-Ragging Policy', '💰 Fee Structure', '🏠 Hostel Rules', '💼 Placement Guidelines', '🎓 Scholarship Info'].map((doc, i) => (
                                <div key={i} className="px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors cursor-default">
                                    {doc}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-white/25 font-medium uppercase tracking-wider">Status</span>
                        <StatusDot status={serverStatus} />
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/[0.03] text-[11px] text-white/30">
                        <span className="text-white/50">{messageCount}</span> questions asked
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-72 relative flex flex-col min-h-screen">

                {/* Top bar (mobile) */}
                <div className="sticky top-0 z-30 md:hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5 text-white/50 cursor-pointer">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">Z</div>
                            <span className="font-bold text-sm">Zeno</span>
                        </div>
                        <StatusDot status={serverStatus} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 md:px-6">

                    {/* Hero — only show when no messages */}
                    {messages.length === 0 && (
                        <div className={`flex-1 flex flex-col justify-center items-center text-center py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {/* Animated logo */}
                            <div className="relative mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-3xl font-black shadow-2xl shadow-indigo-500/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                                    Z
                                </div>
                                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-xl -z-10 animate-pulse-slow" />
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[1.1] mb-4">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">Ask Zeno</span>
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">Anything</span>
                            </h1>
                            <p className="text-base md:text-lg text-white/40 font-medium max-w-md mb-10 leading-relaxed">
                                Your AI-powered college assistant. Get instant answers about fees, placements, hostel rules, scholarships & more.
                            </p>

                            {/* Suggested Questions */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-w-xl w-full">
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q.text)}
                                        className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all duration-200 active:scale-[0.97] cursor-pointer text-left"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        <span className="text-base group-hover:scale-110 transition-transform">{q.icon}</span>
                                        <span className="truncate">{q.text}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Tech stack pills */}
                            <div className="flex items-center gap-2 mt-10">
                                {['Ollama', 'LangChain', 'ChromaDB', 'FastAPI'].map((tech) => (
                                    <span key={tech} className="px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] font-medium text-white/25 uppercase tracking-wider">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.length > 0 && (
                        <div className="flex-1 flex flex-col gap-1 py-6 animate-fade-in">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-down`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-3 mr-2.5 shadow-lg shadow-indigo-500/20">Z</div>
                                    )}
                                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed mb-2 ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-md shadow-lg shadow-indigo-600/20'
                                        : msg.isError
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-bl-md'
                                            : 'bg-white/[0.05] border border-white/[0.08] text-white/80 rounded-bl-md'
                                        }`}>
                                        <div className={msg.role === 'assistant' ? 'prose-zeno' : 'whitespace-pre-wrap'}>
                                            {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                                        </div>
                                        {/* Sources */}
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                                                <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1 self-center">Sources</span>
                                                {msg.sources.map((s, si) => <SourceBadge key={si} source={s.source} />)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex items-start gap-2.5 animate-fade-in">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 shadow-lg shadow-indigo-500/20">Z</div>
                                    <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-bl-md px-4 py-3.5 flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                        <span className="text-[11px] text-white/25 ml-1">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className={`sticky bottom-0 z-40 pb-4 pt-2 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <form onSubmit={handleSubmit} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-500" />
                            <div className="relative flex items-center bg-[#12121a] border border-white/[0.08] rounded-2xl group-focus-within:border-indigo-500/30 transition-colors shadow-2xl shadow-black/40">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about rules, placements, fees..."
                                    className="flex-1 bg-transparent pl-5 pr-4 py-4 text-[15px] text-white placeholder:text-white/25 focus:outline-none"
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
                        <p className="text-center mt-2.5 text-[10px] font-medium tracking-[0.12em] uppercase text-white/15">
                            Powered by Zeno — RAG-based Knowledge Retrieval
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
