import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar as SidebarIcon, MessageSquare, Plus, Zap, ChevronRight, Settings, HelpCircle, LogOut } from 'lucide-react';
import KRMAILogo from './KRMAILogo';
import { CATEGORIES } from '../data/constants';

const STUDENT_PROJECTS = [
    { name: "KRMAI Smart Campus", icon: Zap, status: "Live" },
    { name: "Library AI Connect", icon: BookOpen, status: "Beta" },
    { name: "Hostel Matcher", icon: HelpCircle, status: "Demo" }
];

function Sidebar({ sidebarOpen, setSidebarOpen, isMobile, onNewSession, onSend }) {

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
                                    <span className="font-display font-semibold text-xl tracking-tight text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                                        KRMAI
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <SidebarIcon size={18} />
                                </button>
                            </div>

                            {/* Main Navigation */}
                            <div className="space-y-1 mb-2">
                                <button onClick={onNewSession} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#3b82f6]/20 to-transparent text-[#3b82f6] font-bold text-sm transition-colors mb-4 border border-[#3b82f6]/30 hover:bg-[#3b82f6]/30 shadow-[0_4px_16px_rgba(59, 130, 246,0.1)]">
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
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all text-left group text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)]"
                                                >
                                                    <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#10b981] transition-colors" />
                                                    <span className="truncate flex-1">
                                                        {cat.name}
                                                    </span>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 text-[#10b981]" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mt-6 mb-2">
                                    <h4 className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] flex items-center gap-2 text-[var(--text-muted)]">
                                        <SidebarIcon size={12} /> Student Projects
                                    </h4>
                                    <div className="space-y-0.5">
                                        {STUDENT_PROJECTS.map((proj, i) => {
                                            const Icon = proj.icon;
                                            return (
                                                <button
                                                    key={`proj-${i}`}
                                                    onClick={() => {
                                                        if (onSend) onSend(`Tell me about the ${proj.name} project`);
                                                        if (isMobile) setSidebarOpen(false);
                                                    }}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all text-left group text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)]"
                                                >
                                                    <div className="flex items-center gap-3 truncate">
                                                        <Icon className="w-4 h-4 text-[#10b981]/70 group-hover:text-[#10b981] transition-colors" />
                                                        <span className="truncate">{proj.name}</span>
                                                    </div>
                                                    <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[#10b981]">
                                                        {proj.status}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-1 mb-6">
                                <NavItem icon={<Settings size={18} />} label="Settings" />
                                <NavItem icon={<HelpCircle size={18} />} label="Updates & FAQ" />
                            </div>

                            {/* Sign In Box */}
                            <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-elevated)] p-5 border border-[var(--border-subtle)]">
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-3">
                                        <LogOut size={16} className="text-[#10b981] ml-0.5" />
                                    </div>
                                    <h3 className="font-bold text-sm mb-1 text-white">Sign in to sync</h3>
                                    <p className="text-gray-400 text-[11px] mb-4 leading-relaxed max-w-[160px]">
                                        Save your chat history & preferences across devices.
                                    </p>
                                    <button className="w-full bg-[#3b82f6] text-gray-900 px-4 py-2 rounded-xl text-[13px] font-bold shadow-[0_4px_12px_rgba(59, 130, 246,0.3)] hover:bg-[#60a5fa] transition-all">
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

function NavItem({ icon, label, isPro }) {
    return (
        <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white/5 font-medium text-sm transition-colors group relative overflow-hidden">
            <div className="flex items-center gap-3">
                {icon}
                {label}
            </div>
            {isPro && (
                <span className="text-[10px] font-bold text-[#3b82f6] border border-[#3b82f6]/30 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(59, 130, 246,0.2)]">
                    PRO
                </span>
            )}
        </button>
    );
}

export default Sidebar;
