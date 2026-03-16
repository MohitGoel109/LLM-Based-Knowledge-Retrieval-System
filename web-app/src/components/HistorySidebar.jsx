import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

function timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

function HistorySidebar({ sessions, activeSessionId, onLoadSession, onDeleteSession, onClearAll }) {
    const activeSessions = sessions?.filter((s) => s.messages && s.messages.length > 0) || [];

    const handleClearAll = () => {
        if (window.confirm('Clear all chat history? This cannot be undone.')) {
            if (onClearAll) onClearAll();
        }
    };

    return (
        <aside className="w-[320px] shrink-0 macos-glass border-l border-[var(--border-subtle)] h-full flex flex-col pt-6 pb-6 pr-6 rounded-br-[32px] overflow-hidden">
            <div className="flex items-center justify-between px-6 mb-6">
                <h2 className="text-[var(--text-heading)] font-bold text-lg">History</h2>
                <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                    {activeSessions.length}/50
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 relative scrollbar-hide">
                {activeSessions.length > 0 ? (
                    activeSessions.map((session) => (
                        <div
                            key={session.id}
                            className="group relative"
                        >
                            <button
                                onClick={() => onLoadSession(session.id)}
                                className={`w-full p-4 rounded-2xl text-left transition-all relative overflow-hidden ${activeSessionId === session.id
                                    ? 'bg-[var(--bg-elevated)] shadow-[0_4px_24px_rgba(0,0,0,0.3)] border border-[var(--border-default)] z-10'
                                    : 'bg-[var(--bg-surface)]/20 border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]/50'
                                    }`}
                            >
                                {/* Selected Indicator */}
                                <div className="absolute top-5 transition-all">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeSessionId === session.id ? 'border-[var(--accent)]' : 'border-[var(--text-muted)]'}`}>
                                        {activeSessionId === session.id && (
                                            <div className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                                        )}
                                    </div>
                                </div>

                                <div className="pl-6 pr-4">
                                    <h3 className="text-sm font-semibold text-[var(--text-heading)] truncate mb-1">
                                        {session.title}
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-2">
                                        {session.messages[session.messages.length - 1]?.content || 'Started a new conversation...'}
                                    </p>
                                    <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                                        {timeAgo(session.timestamp)}
                                    </span>
                                </div>
                            </button>

                            <button
                                className="absolute right-3 top-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(session.id);
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center pt-16">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mb-3">
                            <span className="text-2xl">💬</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] text-center">No history yet.</p>
                        <p className="text-xs text-[var(--text-muted)] text-center mt-1">Start a chat to see it here</p>
                    </div>
                )}
            </div>

            <div className="px-6 mt-4">
                <button
                    onClick={handleClearAll}
                    className="w-full py-3 rounded-2xl border border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold text-sm hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Clear history
                </button>
            </div>
        </aside>
    );
}

export default HistorySidebar;
