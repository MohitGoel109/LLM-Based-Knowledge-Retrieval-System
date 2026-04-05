import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import BackgroundEffect from './components/BackgroundEffect';
import SettingsPage from './components/SettingsPage';
import StudentProjectsPage from './components/StudentProjectsPage';
import UpdatesFAQPage from './components/UpdatesFAQPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ACTIVE_USER_KEY = 'krmai_active_user';

function sessionsKeyForUser(userId) {
    return `krmai_sessions_${userId}`;
}

function activeSessionKeyForUser(userId) {
    return `krmai_active_session_${userId}`;
}

function loadActiveUser() {
    return localStorage.getItem(ACTIVE_USER_KEY) || '';
}

function loadSessionsForUser(userId) {
    if (!userId) return [];
    try {
        return JSON.parse(localStorage.getItem(sessionsKeyForUser(userId))) || [];
    } catch {
        return [];
    }
}

function saveSessionsForUser(userId, sessions) {
    if (!userId) return;
    localStorage.setItem(sessionsKeyForUser(userId), JSON.stringify(sessions.slice(0, 20)));
}

function loadActiveSessionForUser(userId) {
    if (!userId) return null;
    return localStorage.getItem(activeSessionKeyForUser(userId));
}

function saveActiveSessionForUser(userId, sessionId) {
    if (!userId) return;
    if (sessionId) {
        localStorage.setItem(activeSessionKeyForUser(userId), sessionId);
    } else {
        localStorage.removeItem(activeSessionKeyForUser(userId));
    }
}

