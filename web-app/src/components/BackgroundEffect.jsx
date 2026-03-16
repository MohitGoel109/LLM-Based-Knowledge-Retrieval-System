import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/* ─── Expanded particle set (~20 particles with varied sizes & glow) ─── */
const particles = [
    { x: '15%', y: '20%', size: 4, delay: 0, duration: 8, glow: true },
    { x: '75%', y: '15%', size: 3, delay: 2, duration: 10, glow: false },
    { x: '85%', y: '70%', size: 5, delay: 1, duration: 9, glow: true },
    { x: '25%', y: '80%', size: 3, delay: 3, duration: 7, glow: false },
    { x: '50%', y: '40%', size: 2, delay: 0.5, duration: 11, glow: false },
    { x: '10%', y: '60%', size: 3, delay: 4, duration: 8.5, glow: true },
    { x: '90%', y: '30%', size: 2, delay: 1.5, duration: 12, glow: false },
    { x: '60%', y: '85%', size: 4, delay: 2.5, duration: 7.5, glow: true },
    { x: '35%', y: '10%', size: 2, delay: 3.5, duration: 10.5, glow: false },
    { x: '70%', y: '55%', size: 3, delay: 0.8, duration: 9.5, glow: false },
    /* New particles */
    { x: '5%', y: '45%', size: 2, delay: 1.2, duration: 13, glow: false },
    { x: '42%', y: '75%', size: 6, delay: 0.3, duration: 8, glow: true },
    { x: '88%', y: '50%', size: 2, delay: 5, duration: 11, glow: false },
    { x: '20%', y: '35%', size: 3, delay: 2.2, duration: 9, glow: true },
    { x: '65%', y: '10%', size: 4, delay: 1.8, duration: 10, glow: true },
    { x: '55%', y: '65%', size: 2, delay: 4.5, duration: 7, glow: false },
    { x: '30%', y: '55%', size: 5, delay: 0.7, duration: 12, glow: true },
    { x: '80%', y: '90%', size: 3, delay: 3.2, duration: 8.5, glow: false },
    { x: '45%', y: '25%', size: 2, delay: 2.8, duration: 14, glow: false },
    { x: '95%', y: '45%', size: 3, delay: 1.0, duration: 9, glow: true },
];

/* ─── Shooting star config ─── */
const SHOOTING_STAR_CONFIGS = [
    { startX: '10%', startY: '5%', angle: -30, travelX: 700, travelY: 350, length: 90, duration: 1.8 },
    { startX: '60%', startY: '2%', angle: -40, travelX: 500, travelY: 400, length: 70, duration: 2.2 },
    { startX: '30%', startY: '8%', angle: -25, travelX: 800, travelY: 300, length: 100, duration: 1.5 },
    { startX: '80%', startY: '3%', angle: -50, travelX: 400, travelY: 500, length: 60, duration: 2.0 },
];

function ShootingStar({ config }) {
    const [visible, setVisible] = useState(false);
    const [key, setKey] = useState(0);

    useEffect(() => {
        const scheduleNext = () => {
            const delay = 4000 + Math.random() * 8000; // 4-12 seconds between appearances
            const timer = setTimeout(() => {
                setKey((k) => k + 1);
                setVisible(true);
                setTimeout(() => setVisible(false), config.duration * 1000 + 200);
                scheduleNext();
            }, delay);
            return timer;
        };

        // Initial random delay so they don't all fire at once
        const initialDelay = Math.random() * 6000;
        const initialTimer = setTimeout(() => {
            setKey((k) => k + 1);
            setVisible(true);
            setTimeout(() => setVisible(false), config.duration * 1000 + 200);
            scheduleNext();
        }, initialDelay);

        return () => clearTimeout(initialTimer);
    }, [config.duration]);

    if (!visible) return null;

    return (
        <div
            key={key}
            className="shooting-star"
            style={{
                left: config.startX,
                top: config.startY,
                '--star-angle': `${config.angle}deg`,
                '--star-travel-x': `${config.travelX}px`,
                '--star-travel-y': `${config.travelY}px`,
                '--star-length': `${config.length}px`,
                '--star-duration': `${config.duration}s`,
            }}
        />
    );
}

