import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Home } from 'lucide-react';
import KRMAILogo from './KRMAILogo';

function ChatHeader({ sidebarOpen, setSidebarOpen, loading, onGoHome }) {
    return (
        <header className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-5 md:px-8 z-20 select-none bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-gray-900"
                >
                    <PanelLeft className="w-5 h-5" />
                </motion.button>
                
                <h1 className="text-[15px] font-semibold text-gray-900">
                    KRMAI
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Search Bar Mockup */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-gray-400 text-sm w-48 transition-colors focus-within:border-[rgba(59, 130, 246,0.5)] focus-within:bg-[#1a1c23]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Search" className="bg-transparent outline-none border-none w-full text-gray-900" />
                </div>
                
                <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-gray-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
                <button onClick={onGoHome} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-gray-400 hover:text-gray-900 transition-colors hidden sm:block">
                    <Home className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

export default ChatHeader;
