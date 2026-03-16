import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import BackgroundEffect from './components/BackgroundEffect';

const API_URL = 'http://localhost:8000';
const SESSIONS_KEY = 'krmai_sessions';
const ACTIVE_SESSION_KEY = 'krmai_active_session';

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
        // Save current if it has messages
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

    return (
        <div className="h-screen w-full font-sans overflow-hidden antialiased bg-[#fafafa] text-gray-900">
            <BackgroundEffect />

            <AnimatePresence mode="wait">
                {view === 'landing' ? (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="h-full w-full overflow-y-auto relative z-10"
                    >
                        <LandingPage onEnterChat={enterChat} />
                    </motion.div>
                ) : (
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
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