const BackgroundEffect = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Warm gradient spots */}
        <div
            className="absolute inset-0"
            style={{
                background: `
                    radial-gradient(ellipse 60% 50% at 15% 10%, rgba(255, 77, 0, 0.07) 0%, transparent 60%),
                    radial-gradient(ellipse 50% 60% at 85% 80%, rgba(255, 77, 0, 0.05) 0%, transparent 60%),
                    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255, 120, 50, 0.03) 0%, transparent 50%)
                `,
            }}
        />

        {/* Pulsing gradient accent top-right */}
        <motion.div
            animate={{ opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-[500px] h-[500px]"
            style={{
                background: 'radial-gradient(circle, rgba(255, 77, 0, 0.15) 0%, transparent 70%)',
            }}
        />

        {/* Slow-moving ambient glow bottom-left */}
        <motion.div
            animate={{
                opacity: [0.03, 0.07, 0.03],
                x: [0, 30, 0],
                y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-32 -left-32 w-[400px] h-[400px]"
            style={{
                background: 'radial-gradient(circle, rgba(255, 120, 50, 0.12) 0%, transparent 70%)',
            }}
        />

        {/* ─── Rotating Gradient Orbs ─── */}
        <motion.div
            animate={{ opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[20%] w-[350px] h-[350px]"
            style={{
                background: 'radial-gradient(ellipse, rgba(255, 77, 0, 0.12) 0%, rgba(255, 120, 50, 0.04) 40%, transparent 70%)',
                filter: 'blur(40px)',
                animation: 'orbDrift 25s ease-in-out infinite',
            }}
        />
        <motion.div
            animate={{ opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-[20%] right-[15%] w-[300px] h-[300px]"
            style={{
                background: 'radial-gradient(ellipse, rgba(255, 100, 40, 0.1) 0%, rgba(255, 77, 0, 0.03) 40%, transparent 70%)',
                filter: 'blur(50px)',
                animation: 'orbDrift 30s ease-in-out infinite reverse',
            }}
        />
        <motion.div
            animate={{ opacity: [0.015, 0.04, 0.015] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            className="absolute top-[60%] left-[55%] w-[250px] h-[250px]"
            style={{
                background: 'radial-gradient(ellipse, rgba(255, 140, 60, 0.08) 0%, transparent 60%)',
                filter: 'blur(35px)',
                animation: 'orbDrift 20s ease-in-out infinite',
                animationDelay: '-8s',
            }}
        />

        {/* ─── Subtle Grid / Mesh Pattern Overlay ─── */}
        <div
            className="absolute inset-0 grid-overlay"
            style={{
                backgroundImage: `
                    linear-gradient(rgba(255, 77, 0, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 77, 0, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 70%)',
            }}
        />

        {/* Floating particles */}
        {particles.map((p, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                    left: p.x,
                    top: p.y,
                    width: p.size,
                    height: p.size,
                    background: p.glow
                        ? 'radial-gradient(circle, #ff6a2a, #ff4d00)'
                        : '#ff4d00',
                    boxShadow: p.glow
                        ? `0 0 ${p.size * 3}px rgba(255, 77, 0, 0.5), 0 0 ${p.size * 6}px rgba(255, 77, 0, 0.2)`
                        : `0 0 ${p.size * 2}px rgba(255, 77, 0, 0.4)`,
                }}
                animate={{
                    y: [0, -25, 5, -15, 0],
                    x: [0, 12, -8, 10, 0],
                    opacity: p.glow
                        ? [0.3, 0.7, 0.35, 0.6, 0.3]
                        : [0.2, 0.6, 0.25, 0.5, 0.2],
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

        {/* ─── Shooting Stars ─── */}
        {SHOOTING_STAR_CONFIGS.map((config, i) => (
            <ShootingStar key={i} config={config} />
        ))}

        {/* Noise texture */}
        <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
        />
    </div>
);

export default BackgroundEffect;
