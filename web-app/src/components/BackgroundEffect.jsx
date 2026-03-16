import { motion } from 'framer-motion';

/* ─── Premium Glass Orb Background Effect ─── */
const BackgroundEffect = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Primary ambient gradient */}
        <div
            className="absolute inset-0"
            style={{
                background: `
                    radial-gradient(ellipse 60% 50% at 15% 10%, rgba(59, 130, 246, 0.07) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 60% at 85% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 60%),
                    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(96, 165, 250, 0.03) 0%, transparent 50%)
                `,
            }}
        />

        {/* Floating Glass Orb 1 — top-right */}
        <motion.div
            animate={{
                x: [0, 40, -20, 30, 0],
                y: [0, -30, 20, -15, 0],
                scale: [1, 1.05, 0.95, 1.03, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-[500px] h-[500px]"
        >
            <div
                className="w-full h-full rounded-full"
                style={{
                    background: 'radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 40%, transparent 70%)',
                    backdropFilter: 'blur(1px)',
                    border: '1px solid rgba(59, 130, 246, 0.05)',
                }}
            />
        </motion.div>

        {/* Floating Glass Orb 2 — bottom-left */}
        <motion.div
            animate={{
                x: [0, -30, 20, -25, 0],
                y: [0, 20, -30, 15, 0],
                scale: [1, 0.95, 1.05, 0.98, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-32 -left-32 w-[400px] h-[400px]"
        >
            <div
                className="w-full h-full rounded-full"
                style={{
                    background: 'radial-gradient(circle at 60% 60%, rgba(96, 165, 250, 0.10) 0%, rgba(96, 165, 250, 0.03) 40%, transparent 70%)',
                    backdropFilter: 'blur(1px)',
                    border: '1px solid rgba(96, 165, 250, 0.04)',
                }}
            />
        </motion.div>

        {/* Floating Glass Orb 3 — center */}
        <motion.div
            animate={{
                opacity: [0.03, 0.08, 0.03],
                scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[30%] left-[40%] w-[600px] h-[600px]"
        >
            <div
                className="w-full h-full rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 60%)',
                }}
            />
        </motion.div>

        {/* Aurora Ribbon — top gradient sweep */}
        <motion.div
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 right-0 h-[2px] opacity-30"
            style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 25%, rgba(96, 165, 250, 0.8) 50%, rgba(59, 130, 246, 0.6) 75%, transparent 100%)',
                backgroundSize: '200% 100%',
            }}
        />

        {/* Grid Pattern Overlay */}
        <div
            className="absolute inset-0 grid-overlay"
            style={{
                backgroundImage: `
                    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%)',
            }}
        />

        {/* Floating glass micro-particles */}
        {[
            { x: '15%', y: '20%', size: 4, delay: 0, duration: 8, glow: true },
            { x: '75%', y: '15%', size: 3, delay: 2, duration: 10, glow: false },
            { x: '85%', y: '70%', size: 5, delay: 1, duration: 9, glow: true },
            { x: '25%', y: '80%', size: 3, delay: 3, duration: 7, glow: false },
            { x: '50%', y: '40%', size: 2, delay: 0.5, duration: 11, glow: false },
            { x: '10%', y: '60%', size: 3, delay: 4, duration: 8.5, glow: true },
            { x: '90%', y: '30%', size: 2, delay: 1.5, duration: 12, glow: false },
            { x: '60%', y: '85%', size: 4, delay: 2.5, duration: 7.5, glow: true },
        ].map((p, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    background: p.glow
                        ? 'radial-gradient(circle, rgba(96, 165, 250, 0.8), rgba(59, 130, 246, 0.6))'
                        : 'rgba(59, 130, 246, 0.5)',
                    boxShadow: p.glow
                        ? `0 0 ${p.size * 3}px rgba(59, 130, 246, 0.4), 0 0 ${p.size * 6}px rgba(59, 130, 246, 0.15)`
                        : `0 0 ${p.size * 2}px rgba(59, 130, 246, 0.3)`,
                }}
                animate={{
                    y: [0, -25, 5, -15, 0],
                    x: [0, 12, -8, 10, 0],
                    opacity: p.glow
                        ? [0.3, 0.7, 0.35, 0.6, 0.3]
                        : [0.2, 0.5, 0.25, 0.4, 0.2],
                    scale: [1, 1.3, 0.9, 1.2, 1],
                }}
                transition={{
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        ))}

        {/* Noise texture */}
        <div
            className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
        />
    </div>
);

export default BackgroundEffect;
