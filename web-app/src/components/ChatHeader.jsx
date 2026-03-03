import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Home } from 'lucide-react';
import KRMAILogo from './KRMAILogo';

function ChatHeader({ sidebarOpen, setSidebarOpen, loading, onGoHome }) {
    return (
        <header className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-5 md:px-8 z-10 select-none bg-[var(--bg-base)]/80 backdrop-blur-lg border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2.5 rounded-lg transition-all hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                    <PanelLeft className="w-5 h-5" />
                </motion.button>

                <AnimatePresence>
                    {!sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2.5 cursor-pointer"
                            onClick={onGoHome}
                        >
                            <KRMAILogo size={32} animate={loading} />
                            <span className="font-display text-lg text-white tracking-tight hidden sm:block">
                                KRMAI
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onGoHome}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)] transition-colors"
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
            </motion.button>
        </header>
    );
}

export default ChatHeader;
