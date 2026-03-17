import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, GraduationCap, CreditCard, Briefcase,
    Shield, BookOpen, MessageSquare, Quote,
    Sparkles, Bot, BarChart3, Globe, Users, ChevronRight,
    Cpu, Clock, Star, FolderKanban, Settings, HelpCircle,
    Zap, Layers, Code
} from 'lucide-react';

const FEATURES = [
    {
        icon: Bot,
        title: 'AI-Powered Answers',
        desc: 'Get instant, context-aware responses powered by advanced RAG technology and local LLMs.',
        gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
        icon: CreditCard,
        title: 'Fees & Scholarships',
        desc: 'Get detailed fee breakdowns and scholarship eligibility criteria across all programs.',
        gradient: 'from-purple-500/20 to-blue-500/20',
    },
    {
        icon: Briefcase,
        title: 'Placement Guidance',
        desc: 'Learn about the placement process, top recruiters, and preparation strategies.',
        gradient: 'from-emerald-500/20 to-teal-500/20',
    },
    {
        icon: Shield,
        title: 'Rules & Policies',
        desc: 'Access hostel rules, anti-ragging policies, exam schedules, and academic guidelines.',
        gradient: 'from-orange-500/20 to-red-500/20',
    },
    {
        icon: Globe,
        title: 'Multilingual Support',
        desc: 'Ask in English, Hindi, or Hinglish. The AI understands your language and responds clearly.',
        gradient: 'from-pink-500/20 to-purple-500/20',
    },
    {
        icon: Clock,
        title: '24/7 Availability',
        desc: 'No waiting for office hours. Get answers anytime, anywhere, on any device instantly.',
        gradient: 'from-cyan-500/20 to-blue-500/20',
    },
];

const DEPARTMENTS = [
    'School of Engineering',
    'School of Law',
    'School of Management',
    'School of Sciences',
    'School of Education',
];

const STATS = [
    { value: 56.6, suffix: ' LPA', label: 'Highest Package' },
    { value: 800, suffix: '+', label: 'Campus Recruiters' },
    { value: 100, suffix: '+', label: 'Programs Offered' },
    { value: 28, suffix: ' Acres', label: 'Campus Area' },
];

const TESTIMONIALS = [
    {
        quote: "Placed at Ferrari with a package of ₹56.6 LPA — the highest package at KRMU. BCA graduate from the School of Computer Applications.",
        name: "Rishav Bakshi",
        role: "BCA — Ferrari, ₹56.6 LPA",
        avatar: "RB",
    },
    {
        quote: "Selected by Autodesk with a ₹34 LPA package. B.Tech CSE graduate from the School of Engineering and Technology.",
        name: "Vineet Verma",
        role: "B.Tech CSE — Autodesk, ₹34 LPA",
        avatar: "VV",
    },
    {
        quote: "Placed at UNTAS as a Technical Sourcer with ₹36 LPA package. B.Tech CSE from the School of Engineering and Technology.",
        name: "Daksh Mehta",
        role: "B.Tech CSE — UNTAS, ₹36 LPA",
        avatar: "DM",
    },
    {
        quote: "Selected by Cargo Flash as a Network Engineer with ₹24 LPA package. B.Tech CSE from the School of Engineering and Technology.",
        name: "Abhinav Anand",
        role: "B.Tech CSE — Cargo Flash, ₹24 LPA",
        avatar: "AA",
    },
    {
        quote: "Placed at Hughes Systique as an Engineer Trainee with ₹10.76 LPA. B.Tech CSE from the School of Engineering and Technology.",
        name: "Kritika Garg",
        role: "B.Tech CSE — Hughes Systique, ₹10.76 LPA",
        avatar: "KG",
    },
    {
        quote: "Selected by Pure Research as a Research Analyst with ₹18 LPA package. B.Com (Hons.) from the School of Management and Commerce.",
        name: "Avinash Kumar Pandey",
        role: "B.Com (Hons.) — Pure Research, ₹18 LPA",
        avatar: "AP",
    },
];

const HOW_IT_WORKS = [
    { step: '01', title: 'Ask a Question', desc: 'Type or speak your question in any language you prefer.' },
    { step: '02', title: 'AI Retrieves Context', desc: 'RAG engine searches through verified university documents.' },
    { step: '03', title: 'Get Accurate Answer', desc: 'Receive a clear, sourced response with citations.' },
];

const HERO_WORDS = ['Fees', 'Placements', 'Scholarships', 'Hostel Rules', 'Admissions'];

