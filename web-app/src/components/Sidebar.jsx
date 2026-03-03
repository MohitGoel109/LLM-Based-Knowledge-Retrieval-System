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
    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0, x: -50 }}
                        animate={{ width: 320, opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.15 }}
                        className="flex flex-col shrink-0 z-30 h-full overflow-hidden absolute md:relative bg-[var(--bg-base)] border-r border-[rgba(255,255,255,0.04)]"
                    >
                        <div className="w-[320px] h-full flex flex-col pt-2">
                            {/* Header */}
                            <div className="px-6 py-7 flex items-center justify-between">
                                <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <KRMAILogo size={40} />
                                    <span className="font-display text-2xl text-white tracking-tight">
                                        KRMAI
                                    </span>
                                </motion.div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onNewSession}
                                    className="p-2.5 rounded-xl transition-all bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                                >
                                    <Plus className="w-5 h-5 text-[var(--text-secondary)]" />
                                </motion.button>
                            </div>

                            {/* New Session Button */}
                            <div className="px-6 pb-5">
                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onNewSession}
                                    className="btn-accent w-full flex items-center justify-center gap-2 px-5 py-3.5 text-[14px]"
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    Start New Session
                                </motion.button>
                            </div>

                            {/* Scrollable List */}
                            <div className="flex-1 overflow-y-auto px-6 space-y-7 pb-10">
                                {/* Chat History (Dynamic) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h4 className="px-2 text-[12px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-[var(--text-muted)]">
                                        <Clock size={13} /> History
                                    </h4>
                                    <div className="space-y-1">
                                        {sessions && sessions.length > 0 ? (
                                            sessions
                                                .filter((s) => s.messages && s.messages.length > 0)
                                                .map((session) => (
                                                    <motion.div
                                                        key={session.id}
                                                        className="group relative"
                                                    >
                                                        <motion.button
                                                            whileHover={{
                                                                x: 4,
                                                                backgroundColor: 'var(--bg-surface)',
                                                            }}
                                                            whileTap={{ scale: 0.97 }}
                                                            onClick={() => {
                                                                onLoadSession(session.id);
                                                                if (isMobile) setSidebarOpen(false);
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left text-[var(--text-secondary)] hover:text-white ${activeSessionId === session.id ? 'bg-[var(--bg-surface)] text-white border-l-2 border-[#ff4d00]' : ''}`}
                                                        >
                                                            <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />
                                                            <div className="flex-1 min-w-0">
                                                                <span className="truncate block">{session.title}</span>
                                                                <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(session.timestamp)}</span>
                                                            </div>
                                                        </motion.button>
                                                        <motion.button
                                                            initial={{ opacity: 0 }}
                                                            whileHover={{ opacity: 1, scale: 1.1 }}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-red-500/20 transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteSession(session.id);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                        </motion.button>
                                                    </motion.div>
                                                ))
                                        ) : (
                                            <p className="text-[12px] text-[var(--text-muted)] px-3 py-2">No conversations yet</p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Categories */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h4 className="px-2 text-[12px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 text-[var(--text-muted)]">
                                        <Zap size={13} /> Topics
                                    </h4>
                                    <div className="space-y-1.5">
                                        {CATEGORIES.map((cat, i) => {
                                            const Icon = cat.icon;
                                            return (
                                                <motion.button
                                                    key={i}
                                                    whileHover={{ scale: 1.02, x: 3 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => {
                                                        onSend(`Tell me about ${cat.name}`);
                                                        if (isMobile) setSidebarOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-all text-left group text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)]"
                                                >
                                                    <div
                                                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0 shadow-md`}
                                                    >
                                                        <Icon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="truncate flex-1">
                                                        {cat.name}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-[var(--border-subtle)] mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                                    <div className="w-9 h-9 rounded-full bg-[#ff4d00] flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">KR</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white">
                                            Student
                                        </span>
                                        <span className="text-[10px] font-medium tracking-wider uppercase text-[var(--text-muted)]">
                                            KR Mangalam
                                        </span>
                                    </div>
                                </div>
                                <motion.div
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.3 }}
                                    className="cursor-pointer opacity-50 hover:opacity-100"
                                >
                                    <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
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
                        className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

export default Sidebar;
