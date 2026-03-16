import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Home, Search, Bell, X } from 'lucide-react';
import KRMAILogo from './KRMAILogo';

function ChatHeader({ sidebarOpen, setSidebarOpen, loading, onGoHome, messages }) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    // Filter messages by search query
    const searchResults = searchQuery.trim()
        ? (messages || []).filter((m) =>
            m.content.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    return (
        <header className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-5 md:px-8 z-20 select-none bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg transition-all hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                    <PanelLeft className="w-5 h-5" />
                </motion.button>

                <h1 className="text-[15px] font-semibold text-[var(--text-heading)]">
                    KRMAI
                </h1>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                        <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider">Thinking</span>
                    </motion.div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                    <AnimatePresence>
                        {searchOpen ? (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 240, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-[var(--text-secondary)] text-sm overflow-hidden focus-within:border-[var(--accent)]/40"
                            >
                                <Search className="w-4 h-4 shrink-0 text-[var(--text-muted)]" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search messages..."
                                    className="bg-transparent outline-none border-none w-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm"
                                />
                                <button
                                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                    className="shrink-0 p-0.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="hidden md:flex p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        )}
                    </AnimatePresence>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {searchOpen && searchResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute top-full right-0 mt-2 w-80 max-h-60 overflow-y-auto rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-xl z-50"
                            >
                                {searchResults.map((msg, i) => (
                                    <div key={i} className="px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                                            {msg.role === 'user' ? 'You' : 'KRMAI'}
                                        </span>
                                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-0.5">{msg.content}</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
                    </button>

                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-72 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-xl z-50 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                                    <h3 className="text-sm font-semibold text-[var(--text-heading)]">Notifications</h3>
                                </div>
                                <div className="p-3 space-y-2">
                                    <div className="px-3 py-2.5 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                                        <p className="text-xs font-medium text-[var(--text-heading)]">🎉 Welcome to KRMAI v1.0!</p>
                                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Ask anything about KR Mangalam University</p>
                                    </div>
                                    <div className="px-3 py-2.5 rounded-lg bg-[var(--bg-surface)]">
                                        <p className="text-xs font-medium text-[var(--text-heading)]">💡 Try voice input</p>
                                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Click the mic button to ask questions by voice</p>
                                    </div>
                                    <div className="px-3 py-2.5 rounded-lg bg-[var(--bg-surface)]">
                                        <p className="text-xs font-medium text-[var(--text-heading)]">🌙 Dark/Light theme</p>
                                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Switch themes in Settings → Appearance</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button onClick={onGoHome} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block">
                    <Home className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

export default ChatHeader;