/* Animated word cycling for hero section */
function AnimatedWords() {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setIndex((i) => (i + 1) % HERO_WORDS.length), 2500);
        return () => clearInterval(timer);
    }, []);

    return (
        <span className="inline-block relative">
            <motion.span
                key={index}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                transition={{ duration: 0.5 }}
                className="gradient-text"
            >
                {HERO_WORDS[index]}
            </motion.span>
        </span>
    );
}

/* Animated counter for stats */
function AnimatedStat({ value, suffix }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 2000;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start * 10) / 10);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value]);

    return <>{Number.isInteger(value) ? Math.floor(count) : count.toFixed(1)}{suffix}</>;
}


function LandingPage({ onEnterChat, onNavigate }) {
    return (
        <div className="min-h-screen bg-[var(--landing-bg)] text-[var(--text-primary)] overflow-y-auto">
            {/* ── Animated Background — Glass Orbs + Mesh + Particles ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Large glass orb — top-right, bright and moving */}
                <motion.div
                    animate={{
                        x: [0, 60, -30, 50, 0],
                        y: [0, -50, 30, -20, 0],
                        scale: [1, 1.15, 0.9, 1.1, 1],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[-8%] right-[-3%] w-[700px] h-[700px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.08) 40%, transparent 70%)',
                    }}
                />

                {/* Large glass orb — bottom-left */}
                <motion.div
                    animate={{
                        x: [0, -40, 30, -35, 0],
                        y: [0, 30, -40, 20, 0],
                        scale: [1, 0.9, 1.1, 0.95, 1],
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[-8%] left-[-5%] w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle at 60% 60%, rgba(96, 165, 250, 0.18) 0%, rgba(59, 130, 246, 0.06) 40%, transparent 70%)',
                    }}
                />

                {/* Mesh gradient blob — center, pulsing */}
                <motion.div
                    animate={{
                        opacity: [0.06, 0.15, 0.06],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[35%] left-[45%] -translate-x-1/2 w-[900px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.12) 0%, rgba(147, 197, 253, 0.04) 40%, transparent 65%)' }}
                />

                {/* Small floating orb — mid-right */}
                <motion.div
                    animate={{
                        x: [0, 20, -15, 25, 0],
                        y: [0, -35, 15, -20, 0],
                        opacity: [0.15, 0.35, 0.15],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[20%] right-[20%] w-[250px] h-[250px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                    }}
                />

                {/* Small floating orb — bottom-right */}
                <motion.div
                    animate={{
                        x: [0, -25, 15, -20, 0],
                        y: [0, 15, -25, 10, 0],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 65%)',
                    }}
                />

                {/* Floating micro particles */}
                {[
                    { x: '10%', y: '15%', size: 6, delay: 0, dur: 7 },
                    { x: '80%', y: '25%', size: 4, delay: 1, dur: 9 },
                    { x: '30%', y: '70%', size: 5, delay: 2, dur: 8 },
                    { x: '65%', y: '60%', size: 3, delay: 0.5, dur: 10 },
                    { x: '45%', y: '30%', size: 4, delay: 3, dur: 6 },
                    { x: '90%', y: '80%', size: 5, delay: 1.5, dur: 11 },
                    { x: '20%', y: '45%', size: 3, delay: 2.5, dur: 8.5 },
                    { x: '70%', y: '10%', size: 4, delay: 0.8, dur: 9.5 },
                ].map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: p.x, top: p.y,
                            width: p.size, height: p.size,
                            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.6))',
                            boxShadow: `0 0 ${p.size * 4}px rgba(59, 130, 246, 0.5), 0 0 ${p.size * 8}px rgba(59, 130, 246, 0.2)`,
                        }}
                        animate={{
                            y: [0, -30, 10, -20, 0],
                            x: [0, 15, -10, 12, 0],
                            opacity: [0.4, 0.8, 0.3, 0.7, 0.4],
                            scale: [1, 1.4, 0.8, 1.3, 1],
                        }}
                        transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 grid-overlay"
                    style={{
                        backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 70%)',
                    }}
                />
            </div>

            {/* ── Navbar ── */}
            <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3 bg-[var(--nav-bg)] backdrop-blur-xl border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-[0_4px_12px_var(--accent-glow)]">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display text-2xl text-[var(--text-heading)]">KRMAI</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">How it Works</a>
                        <a href="#about" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">About</a>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onEnterChat}
                        className="btn-accent px-5 py-2.5 text-sm flex items-center gap-2"
                    >
                        Try it Now
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative pt-32 md:pt-40 pb-20 px-6 md:px-12 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="inline-flex items-center gap-3 mb-8"
                        >
                            <span className="px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI-Powered
                            </span>
                            <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                                Meet Your University AI Assistant
                                <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.1, duration: 0.7 }}
                            className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] mb-7 text-[var(--text-heading)]"
                        >
                            Your Questions About{' '}<br className="hidden md:block" />
                            <AnimatedWords />{' '}
                            Answered Instantly
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: 0.25 }}
                            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed"
                        >
                            Our AI-powered platform delivers instant, accurate answers about fees,
                            placements, scholarships, hostel rules, and everything you need as a
                            KR Mangalam University student.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onEnterChat}
                                className="btn-accent px-8 py-4 text-base flex items-center gap-3 shadow-[0_0_40px_var(--accent-glow)]"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Start Chatting
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </motion.button>
                            <motion.a
                                href="#features"
                                whileHover={{ scale: 1.03 }}
                                className="px-6 py-4 text-base font-medium rounded-full border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                Learn More
                                <ChevronRight className="w-4 h-4" />
                            </motion.a>
                        </motion.div>
                    </div>
                </div>

                {/* Floating chat mockup */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="hidden lg:block absolute top-1/2 right-12 -translate-y-1/2 w-[380px]"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="glass-card rounded-2xl p-6 space-y-4"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[var(--text-heading)]">KRMAI Assistant</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-pulse" />
                                    <span className="text-[10px] text-green-400 font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-[var(--accent)] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm ml-auto max-w-[85%]">
                                What's the BTech CSE fee structure?
                            </div>
                            <div className="bg-[var(--bg-surface)] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-[var(--text-secondary)] max-w-[90%]">
                                The BTech CSE program has a semester fee of Rs 1,42,500 with additional one-time charges...
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {['Scholarships', 'Hostel', 'Placements'].map((t) => (
                                <span key={t} className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Stats Row — animated counters ── */}
            <section className="py-12 border-t border-b border-[var(--border-subtle)] relative z-10">
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-center gap-12 md:gap-20">
                    {STATS.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-3xl md:text-4xl font-display gradient-text mb-1">
                                <AnimatedStat value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-sm text-[var(--text-muted)] uppercase tracking-wider font-medium">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Quick Links Bar — Student Projects, Settings, Updates ── */}
            <section className="py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: FolderKanban,
                                title: 'Student Projects',
                                desc: 'Explore AI-powered projects built by KRM students',
                                page: 'projects',
                                gradient: 'from-blue-500/10 to-cyan-500/10',
                            },
                            {
                                icon: HelpCircle,
                                title: 'Updates & FAQ',
                                desc: 'Changelog, version history, and common questions',
                                page: 'updates',
                                gradient: 'from-purple-500/10 to-pink-500/10',
                            },
                            {
                                icon: Settings,
                                title: 'Settings',
                                desc: 'Theme, voice preferences, and app configuration',
                                page: 'settings',
                                gradient: 'from-emerald-500/10 to-teal-500/10',
                            },
                        ].map((item, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    if (item.page === 'settings') {
                                        // Enter chat first, then navigate
                                        onEnterChat();
                                        setTimeout(() => onNavigate && onNavigate(item.page), 100);
                                    } else {
                                        onNavigate && onNavigate(item.page);
                                    }
                                }}
                                className={`glass-card rounded-2xl p-6 text-left flex items-center gap-4 group cursor-pointer bg-gradient-to-br ${item.gradient}`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6 text-[var(--accent)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-[var(--text-heading)] mb-0.5">{item.title}</h3>
                                    <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all shrink-0" />
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Trust Bar ── */}
            <section className="py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-[var(--text-muted)] uppercase tracking-widest mb-6 font-medium">
                        Covering all departments and university services
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {DEPARTMENTS.map((dept) => (
                            <span key={dept} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)] font-medium hover:border-[var(--accent)]/30 hover:bg-[var(--bg-surface)] transition-all">
                                <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                                {dept}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features Section ── */}
            <section id="features" className="py-20 px-6 md:px-12 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1.5 mb-4">
                            <Sparkles className="w-3.5 h-3.5" /> Features
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl text-[var(--text-heading)] mb-4">
                            Everything You Need, <span className="gradient-text">Instantly</span>
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">Get instant, AI-powered answers to all your university questions</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card p-8 rounded-2xl group">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                    <feat.icon className="w-6 h-6 text-[var(--accent)]" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-[var(--text-heading)]">{feat.title}</h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed text-[15px]">{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Tech Stack Showcase ── */}
            <section className="py-16 px-6 md:px-12 border-t border-[var(--border-subtle)] relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                        <span className="px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1.5 mb-4">
                            <Code className="w-3.5 h-3.5" /> Technology
                        </span>
                        <h2 className="font-display text-3xl md:text-4xl text-[var(--text-heading)] mb-3">
                            Built With <span className="gradient-text">Cutting-Edge</span> Tech
                        </h2>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { name: 'React 19', icon: Layers },
                            { name: 'FastAPI', icon: Zap },
                            { name: 'LangChain', icon: Code },
                            { name: 'ChromaDB', icon: Cpu },
                            { name: 'Ollama', icon: Bot },
                            { name: 'Qwen3:8B', icon: Sparkles },
                        ].map((tech, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -4, scale: 1.05 }}
                                className="glass-card px-5 py-3 rounded-xl flex items-center gap-3 cursor-default"
                            >
                                <tech.icon className="w-4 h-4 text-[var(--accent)]" />
                                <span className="text-sm font-medium text-[var(--text-heading)]">{tech.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How it Works ── */}
            <section id="how-it-works" className="py-20 px-6 md:px-12 border-t border-[var(--border-subtle)] relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1.5 mb-4">
                            <BarChart3 className="w-3.5 h-3.5" /> How it Works
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl text-[var(--text-heading)] mb-4">
                            Simple as <span className="gradient-text">1-2-3</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {HOW_IT_WORKS.map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mx-auto mb-5">
                                    <span className="text-2xl font-display gradient-text">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--text-heading)] mb-2">{item.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Placement Highlights ── */}
            <section className="py-20 px-6 md:px-12 border-t border-[var(--border-subtle)] relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1.5 mb-4">
                            <Users className="w-3.5 h-3.5" /> Placement Highlights
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl text-[var(--text-heading)] mb-4">Top <span className="gradient-text">Placements</span></h2>
                        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">Real placement achievements from KR Mangalam University students</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-8 rounded-2xl relative">
                                <Quote className="w-8 h-8 text-[var(--accent)]/20 mb-4" />
                                <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] mb-6">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
                                        <span className="text-xs font-bold text-[var(--accent)]">{t.avatar}</span>
                                    </div>
                                    <div>
                                        <p className="text-[var(--text-heading)] font-semibold text-sm">{t.name}</p>
                                        <p className="text-[var(--text-muted)] text-xs mt-0.5">{t.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── About Section ── */}
            <section id="about" className="py-20 px-6 md:px-12 border-t border-[var(--border-subtle)] relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <span className="px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)] inline-flex items-center gap-1.5 mb-4">
                            <Star className="w-3.5 h-3.5" /> About
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl mb-5 text-[var(--text-heading)]">
                            Built for <span className="gradient-text">Students</span>
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-6 text-[16px]">
                            KRMAI is an AI assistant designed specifically for KR Mangalam University (KRMU) students.
                            It understands university policies, fee structures, placement procedures,
                            and campus information — giving you accurate, contextual answers instantly.
                        </p>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-8 text-[15px]">
                            Built with cutting-edge RAG (Retrieval-Augmented Generation) technology,
                            KRMAI ensures every answer is grounded in verified university documents,
                            so you can trust the information you receive.
                        </p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onEnterChat} className="btn-accent px-6 py-3 text-sm flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Start a Conversation
                        </motion.button>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                            {[
                                { icon: GraduationCap, label: 'Academics', stat: '100+ Programs' },
                                { icon: Briefcase, label: 'Placements', stat: '56.6 LPA' },
                                { icon: CreditCard, label: 'Fees', stat: 'Transparent' },
                                { icon: Cpu, label: 'Instant AI', stat: 'RAG Powered' },
                            ].map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card flex flex-col items-center gap-3 p-6 rounded-2xl">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                                        <item.icon className="w-6 h-6 text-[var(--accent)]" />
                                    </div>
                                    <span className="text-sm font-semibold text-[var(--text-heading)]">{item.label}</span>
                                    <span className="text-xs text-[var(--text-muted)]">{item.stat}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="py-20 px-6 md:px-12 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-3xl p-12 md:p-16">
                        <h2 className="font-display text-4xl md:text-5xl mb-5 text-[var(--text-heading)]">
                            Ready to Get <span className="gradient-text">Started</span>?
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-8 text-lg">Start chatting with KRMAI and get instant answers to all your KRMU questions.</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onEnterChat} className="btn-accent px-10 py-4 text-lg flex items-center gap-3 mx-auto shadow-[0_0_40px_var(--accent-glow)]">
                            Start Chatting Now <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-8 px-6 md:px-12 border-t border-[var(--border-subtle)] relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
                        <span className="font-display text-lg text-[var(--text-heading)]">KRMAI</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => onNavigate && onNavigate('projects')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer">Projects</button>
                        <button onClick={() => onNavigate && onNavigate('updates')} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer">Updates</button>
                        <a href="#features" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">Features</a>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">KR Mangalam University AI Assistant — Built with RAG + Ollama</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
