import React, { useState, useRef, useEffect } from 'react';

function App() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello. I am the College Knowledge Assistant. Ask me anything about our rules, documents, or placement criteria.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Animation state for the hero entrance
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
        scrollToBottom();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();

            let content = data.answer;
            if (data.sources && data.sources.length > 0) {
                content += '\n\n---\n**Sources:**\n';
                data.sources.forEach(src => {
                    content += `- ${src.source} ${src.page ? `(Page ${src.page})` : ''}\n`;
                });
            }

            setMessages(prev => [...prev, { role: 'assistant', content }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Connection error. Please ensure the backend is running.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-light text-surface-dark font-sans overflow-x-hidden selection:bg-surface-dark selection:text-surface-light">

            {/* Abstract Background Accent (subtle) */}
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-pink/10 mix-blend-multiply blur-3xl opacity-50 pointer-events-none animate-pulse-slow"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent-blue/10 mix-blend-multiply blur-3xl opacity-50 pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            {/* Floating Navigation */}
            <nav className={`fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="mx-auto flex items-center justify-between px-6 py-4 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-surface-dark flex items-center justify-center text-white text-sm">
                            🎓
                        </div>
                        <span className="font-bold tracking-tight text-lg">College AI.</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-surface-dark/60 uppercase tracking-widest text-[10px]">System Online</span>
                    </div>
                </div>
            </nav>

            <main className="relative pt-32 pb-20 px-4 max-w-5xl mx-auto flex flex-col min-h-screen">

                {/* Minimal Hero Section */}
                <div className="mb-12 mt-10 md:mt-20 max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-6 animate-fade-in-up">
                        Instant answers <br className="hidden md:block" />
                        for <span className="text-transparent bg-clip-text bg-gradient-to-r from-surface-dark to-surface-dark/50">college rules.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-surface-dark/70 font-medium leading-relaxed max-w-xl animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                        Built to redefine how students retrieve documents, placement criteria, and academic policies.
                    </p>
                </div>

                {/* Chat Interface Container - Minimalist Card */}
                <div
                    className="flex-1 w-full bg-surface-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-surface-dark/5 flex flex-col overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: '300ms' }}
                >

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-down`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[75%] rounded-[1.5rem] p-5 sm:p-6 text-[15px] sm:text-base leading-relaxed ${msg.role === 'user'
                                            ? 'bg-surface-dark text-white rounded-br-sm shadow-md'
                                            : 'bg-surface-light text-surface-dark rounded-bl-sm border border-surface-dark/5'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap font-medium">
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-surface-light text-surface-dark border border-surface-dark/5 rounded-[1.5rem] rounded-bl-sm p-6 flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-surface-dark/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-surface-dark/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-surface-dark/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 sm:p-6 bg-surface-white border-t border-surface-dark/5">
                        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about placement criteria, attendance rules..."
                                className="w-full bg-surface-light/50 border border-surface-dark/10 rounded-full pl-6 pr-32 py-4 text-base font-medium text-surface-dark placeholder:text-surface-dark/40 focus:outline-none focus:ring-2 focus:ring-surface-dark/20 focus:bg-surface-white transition-all shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface-dark hover:bg-black text-white rounded-full px-6 py-2.5 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-md flex items-center gap-2"
                            >
                                Send <span className="hidden sm:inline">→</span>
                            </button>
                        </form>
                        <div className="text-center mt-4">
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-surface-dark/40">
                                Responses based on official college documents
                            </span>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default App;
