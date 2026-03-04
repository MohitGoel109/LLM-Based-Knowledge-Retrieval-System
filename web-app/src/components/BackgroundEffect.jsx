import { motion } from 'framer-motion';

const particles = [
    { x: '15%', y: '20%', size: 4, delay: 0, duration: 8 },
    { x: '75%', y: '15%', size: 3, delay: 2, duration: 10 },
    { x: '85%', y: '70%', size: 5, delay: 1, duration: 9 },
    { x: '25%', y: '80%', size: 3, delay: 3, duration: 7 },
];

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
                    background: '#ff4d00',
                    boxShadow: '0 0 8px rgba(255, 77, 0, 0.4)',
                }}
                animate={{
                    y: [0, -20, 0, 15, 0],
                    x: [0, 10, -5, 8, 0],
                    opacity: [0.3, 0.6, 0.3, 0.5, 0.3],
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
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
        />
    </div>
);

export default BackgroundEffect;
