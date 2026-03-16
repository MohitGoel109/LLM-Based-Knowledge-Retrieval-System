import { motion } from 'framer-motion';
import {
    ArrowLeft, ExternalLink, Github, Users, Cpu,
    BookOpen, Wifi, Bot, Brain, Database
} from 'lucide-react';

const PROJECTS = [
    {
        title: 'KRMU Smart Campus',
        desc: 'An AI-powered campus navigation system that helps students find classrooms, labs, and facilities using natural language queries.',
        tech: ['React', 'FastAPI', 'ChromaDB', 'Qwen3'],
        status: 'Active',
        statusColor: 'bg-green-400',
        icon: Cpu,
        team: 'Team Alpha',
        members: 4,
    },
    {
        title: 'Library AI Connect',
        desc: 'Intelligent library assistant that recommends books, tracks availability, and manages reservations through conversational AI.',
        tech: ['Python', 'LangChain', 'Ollama', 'SQLite'],
        status: 'In Development',
        statusColor: 'bg-yellow-400',
        icon: BookOpen,
        team: 'Team Beta',
        members: 3,
    },
    {
        title: 'Hostel Matcher',
        desc: 'AI-based roommate matching system that pairs students based on preferences, schedules, and lifestyle compatibility.',
        tech: ['React', 'Node.js', 'MongoDB', 'ML'],
        status: 'Planning',
        statusColor: 'bg-blue-400',
        icon: Users,
        team: 'Team Gamma',
        members: 5,
    },
    {
        title: 'Campus Wi-Fi Analyzer',
        desc: 'Real-time Wi-Fi signal mapping tool that helps students find the best connectivity spots across campus.',
        tech: ['Python', 'Flask', 'D3.js', 'IoT'],
        status: 'Active',
        statusColor: 'bg-green-400',
        icon: Wifi,
        team: 'Team Delta',
        members: 3,
    },
    {
        title: 'Exam Prep Bot',
        desc: 'Personalized exam preparation assistant that generates practice questions and study plans based on syllabus analysis.',
        tech: ['React', 'FastAPI', 'RAG', 'Ollama'],
        status: 'In Development',
        statusColor: 'bg-yellow-400',
        icon: Brain,
        team: 'Team Epsilon',
        members: 4,
    },
    {
        title: 'Research Paper Digest',
        desc: 'AI tool that summarizes research papers, extracts key findings, and helps students understand complex academic literature.',
        tech: ['Python', 'LangChain', 'HuggingFace', 'ChromaDB'],
        status: 'Planning',
        statusColor: 'bg-blue-400',
        icon: Database,
        team: 'Team Zeta',
        members: 2,
    },
];

function StudentProjectsPage({ onBack }) {
    return (
        <div className="h-full w-full overflow-y-auto bg-[var(--bg-base)]">
            <div className="max-w-5xl mx-auto px-6 py-8">
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
                        <h1 className="text-2xl font-display text-[var(--text-heading)]">Student Projects</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">AI-powered projects built by KR Mangalam students</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Active Projects', value: '2', color: 'text-green-400' },
                        { label: 'In Development', value: '2', color: 'text-yellow-400' },
                        { label: 'Planning Phase', value: '2', color: 'text-blue-400' },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card rounded-2xl p-5 text-center"
                        >
                            <p className={`text-2xl font-display ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Project Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {PROJECTS.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card rounded-2xl p-6 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <project.icon className="w-6 h-6 text-[var(--accent)]" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${project.statusColor}`} />
                                    <span className="text-xs font-medium text-[var(--text-muted)]">{project.status}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-2">{project.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{project.desc}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tech.map((t) => (
                                    <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                    <span className="text-xs text-[var(--text-muted)]">{project.team} ({project.members} members)</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
                                >
                                    View Details
                                    <ExternalLink className="w-3 h-3" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StudentProjectsPage;