function App() {
    const [view, setView] = useState(() => (loadActiveUser() ? 'landing' : 'login'));
    const [currentUser, setCurrentUser] = useState(loadActiveUser);
    const [loginInput, setLoginInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState(() => loadSessionsForUser(loadActiveUser()));
    const [activeSessionId, setActiveSessionId] = useState(() => loadActiveSessionForUser(loadActiveUser()));
    const [voiceLang, setVoiceLang] = useState('EN');

    useEffect(() => {
        if (!currentUser) {
            setSessions([]);
            setMessages([]);
            setActiveSessionId(null);
            return;
        }

        const userSessions = loadSessionsForUser(currentUser);
        const userActiveSession = loadActiveSessionForUser(currentUser);
        setSessions(userSessions);
        setActiveSessionId(userActiveSession);

        if (userActiveSession) {
            const session = userSessions.find((s) => s.id === userActiveSession);
            setMessages(session?.messages || []);
        } else {
            setMessages([]);
        }
    }, [currentUser]);

    useEffect(() => {
        saveActiveSessionForUser(currentUser, activeSessionId);
    }, [currentUser, activeSessionId]);

    const handleLogin = useCallback(() => {
        const normalizedUser = loginInput.trim();
        if (!normalizedUser) return;
        localStorage.setItem(ACTIVE_USER_KEY, normalizedUser);
        setCurrentUser(normalizedUser);
        setLoginInput('');
        setView('landing');
    }, [loginInput]);

    const handleSwitchUser = useCallback(() => {
        localStorage.removeItem(ACTIVE_USER_KEY);
        setCurrentUser('');
        setSessions([]);
        setMessages([]);
        setActiveSessionId(null);
        setView('login');
    }, []);

    // Auto-save current session when messages change
    useEffect(() => {
        if (!currentUser || messages.length === 0 || !activeSessionId) return;
        setSessions((prev) => {
            const firstUserMsg = messages.find((m) => m.role === 'user');
            const title = firstUserMsg
                ? firstUserMsg.content.slice(0, 45)
                : 'New Chat';
            const updated = prev.map((s) =>
                s.id === activeSessionId
                    ? { ...s, title, messages, timestamp: Date.now() }
                    : s
            );
            saveSessionsForUser(currentUser, updated);
            return updated;
        });
    }, [messages, activeSessionId, currentUser]);

    const startNewSession = useCallback(() => {
        if (!currentUser) return;
        const id = Date.now().toString();
        setMessages([]);
        setActiveSessionId(id);
        setSessions((prev) => {
            const newSession = { id, title: 'New Chat', messages: [], timestamp: Date.now() };
            const updated = [newSession, ...prev];
            saveSessionsForUser(currentUser, updated);
            return updated;
        });
    }, [currentUser]);

    const loadSession = useCallback((sessionId) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (session) {
            setMessages(session.messages);
            setActiveSessionId(sessionId);
        }
    }, [sessions]);

    const deleteSession = useCallback((sessionId) => {
        if (!currentUser) return;
        setSessions((prev) => {
            const updated = prev.filter((s) => s.id !== sessionId);
            saveSessionsForUser(currentUser, updated);
            return updated;
        });
        if (activeSessionId === sessionId) {
            setMessages([]);
            setActiveSessionId(null);
        }
    }, [activeSessionId, currentUser]);

    const clearAllSessions = useCallback(() => {
        if (!currentUser) return;
        setSessions([]);
        saveSessionsForUser(currentUser, []);
        setMessages([]);
        setActiveSessionId(null);
    }, [currentUser]);

    // Ensure there's an active session when entering chat
    const enterChat = useCallback(() => {
        if (!currentUser) {
            setView('login');
            return;
        }
        if (!activeSessionId) {
            const id = Date.now().toString();
            setActiveSessionId(id);
            setSessions((prev) => {
                const newSession = { id, title: 'New Chat', messages: [], timestamp: Date.now() };
                const updated = [newSession, ...prev];
                saveSessionsForUser(currentUser, updated);
                return updated;
            });
        }
        setView('chat');
    }, [activeSessionId, currentUser]);

    // Navigate to sub-pages
    const handleNavigate = useCallback((page) => {
        setView(page);
    }, []);

    const renderView = () => {
        switch (view) {
            case 'login':
                return (
                    <motion.div
                        key="login"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="h-full w-full flex items-center justify-center relative z-10 px-4"
                    >
                        <div className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
                            <h1 className="text-xl font-semibold mb-2">Login to KRMAI</h1>
                            <p className="text-sm text-[var(--text-secondary)] mb-4">
                                Use your name or ID to keep your chat history separate on this browser.
                            </p>
                            <input
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleLogin();
                                }}
                                placeholder="Enter your username"
                                className="w-full rounded-xl px-4 py-3 mb-3 bg-[var(--bg-base)] border border-[var(--border-default)] outline-none"
                            />
                            <button
                                onClick={handleLogin}
                                className="w-full rounded-xl px-4 py-3 font-semibold bg-[var(--accent)] text-white"
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                );
            case 'settings':
                return (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full w-full relative z-10"
                    >
                        <SettingsPage
                            onBack={() => setView('chat')}
                            voiceLang={voiceLang}
                            setVoiceLang={setVoiceLang}
                        />
                    </motion.div>
                );
            case 'projects':
                return (
                    <motion.div
                        key="projects"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full w-full relative z-10"
                    >
                        <StudentProjectsPage onBack={() => setView('chat')} />
                    </motion.div>
                );
            case 'updates':
                return (
                    <motion.div
                        key="updates"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full w-full relative z-10"
                    >
                        <UpdatesFAQPage onBack={() => setView('chat')} />
                    </motion.div>
                );
            case 'chat':
                return (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full relative z-10"
                    >
                        <ChatInterface
                            apiUrl={API_URL}
                            onGoHome={() => setView('landing')}
                            messages={messages}
                            setMessages={setMessages}
                            sessions={sessions}
                            activeSessionId={activeSessionId}
                            onNewSession={startNewSession}
                            onLoadSession={loadSession}
                            onDeleteSession={deleteSession}
                            onClearAll={clearAllSessions}
                            onNavigate={handleNavigate}
                            voiceLang={voiceLang}
                            setVoiceLang={setVoiceLang}
                        />
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="h-full w-full overflow-y-auto relative z-10"
                    >
                        <LandingPage onEnterChat={enterChat} onNavigate={handleNavigate} />
                    </motion.div>
                );
        }
    };

    return (
        <div className="h-screen w-full font-sans overflow-hidden antialiased bg-[var(--bg-base)] text-[var(--text-primary)]">
            <BackgroundEffect />
            {currentUser && (
                <div className="fixed top-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm">
                    <span className="text-[var(--text-secondary)]">{currentUser}</span>
                    <button
                        onClick={handleSwitchUser}
                        className="text-[var(--accent)] font-semibold"
                    >
                        Switch
                    </button>
                </div>
            )}
            <AnimatePresence mode="wait">
                {renderView()}
            </AnimatePresence>
        </div>
    );
}

export default App;
