import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ChevronDown, ChevronUp, Bell, Zap, Shield,
    MessageSquare, HelpCircle, Sparkles, Bug, Globe
} from 'lucide-react';

const UPDATES = [
    {
        version: 'v1.0.0',
        date: 'March 2026',
        tag: 'Latest',
        tagColor: 'bg-green-400/10 text-green-400 border-green-400/20',
        items: [
            { icon: Sparkles, text: 'Launched KRMAI with React frontend and FastAPI backend' },
            { icon: Globe, text: 'Added multilingual support for English, Hindi, and Hinglish' },
            { icon: MessageSquare, text: 'Voice input with real-time transcription preview' },
            { icon: Shield, text: 'RAG-powered responses with document source citations' },
        ],
    },
    {
        version: 'v0.9.0',
        date: 'February 2026',
        tag: 'Beta',
        tagColor: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
        items: [
            { icon: Zap, text: 'Switched from Llama 3.2 to Qwen3:8B for better Hindi comprehension' },
            { icon: Bug, text: 'Fixed voice input overwriting existing text' },
            { icon: Bell, text: 'Added session history with auto-save and restore' },
        ],
    },
    {
        version: 'v0.8.0',
        date: 'January 2026',
        tag: 'Alpha',
        tagColor: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
        items: [
            { icon: Sparkles, text: 'Initial prototype with Streamlit UI' },
            { icon: Shield, text: 'Ingested university documents into ChromaDB vector store' },
            { icon: Zap, text: 'Built slang/abbreviation expansion engine for Gen Z queries' },
        ],
    },
];

const FAQS = [
    {
        q: 'What is KRMAI?',
        a: 'KRMAI is an AI-powered assistant specifically built for KR Mangalam University students. It uses RAG (Retrieval-Augmented Generation) technology to provide accurate answers from verified university documents about fees, placements, scholarships, hostel rules, and more.',
    },
    {
        q: 'How accurate are the responses?',
        a: 'KRMAI retrieves answers directly from official university documents ingested into its knowledge base. Each response includes source citations so you can verify the information. However, always cross-check critical information like deadlines and fees with official university channels.',
    },
    {
        q: 'Can I use voice input?',
        a: 'Yes. KRMAI supports voice input in English, Hindi, and Auto Detect modes. Click the microphone button in the chat input to start speaking. Your speech will be transcribed in real-time and you can see a preview before it is submitted.',
    },
    {
        q: 'Is my data stored anywhere?',
        a: 'All chat sessions and preferences are stored locally in your browser using localStorage. Nothing is sent to external servers. The AI model runs locally via Ollama, so your conversations stay on your machine.',
    },
    {
        q: 'What languages are supported?',
        a: 'KRMAI understands English, Hindi, and Hinglish (mixed Hindi-English). It has a built-in slang expansion engine that can interpret casual language, abbreviations, and Gen Z slang.',
    },
    {
        q: 'How do I report an issue?',
        a: 'If you encounter any bugs or have feature suggestions, please reach out to the development team through the university portal or file an issue on the project repository. Your feedback helps us improve KRMAI.',
    },
    {
        q: 'Can I switch between dark and light themes?',
        a: 'Yes. Go to Settings from the sidebar and choose between Dark, Light, or System (follows your OS preference) themes.',
    },
    {
        q: 'What model does KRMAI use?',
        a: 'KRMAI uses the Qwen3:8B model running locally via Ollama. It was chosen for its strong multilingual capabilities, especially in Hindi and Hinglish comprehension, while being efficient enough to run on consumer hardware.',
    },
];

function UpdatesFAQPage({ onBack }) {
    const [openFaq, setOpenFaq] = useState(null);
    const [activeTab, setActiveTab] = useState('updates');

    return (
        <div className="h-full w-full overflow-y-auto bg-[var(--bg-base)]">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onBack}
                        className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>
                    <div>
                        <h1 className="text-2xl font-display text-[var(--text-heading)]">Updates & FAQ</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">Changelog and frequently asked questions</p>
                    </div>
                </div>

                {/* Tab Switch */}
                <div className="flex gap-2 mb-8 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] w-fit">
                    {[
                        { id: 'updates', label: 'Updates', icon: Bell },
                        { id: 'faq', label: 'FAQ', icon: HelpCircle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-[var(--accent)] text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Updates Tab */}
                {activeTab === 'updates' && (
                    <div className="space-y-8">
                        {UPDATES.map((update, ui) => (
                            <motion.div
                                key={ui}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: ui * 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-lg font-semibold text-[var(--text-heading)]">{update.version}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${update.tagColor}`}>
                                        {update.tag}
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)]">{update.date}</span>
                                </div>
                                <div className="glass-card rounded-2xl p-5 space-y-3">
                                    {update.items.map((item, ii) => (
                                        <div key={ii} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <item.icon className="w-4 h-4 text-[var(--accent)]" />
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* FAQ Tab */}
                {activeTab === 'faq' && (
                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card rounded-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <span className="text-sm font-medium text-[var(--text-heading)] pr-4">{faq.q}</span>
                                    {openFaq === i ? (
                                        <ChevronUp className="w-4 h-4 text-[var(--accent)] shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-5 pb-5 pt-0">
                                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-4">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpdatesFAQPage;
