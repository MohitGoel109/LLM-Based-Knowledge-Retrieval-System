import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Zap, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import KRMAILogo from './KRMAILogo';
import SourceBadge, { getSourceLabel } from './SourceBadge';
import mdComponents from './MarkdownComponents';

function timeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* Directional entrance variants — smoothed */
const userBubbleVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut'
        },
    },
};

const botBubbleVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut'
        },
    },
};

/* Timestamp fade-in variant -- delays after message */
const timestampVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { delay: 0.6, duration: 0.4, ease: 'easeOut' },
    },
};

/* Source section stagger container */
const sourcesContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.3,
            staggerChildren: 0.08,
        },
    },
};

const sourceBadgeVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 6 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15,
        },
    },
};

function MessageBubble({ message, index, isNew }) {
    const [feedback, setFeedback] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showRipple, setShowRipple] = useState(false);

    const handleFeedback = (type) => {
        setFeedback(type);
        try {
            const stored = JSON.parse(localStorage.getItem('krmai_feedback') || '[]');
            stored.push({ index, feedback: type, timestamp: Date.now() });
            localStorage.setItem('krmai_feedback', JSON.stringify(stored));
        } catch { }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    const isUser = message.role === 'user';

    // Brief ripple effect on new messages
    useEffect(() => {
        if (isNew) {
            setShowRipple(true);
            const timer = setTimeout(() => setShowRipple(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isNew]);



    return (
        <motion.div
            layout
            variants={isUser ? userBubbleVariants : botBubbleVariants}
            initial="hidden"
            animate="visible"
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {isUser ? (
                <motion.div
                    whileHover={{
                        scale: 1.01,
                        y: -2,
                    }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="max-w-[90%] md:max-w-[70%] relative"
                >
                    <div className="px-5 py-3.5 rounded-3xl rounded-br-sm text-[16px] font-medium leading-relaxed user-bubble relative overflow-hidden">
                        {message.content}
                        {showRipple && <div className="message-ripple" />}
                    </div>
                    {message.timestamp && (
                        <motion.p
                            variants={timestampVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-[10px] text-[var(--text-muted)] mt-1.5 text-right pr-2"
                        >
                            {timeAgo(message.timestamp)}
                        </motion.p>
                    )}
                </motion.div>
            ) : (
                <div className="flex gap-4 md:gap-5 w-full max-w-[98%] md:max-w-[85%]">
                    <div className="shrink-0 mt-2 hidden sm:block">
                        <KRMAILogo size={44} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <motion.div
                            whileHover={{
                                y: -3,
                                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(59, 130, 246, 0.12)',
                            }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className={`rounded-3xl rounded-tl-sm px-5 py-4 bot-bubble relative overflow-hidden ${message.isError ? 'border-red-500/50' : ''}`}
                        >

                            <div className={`relative z-[1] ${message.isError ? 'text-red-400 font-medium' : ''}`}>
                                <ReactMarkdown
                                    components={mdComponents}
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                            {showRipple && <div className="message-ripple" />}
                            {message.sources && message.sources.length > 0 && (() => {
                                const seen = new Set();
                                const uniqueSources = message.sources.filter((s) => {
                                    const label = getSourceLabel(s.source);
                                    if (seen.has(label)) return false;
                                    seen.add(label);
                                    return true;
                                });
                                return (
                                    <motion.div
                                        variants={sourcesContainerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-[var(--border-subtle)] relative z-[1]"
                                    >
                                        <motion.div
                                            variants={sourceBadgeVariants}
                                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 bg-[var(--bg-surface)] text-[var(--text-muted)]"
                                        >
                                            <Zap className="w-3.5 h-3.5" /> Sources
                                        </motion.div>
                                        {uniqueSources.map((s, si) => (
                                            <motion.div key={si} variants={sourceBadgeVariants}>
                                                <SourceBadge source={s.source} />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                );
                            })()}
                        </motion.div>

                        {/* Action bar: timestamp, feedback, copy */}
                        {!message.isError && (
                            <motion.div
                                variants={timestampVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex items-center gap-3 mt-2 px-2"
                            >
                                {message.timestamp && (
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                        {timeAgo(message.timestamp)}
                                    </span>
                                )}
                                <div className="flex items-center gap-1 ml-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleCopy}
                                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
                                        title="Copy response"
                                    >
                                        {copied ? (
                                            <Check className="w-3.5 h-3.5 text-green-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleFeedback('up')}
                                        className={`p-1.5 rounded-lg transition-all ${feedback === 'up' ? 'text-green-400 bg-green-400/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
                                        title="Helpful"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleFeedback('down')}
                                        className={`p-1.5 rounded-lg transition-all ${feedback === 'down' ? 'text-red-400 bg-red-400/10' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
                                        title="Not helpful"
                                    >
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default MessageBubble;
