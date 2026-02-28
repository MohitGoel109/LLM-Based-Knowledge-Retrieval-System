import React, { useState, useRef, useEffect } from 'react';

const SUGGESTED_QUESTIONS = [
    "What's the attendance policy?",
    "Tell me about placements",
    "What are the hostel timings?",
    "Scholarship eligibility?",
    "Fee structure details",
    "Anti-ragging helpline?",
];

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text) => {
        if (!text.trim() || loading) return;

        const userMsg = text.trim();
        setInput('');
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: newMessages.slice(-6),
                })
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();

            let content = data.answer;
            if (data.sources && data.sources.length > 0) {
                content += '\n\n📎 Sources: ';
                content += data.sources.map(s => s.source).join(', ');
            }

            setMessages(prev => [...prev, { role: 'assistant', content }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Could not connect to the backend. Make sure the server is running on port 8000.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestionClick = (q) => {
        sendMessage(q);
    };

    return (
        <div className="min-h-screen bg-surface-light text-surface-dark font-sans overflow-x-hidden selection:bg-surface-dark selection:text-surface-light">

            {/* Subtle gradient blobs */}
            <div className="fixed top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-accent-pink/8 blur-3xl pointer-events-none animate-pulse-slow"></div>
            <div className="fixed bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-accent-blue/8 blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            {/* Floating Nav */}
            <nav className={`fixed top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}>
                <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/30 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-surface-dark flex items-center justify-center text-white text-sm">🎓</div>
                        <span className="font-bold tracking-tight text-[17px]">College AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-surface-dark/50 font-semibold uppercase tracking-[0.15em] text-[10px]">Online</span>
                    </div>
                </div>
            </nav>

            <main className="relative pt-28 pb-8 px-4 max-w-4xl mx-auto flex flex-col min-h-screen">

                {/* Hero — only show when no messages */}
                {messages.length === 0 && (
                    <div className={`flex-1 flex flex-col justify-center items-center text-center transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.04em] leading-[1.05] mb-5">
                            Ask anything<br />
                            <span className="text-surface-dark/40">about college.</span>
                        </h1>
                        <p className="text-lg text-surface-dark/55 font-medium max-w-md mb-10 leading-relaxed">
                            Rules, placements, fees, scholarships — get instant answers from official documents.
                        </p>

                        {/* Suggested Questions Grid */}
                        <div className="flex flex-wrap justify-center gap-2.5 max-w-lg mb-12"
                            style={{ animationDelay: '200ms' }}>
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(q)}
                                    className="px-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-sm border border-surface-dark/8 text-sm font-medium text-surface-dark/70 hover:bg-surface-dark hover:text-white hover:border-surface-dark transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-sm cursor-pointer"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Messages */}
                {messages.length > 0 && (
                    <div className="flex-1 flex flex-col gap-5 mb-6 animate-fade-in">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-down`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed ${msg.role === 'user'
                                        ? 'bg-surface-dark text-white rounded-br-lg shadow-lg'
                                        : 'bg-white border border-surface-dark/8 text-surface-dark rounded-bl-lg shadow-sm'
                                    }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-white border border-surface-dark/8 rounded-2xl rounded-bl-lg px-5 py-4 flex items-center gap-1.5 shadow-sm">
                                    <div className="w-2 h-2 bg-surface-dark/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-surface-dark/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-surface-dark/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Bar — always at bottom */}
                <div className={`sticky bottom-4 z-40 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ animationDelay: '300ms' }}>
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about rules, placements, fees..."
                            className="w-full bg-white/80 backdrop-blur-2xl border border-surface-dark/10 rounded-2xl pl-5 pr-28 py-4 text-[15px] font-medium text-surface-dark placeholder:text-surface-dark/35 focus:outline-none focus:ring-2 focus:ring-surface-dark/15 focus:border-surface-dark/20 focus:bg-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-dark hover:bg-black text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                            Send <span>→</span>
                        </button>
                    </form>
                    <p className="text-center mt-3 text-[11px] font-semibold tracking-[0.12em] uppercase text-surface-dark/30">
                        Powered by college documents • Conversation-aware
                    </p>
                </div>
            </main>
        </div>
    );
}

export default App;
