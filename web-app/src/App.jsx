import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import BackgroundEffect from './components/BackgroundEffect';
import SettingsPage from './components/SettingsPage';
import StudentProjectsPage from './components/StudentProjectsPage';
import UpdatesFAQPage from './components/UpdatesFAQPage';

const API_URL = 'http://localhost:8000';
const SESSIONS_KEY = 'krmai_sessions';

function loadSessions() {
    try {
        return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveSessions(sessions) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 20)));
}

function App() {
    const [view, setView] = useState('landing');
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState(loadSessions);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [voiceLang, setVoiceLang] = useState('EN');

    // Auto-save current session when messages change
    useEffect(() => {
        if (messages.length === 0 || !activeSessionId) return;
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
            saveSessions(updated);
            return updated;
        });
    }, [messages, activeSessionId]);

    const startNewSession = useCallback(() => {
        const id = Date.now().toString();
        setMessages([]);
        setActiveSessionId(id);
        setSessions((prev) => {
            const newSession = { id, title: 'New Chat', messages: [], timestamp: Date.now() };
            const updated = [newSession, ...prev];
            saveSessions(updated);
            return updated;
        });
    }, []);

    const loadSession = useCallback((sessionId) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (session) {
            setMessages(session.messages);
            setActiveSessionId(sessionId);
        }
    }, [sessions]);

    const deleteSession = useCallback((sessionId) => {
        setSessions((prev) => {
            const updated = prev.filter((s) => s.id !== sessionId);
            saveSessions(updated);
            return updated;
        });
        if (activeSessionId === sessionId) {
            setMessages([]);
            setActiveSessionId(null);
        }
    }, [activeSessionId]);

    const clearAllSessions = useCallback(() => {
        setSessions([]);
        saveSessions([]);
        setMessages([]);
        setActiveSessionId(null);
    }, []);

    // Ensure there's an active session when entering chat
    const enterChat = useCallback(() => {
        if (!activeSessionId) {
            const id = Date.now().toString();
            setActiveSessionId(id);
            setSessions((prev) => {
                const newSession = { id, title: 'New Chat', messages: [], timestamp: Date.now() };
                const updated = [newSession, ...prev];
                saveSessions(updated);
                return updated;
            });
        }
        setView('chat');
    }, [activeSessionId]);

    // Navigate to sub-pages
    const handleNavigate = useCallback((page) => {
        setView(page);
    }, []);

    const renderView = () => {
        switch (view) {
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
            <AnimatePresence mode="wait">
                {renderView()}
            </AnimatePresence>
        </div>
    );
}

export default App;
