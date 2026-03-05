import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, MessageSquare, Clock, Zap, ChevronRight, Settings, GraduationCap, Trash2
} from 'lucide-react';
import KRMAILogo from './KRMAILogo';
import { CATEGORIES } from '../data/constants';

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

function Sidebar({ sidebarOpen, setSidebarOpen, isMobile, onSend, onNewSession, sessions, activeSessionId, onLoadSession, onDeleteSession }) {
    const activeSessions = sessions?.filter((s) => s.messages && s.messages.length > 0) || [];

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0, x: -50 }}
                        animate={{ width: 300, opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.15 }}
                        className="flex flex-col shrink-0 z-30 h-full overflow-hidden absolute md:relative bg-[#0f0c0a] border-r border-[rgba(255,255,255,0.06)]"
                    >
                        <div className="w-[300px] h-full flex flex-col">
                            {/* Header */}
                            <div className="px-5 pt-6 pb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <KRMAILogo size={36} />
                                    <span className="font-display text-xl text-white tracking-tight" style={{ textShadow: '0 0 20px rgba(255, 77, 0, 0.15)' }}>
                                        KRMAI
                                    </span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onNewSession}
                                    className="p-2 rounded-lg transition-all hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                >
                                    <Plus className="w-4.5 h-4.5" />
                                </motion.button>
                            </div>

                            {/* New Session Button */}
                            <div className="px-5 pb-4">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onNewSession}
                                    className="btn-accent w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px]"
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    Start New Session
                                </motion.button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-3 pb-6">
                                {/* Topics — now first */}
                                <div className="mb-1">
                                    <h4 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] flex items-center gap-2 text-[var(--text-muted)]">
                                        <Zap size={12} /> Topics
                                    </h4>
                                    <div className="space-y-0.5">
                                        {CATEGORIES.map((cat, i) => {
                                            const Icon = cat.icon;
                                            return (
                                                <motion.button
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
                                                    whileHover={{ scale: 1.03, x: 4 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        onSend(`Tell me about ${cat.name}`);
                                                        if (isMobile) setSidebarOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left group text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)]"
                                                >
                                                    <motion.div
                                                        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                                                        transition={{ duration: 0.4 }}
                                                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(255,77,0,0.2)]`}
                                                    >
                                                        <Icon className="w-3.5 h-3.5 text-white" />
                                                    </motion.div>
                                                    <span className="truncate flex-1">
                                                        {cat.name}
                                                    </span>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-all group-hover:translate-x-0.5 text-[#ff4d00]" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="mx-3 my-3 border-t border-[var(--border-subtle)]" />

                                {/* Chat History — now second */}
                                <div className="mb-1">
                                    <h4 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] flex items-center gap-2 text-[var(--text-muted)]">
                                        <Clock size={12} /> History
                                    </h4>
                                    <div className="space-y-0.5">
                                        {activeSessions.length > 0 ? (
                                            activeSessions.map((session) => (
                                                <motion.div
                                                    key={session.id}
                                                    className="group relative"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            onLoadSession(session.id);
                                                            if (isMobile) setSidebarOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${activeSessionId === session.id
                                                                ? 'bg-[rgba(255,77,0,0.08)] text-white border-l-2 border-[#ff4d00] pl-2.5'
                                                                : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)]'
                                                            }`}
                                                    >
                                                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${activeSessionId === session.id ? 'text-[#ff4d00]' : 'opacity-40'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="truncate block text-[13px] leading-tight">{session.title}</span>
                                                            <span className="text-[10px] text-[var(--text-muted)] leading-none">{timeAgo(session.timestamp)}</span>
                                                        </div>
                                                    </button>
                                                    <button
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:bg-red-500/15 transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteSession(session.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3 text-red-400" />
                                                    </button>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-[11px] text-[var(--text-muted)] px-3 py-1.5 italic">No conversations yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#ff4d00] flex items-center justify-center">
                                        <span className="text-white font-bold text-[10px]">KR</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-semibold text-white leading-tight">
                                            Student
                                        </span>
                                        <span className="text-[9px] font-medium tracking-wider uppercase text-[var(--text-muted)] leading-tight">
                                            KR Mangalam
                                        </span>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-[var(--bg-surface)] transition-all"
                                >
                                    <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
                                </motion.button>
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
                        className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default Sidebar;
