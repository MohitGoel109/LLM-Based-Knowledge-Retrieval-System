import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import BackgroundEffect from './components/BackgroundEffect';

const LandingPage = lazy(() => import('./components/LandingPage'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const StudentProjectsPage = lazy(() => import('./components/StudentProjectsPage'));
const UpdatesFAQPage = lazy(() => import('./components/UpdatesFAQPage'));

const rawApiUrl = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : '');
const API_URL = rawApiUrl.replace(/\/+$/, '');
const ACTIVE_USER_KEY = 'krmai_active_user';
const MAX_SESSIONS = 20;

function sessionsKeyForUser(userId) {
    return `krmai_sessions_${userId}`;
}

function activeSessionKeyForUser(userId) {
    return `krmai_active_session_${userId}`;
}

function loadActiveUser() {
    try {
        return localStorage.getItem(ACTIVE_USER_KEY) || '';
    } catch {
        return '';
    }
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
    localStorage.setItem(sessionsKeyForUser(userId), JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
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

function LoginPage({ loginInput, setLoginInput, onLogin }) {
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
                        if (e.key === 'Enter') onLogin();
                    }}
                    placeholder="Enter your username"
                    className="w-full rounded-xl px-4 py-3 mb-3 bg-[var(--bg-base)] border border-[var(--border-default)] outline-none"
                />
                <button
                    onClick={onLogin}
                    className="w-full rounded-xl px-4 py-3 font-semibold bg-[var(--accent)] text-white"
                >
                    Continue
                </button>
            </div>
        </motion.div>
    );
}

function RouteFallback() {
    return (
        <div className="h-full w-full flex items-center justify-center text-sm text-[var(--text-secondary)]">
            Loading...
        </div>
    );
}

function App() {
    const navigate = useNavigate();
    const location = useLocation();
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
            if (location.pathname !== '/login') navigate('/login', { replace: true });
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

        if (location.pathname === '/login') navigate('/', { replace: true });
    }, [currentUser, location.pathname, navigate]);

    useEffect(() => {
        saveActiveSessionForUser(currentUser, activeSessionId);
    }, [currentUser, activeSessionId]);

    useEffect(() => {
        if (!currentUser || messages.length === 0 || !activeSessionId) return;
        setSessions((prev) => {
            const firstUserMsg = messages.find((m) => m.role === 'user');
            const title = firstUserMsg ? firstUserMsg.content.slice(0, 45) : 'New Chat';
            const updated = prev.map((s) =>
                s.id === activeSessionId
                    ? { ...s, title, messages, timestamp: Date.now() }
                    : s
            );
            saveSessionsForUser(currentUser, updated);
            return updated;
        });
    }, [messages, activeSessionId, currentUser]);

    const handleLogin = useCallback(() => {
        const normalizedUser = loginInput.trim();
        if (!normalizedUser) return;
        localStorage.setItem(ACTIVE_USER_KEY, normalizedUser);
        setCurrentUser(normalizedUser);
        setLoginInput('');
        navigate('/', { replace: true });
    }, [loginInput, navigate]);

    const handleSwitchUser = useCallback(() => {
        localStorage.removeItem(ACTIVE_USER_KEY);
        setCurrentUser('');
        setSessions([]);
        setMessages([]);
        setActiveSessionId(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    const ensureSession = useCallback(() => {
        if (!currentUser) {
            navigate('/login');
            return null;
        }
        if (activeSessionId) return activeSessionId;
        const id = Date.now().toString();
        setActiveSessionId(id);
        setSessions((prev) => {
            const updated = [{ id, title: 'New Chat', messages: [], timestamp: Date.now() }, ...prev];
            saveSessionsForUser(currentUser, updated);
            return updated;
        });
        return id;
    }, [activeSessionId, currentUser, navigate]);

    const startNewSession = useCallback(() => {
        if (!currentUser) return;
        const id = Date.now().toString();
        setMessages([]);
        setActiveSessionId(id);
        setSessions((prev) => {
            const updated = [{ id, title: 'New Chat', messages: [], timestamp: Date.now() }, ...prev];
            saveSessionsForUser(currentUser, updated);
            return updated;
        });
        navigate('/chat');
    }, [currentUser, navigate]);

    const loadSession = useCallback((sessionId) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (session) {
            setMessages(session.messages);
            setActiveSessionId(sessionId);
            navigate('/chat');
        }
    }, [sessions, navigate]);

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
            saveActiveSessionForUser(currentUser, null);
        }
    }, [activeSessionId, currentUser]);

    const clearAllSessions = useCallback(() => {
        if (!currentUser) return;
        setSessions([]);
        saveSessionsForUser(currentUser, []);
        setMessages([]);
        setActiveSessionId(null);
        saveActiveSessionForUser(currentUser, null);
    }, [currentUser]);

    const enterChat = useCallback(() => {
        if (ensureSession()) navigate('/chat');
    }, [ensureSession, navigate]);

    useEffect(() => {
        if (currentUser && location.pathname === '/chat' && !activeSessionId) {
            ensureSession();
        }
    }, [activeSessionId, currentUser, ensureSession, location.pathname]);

    const handleNavigate = useCallback((page) => {
        const path = page === 'landing' ? '/' : `/${page}`;
        if (page === 'chat') ensureSession();
        navigate(path);
    }, [ensureSession, navigate]);

    const routeTransition = {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.25 },
    };

    return (
        <div className="h-screen w-full font-sans overflow-hidden antialiased bg-[var(--bg-base)] text-[var(--text-primary)]">
            <BackgroundEffect />
            {currentUser && (
                <div className="fixed top-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm">
                    <span className="text-[var(--text-secondary)]">{currentUser}</span>
                    <button onClick={handleSwitchUser} className="text-[var(--accent)] font-semibold">
                        Switch
                    </button>
                </div>
            )}
            <Suspense fallback={<RouteFallback />}>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route
                            path="/login"
                            element={<LoginPage loginInput={loginInput} setLoginInput={setLoginInput} onLogin={handleLogin} />}
                        />
                        <Route
                            path="/chat"
                            element={(
                                <motion.div {...routeTransition} className="w-full h-full relative z-10">
                                    <ChatInterface
                                        apiUrl={API_URL}
                                        onGoHome={() => navigate('/')}
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
                            )}
                        />
                        <Route
                            path="/settings"
                            element={(
                                <motion.div {...routeTransition} className="h-full w-full relative z-10">
                                    <SettingsPage
                                        onBack={() => navigate('/chat')}
                                        onClearAll={clearAllSessions}
                                        voiceLang={voiceLang}
                                        setVoiceLang={setVoiceLang}
                                    />
                                </motion.div>
                            )}
                        />
                        <Route
                            path="/projects"
                            element={(
                                <motion.div {...routeTransition} className="h-full w-full relative z-10">
                                    <StudentProjectsPage onBack={() => navigate('/chat')} />
                                </motion.div>
                            )}
                        />
                        <Route
                            path="/updates"
                            element={(
                                <motion.div {...routeTransition} className="h-full w-full relative z-10">
                                    <UpdatesFAQPage onBack={() => navigate('/chat')} />
                                </motion.div>
                            )}
                        />
                        <Route
                            path="*"
                            element={(
                                <motion.div {...routeTransition} className="h-full w-full overflow-y-auto relative z-10">
                                    <LandingPage onEnterChat={enterChat} onNavigate={handleNavigate} />
                                </motion.div>
                            )}
                        />
                    </Routes>
                </AnimatePresence>
            </Suspense>
        </div>
    );
}

export default App;
