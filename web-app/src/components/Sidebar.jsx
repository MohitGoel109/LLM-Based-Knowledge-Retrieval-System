import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar as SidebarIcon, Plus, Zap, ChevronRight, Settings, HelpCircle, LogOut, BookOpen, FolderKanban } from 'lucide-react';
import KRMAILogo from './KRMAILogo';
import { CATEGORIES } from '../data/constants';

function Sidebar({ sidebarOpen, setSidebarOpen, isMobile, onNewSession, onSend, onNavigate }) {

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0, x: -50 }}
                        animate={{ width: 280, opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.15 }}
                        className="flex flex-col shrink-0 z-30 h-full overflow-hidden absolute md:relative macos-glass border-r border-[var(--border-subtle)] rounded-l-[32px] md:rounded-l-none"
                    >
                        <div className="w-[280px] h-full flex flex-col pt-8 pb-6 px-5 relative">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pl-1">
                                <div className="flex items-center gap-2.5">
                                    <KRMAILogo size={32} />
                                    <span className="font-display font-semibold text-xl tracking-tight text-[var(--text-heading)] drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                                        KRMAI
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                                >
                                    <SidebarIcon size={18} />
                                </button>
                            </div>

                            {/* Main Navigation */}
                            <div className="space-y-1 mb-2 flex-1 overflow-y-auto">
                                <button onClick={onNewSession} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)]/20 to-transparent text-[var(--accent)] font-bold text-sm transition-colors mb-4 border border-[var(--accent)]/30 hover:bg-[var(--accent)]/30 shadow-[0_4px_16px_rgba(59,130,246,0.1)]">
                                    <Plus size={18} />
                                    Start New Session
                                </button>

                                <div className="mt-4 mb-2">
                                    <h4 className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] flex items-center gap-2 text-[var(--text-muted)]">
                                        <Zap size={12} /> Suggestion Prompts
                                    </h4>
                                    <div className="space-y-0.5">
                                        {CATEGORIES.map((cat, i) => {
                                            const Icon = cat.icon;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        if (onSend) onSend(`Tell me about ${cat.name}`);
                                                        if (isMobile) setSidebarOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all text-left group text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                                                >
                                                    <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                                                    <span className="truncate flex-1">{cat.name}</span>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 text-[var(--accent)]" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Student Projects - now a clickable nav link */}
                                <div className="mt-6 mb-2">
                                    <button
                                        onClick={() => {
                                            if (onNavigate) onNavigate('projects');
                                            if (isMobile) setSidebarOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all text-left group text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FolderKanban className="w-4 h-4 text-[var(--accent)]" />
                                            <span>Student Projects</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 mb-6">
                                <button
                                    onClick={() => {
                                        if (onNavigate) onNavigate('settings');
                                        if (isMobile) setSidebarOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium text-sm transition-colors group"
                                >
                                    <Settings size={18} className="group-hover:text-[var(--accent)] transition-colors" />
                                    Settings
                                </button>
                                <button
                                    onClick={() => {
                                        if (onNavigate) onNavigate('updates');
                                        if (isMobile) setSidebarOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium text-sm transition-colors group"
                                >
                                    <HelpCircle size={18} className="group-hover:text-[var(--accent)] transition-colors" />
                                    Updates & FAQ
                                </button>
                            </div>

                            {/* Sign In Box */}
                            <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-elevated)] p-5 border border-[var(--border-subtle)]">
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-3">
                                        <LogOut size={16} className="text-[var(--accent)] ml-0.5" />
                                    </div>
                                    <h3 className="font-bold text-sm mb-1 text-[var(--text-heading)]">Sign in to sync</h3>
                                    <p className="text-[var(--text-muted)] text-[11px] mb-4 leading-relaxed max-w-[160px]">
                                        Save your chat history & preferences across devices.
                                    </p>
                                    <button
                                        onClick={() => {
                                            alert('Sign in functionality coming soon! For now, your data is saved locally in your browser.');
                                        }}
                                        className="w-full bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-[13px] font-bold shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:bg-[var(--accent-hover)] transition-all"
                                    >
                                        Sign In
                                    </button>
                                </div>
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
