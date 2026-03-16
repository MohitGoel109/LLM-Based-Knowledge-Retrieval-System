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
    { x: '60%', y: '85%', size: 4, delay: 2.5, duration: 7.5, glow: true }
];

/* ─── Shooting star config (removed) ─── */

const BackgroundEffect = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Warm gradient spots */}
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

        {/* Pulsing gradient accent top-right */}
        <motion.div
            animate={{ opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-[500px] h-[500px]"
            style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
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
                background: 'radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 70%)',
            }}
        />

        {/* ─── Rotating Gradient Orbs Removed ─── */}

        {/* ─── Subtle Grid / Mesh Pattern Overlay ─── */}
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
                        ? 'radial-gradient(circle, #60a5fa, #3b82f6)'
                        : '#3b82f6',
                    boxShadow: p.glow
                        ? `0 0 ${p.size * 3}px rgba(59, 130, 246, 0.5), 0 0 ${p.size * 6}px rgba(59, 130, 246, 0.2)`
                        : `0 0 ${p.size * 2}px rgba(59, 130, 246, 0.4)`,
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

        {/* ─── Shooting Stars Removed ─── */}

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
