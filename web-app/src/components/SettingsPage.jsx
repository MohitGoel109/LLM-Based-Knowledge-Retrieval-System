import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Sun, Moon, Globe, Volume2, VolumeX,
    Bell, BellOff, Trash2, Info, Monitor
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VOICE_LANGUAGES = [
    { value: 'EN', label: 'English' },
    { value: 'HI', label: 'Hindi' },
    { value: 'AUTO', label: 'Auto Detect' },
];

function SettingsPage({ onBack, voiceLang, setVoiceLang }) {
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState(() => {
        try { return localStorage.getItem('krmai_notifications') !== 'false'; } catch { return true; }
    });
    const [soundEnabled, setSoundEnabled] = useState(() => {
        try { return localStorage.getItem('krmai_sound') !== 'false'; } catch { return true; }
    });

    const handleNotifications = (val) => {
        setNotifications(val);
        localStorage.setItem('krmai_notifications', val);
    };

    const handleSound = (val) => {
        setSoundEnabled(val);
        localStorage.setItem('krmai_sound', val);
    };

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
            localStorage.removeItem('krmai_sessions');
            localStorage.removeItem('krmai_feedback');
            window.location.reload();
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-[var(--bg-base)]">
            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <div>
                        <h1 className="text-2xl font-display text-[var(--text-heading)]">Settings</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">Customize your KRMU assistant experience</p>
                    </div>
                </div>

                {/* Theme */}
                <section className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Appearance</h2>
                    <div className="glass-card rounded-2xl p-5 space-y-1">
                        <p className="text-sm font-medium text-[var(--text-heading)] mb-3">Theme</p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'dark', label: 'Dark', icon: Moon },
                                { value: 'light', label: 'Light', icon: Sun },
                                { value: 'system', label: 'System', icon: Monitor },
                            ].map((opt) => {
                                const isActive = theme === opt.value || (opt.value === 'system' && theme === (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
                                const actualActive = theme === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            if (opt.value === 'system') {
                                                setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                                            } else {
                                                setTheme(opt.value);
                                            }
                                        }}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${actualActive
                                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                                            : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:bg-[var(--bg-surface)]'
                                            }`}
                                    >
                                        <opt.icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Voice */}
                <section className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Voice Input</h2>
                    <div className="glass-card rounded-2xl p-5 space-y-4">
                        <div>
                            <p className="text-sm font-medium text-[var(--text-heading)] mb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[var(--accent)]" />
                                Default Voice Language
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {VOICE_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() => setVoiceLang(lang.value)}
                                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${voiceLang === lang.value
                                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                                            : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30'
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preferences */}
                <section className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Preferences</h2>
                    <div className="glass-card rounded-2xl p-5 space-y-4">
                        {/* Notifications */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {notifications ? <Bell className="w-4 h-4 text-[var(--accent)]" /> : <BellOff className="w-4 h-4 text-[var(--text-muted)]" />}
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-heading)]">Notifications</p>
                                    <p className="text-xs text-[var(--text-muted)]">Show desktop notifications</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleNotifications(!notifications)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-5.5 left-[1px]' : 'left-[2px]'}`}
                                    style={{ transform: notifications ? 'translateX(22px)' : 'translateX(0)' }}
                                />
                            </button>
                        </div>

                        {/* Sound */}
                        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                            <div className="flex items-center gap-3">
                                {soundEnabled ? <Volume2 className="w-4 h-4 text-[var(--accent)]" /> : <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />}
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-heading)]">Sound Effects</p>
                                    <p className="text-xs text-[var(--text-muted)]">Play sound on new messages</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSound(!soundEnabled)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--bg-surface)]'}`}
                            >
                                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                                    style={{ transform: soundEnabled ? 'translateX(22px)' : 'translateX(0)', left: '2px' }}
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="mb-8">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400/70 mb-4">Data</h2>
                    <div className="glass-card rounded-2xl p-5 border-red-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-4 h-4 text-red-400" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-heading)]">Clear All Data</p>
                                    <p className="text-xs text-[var(--text-muted)]">Delete all chat sessions and feedback</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClearHistory}
                                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                            >
                                Clear
                            </motion.button>
                        </div>
                    </div>
                </section>

                {/* Info */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                        <Info className="w-4 h-4 text-[var(--accent)] shrink-0" />
                        <p className="text-xs text-[var(--text-muted)]">
                            KRMAI v1.0 — Built with React, FastAPI, LangChain, ChromaDB & Ollama (Qwen3:8B). All data is stored locally in your browser.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default SettingsPage;
