import { motion } from 'framer-motion';
import {
    ArrowRight, GraduationCap, CreditCard, Briefcase,
    Shield, BookOpen, MessageSquare, Zap, Quote
} from 'lucide-react';

const FEATURES = [
    {
        icon: CreditCard,
        title: 'Fees & Scholarships',
        desc: 'Get detailed fee breakdowns and scholarship eligibility criteria across all programs.',
    },
    {
        icon: Briefcase,
        title: 'Placement Guidance',
        desc: 'Learn about the placement process, top recruiters, and preparation strategies.',
    },
    {
        icon: Shield,
        title: 'Rules & Policies',
        desc: 'Access hostel rules, anti-ragging policies, exam schedules, and academic guidelines.',
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
    { value: '56.6', suffix: ' LPA', label: 'Highest Package' },
    { value: '800', suffix: '+', label: 'Campus Recruiters' },
    { value: '100', suffix: '+', label: 'Programs Offered' },
    { value: '28', suffix: ' Acres', label: 'Campus Area' },
];

const TESTIMONIALS = [
    {
        quote: "KRMAI helped me understand the complete fee structure and scholarship eligibility within seconds. It saved me hours of searching through brochures.",
        name: "Priya Sharma",
        role: "BTech CSE, 2nd Year",
    },
    {
        quote: "The placement guidance feature is incredible. I got all the details about the recruitment process and top recruiters in one conversation.",
        name: "Rahul Verma",
        role: "BTech AI & ML, 3rd Year",
    },
    {
        quote: "As a hosteler, I always had questions about rules and timings. KRMAI gives me instant, accurate answers anytime I need them.",
        name: "Ananya Singh",
        role: "BTech Data Science, 1st Year",
    },
];

function LandingPage({ onEnterChat }) {
    return (
        <div className="min-h-screen bg-warm-gradient text-white overflow-y-auto">
            {/* ── Navbar ── */}
            <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-5 bg-[#0d0a08]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ff4d00] flex items-center justify-center shadow-[0_4px_12px_rgba(255,77,0,0.3)]">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display text-2xl text-white">KRMAI</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition">
                            Features
                        </a>
                        <a href="#about" className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition">
                            About
                        </a>
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
            <section className="relative pt-36 md:pt-48 pb-20 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 mb-8"
                        >
                            <span className="px-3 py-1 rounded-full bg-[#ff4d00] text-xs font-semibold text-white">
                                AI-Powered
                            </span>
                            <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                                Meet Your University AI Assistant
                                <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </motion.div>

                        {/* Hero Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.7 }}
                            className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] mb-7"
                        >
                            Unlock Deeper Insights with{' '}
                            <span className="text-[#ff4d00]">KR Mangalam</span>{' '}
                            University AI
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed"
                        >
                            Our AI-powered platform delivers instant, accurate answers about fees,
                            placements, scholarships, hostel rules, and everything you need as a
                            KR Mangalam University student.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onEnterChat}
                            className="btn-accent px-8 py-4 text-base flex items-center gap-3 shadow-[0_0_40px_rgba(255,77,0,0.25)]"
                        >
                            Start Chatting
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.button>
                    </div>
                </div>

                {/* Decorative gradient orb on right */}
                <div
                    className="hidden lg:block absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(255, 77, 0, 0.12) 0%, transparent 70%)',
                    }}
                />
            </section>

            {/* ── Stats Row ── */}
            <section className="py-10 border-t border-b border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-wrap justify-center gap-12 md:gap-20">
                    {STATS.map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="text-3xl md:text-4xl font-display text-[#ff4d00] mb-1">
                                {stat.value}{stat.suffix}
                            </div>
                            <div className="text-sm text-[var(--text-muted)] uppercase tracking-wider font-medium">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── Trust Bar ── */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <p className="text-sm text-[var(--text-muted)] uppercase tracking-widest mb-6 font-medium">
                        Covering all departments and university services
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {DEPARTMENTS.map((dept) => (
                            <span
                                key={dept}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/40 text-sm text-[var(--text-secondary)] font-medium hover:border-[rgba(255,77,0,0.2)] transition"
                            >
                                <BookOpen className="w-3.5 h-3.5 text-[#ff4d00]/60" />
                                {dept}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features Section ── */}
            <section id="features" className="py-20 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl md:text-5xl text-center mb-4"
                    >
                        Everything You Need,{' '}
                        <span className="text-[#ff4d00]">Instantly</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-[var(--text-secondary)] mb-14 max-w-xl mx-auto"
                    >
                        Get instant, AI-powered answers to all your university questions
                    </motion.p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {FEATURES.map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/60 hover:border-[rgba(255,77,0,0.2)] transition group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[rgba(255,77,0,0.1)] flex items-center justify-center mb-5 group-hover:bg-[rgba(255,77,0,0.2)] transition">
                                    <feat.icon className="w-6 h-6 text-[#ff4d00]" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">
                                    {feat.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] leading-relaxed text-[15px]">
                                    {feat.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials Section ── */}
            <section className="py-20 px-6 md:px-12 border-t border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-display text-4xl md:text-5xl text-center mb-4"
                    >
                        What Students <span className="text-[#ff4d00]">Say</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center text-[var(--text-secondary)] mb-14 max-w-xl mx-auto"
                    >
                        Real feedback from KR Mangalam University students
                    </motion.p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/60 relative"
                            >
                                <Quote className="w-8 h-8 text-[#ff4d00]/20 mb-4" />
                                <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] mb-6">
                                    "{t.quote}"
                                </p>
                                <div>
                                    <p className="text-white font-semibold text-sm">{t.name}</p>
                                    <p className="text-[var(--text-muted)] text-xs mt-0.5">{t.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── About Section ── */}
            <section id="about" className="py-20 px-6 md:px-12 border-t border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="font-display text-4xl md:text-5xl mb-5">
                            Built for{' '}
                            <span className="text-[#ff4d00]">Students</span>
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-6 text-[16px]">
                            KRMAI is designed specifically for KR Mangalam University students.
                            It understands university policies, fee structures, placement procedures,
                            and campus information — giving you accurate, contextual answers instantly.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onEnterChat}
                            className="btn-accent px-6 py-3 text-sm flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Start a Conversation
                        </motion.button>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                            {[
                                { icon: GraduationCap, label: 'Academics' },
                                { icon: Briefcase, label: 'Placements' },
                                { icon: CreditCard, label: 'Fees' },
                                { icon: Zap, label: 'Instant AI' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/40"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[rgba(255,77,0,0.1)] flex items-center justify-center">
                                        <item.icon className="w-6 h-6 text-[#ff4d00]" />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                                        {item.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-display text-4xl md:text-5xl mb-5">
                        Ready to Get <span className="text-[#ff4d00]">Started</span>?
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8 text-lg">
                        Start chatting with KRMAI and get instant answers to all your university questions.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onEnterChat}
                        className="btn-accent px-10 py-4 text-lg flex items-center gap-3 mx-auto shadow-[0_0_40px_rgba(255,77,0,0.25)]"
                    >
                        Start Chatting Now
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-8 px-6 md:px-12 border-t border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-[#ff4d00]" />
                        <span className="font-display text-lg">KRMAI</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                        KR Mangalam University AI Assistant
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
