import { motion } from 'framer-motion';

const LoadingDots = () => (
    <div className="flex items-center gap-1.5 px-3 py-3">
        {[0, 1, 2].map(i => (
            <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                animate={{
                    y: [-4, 4, -4],
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                }}
                style={{
                    background: '#3b82f6',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
                }}
            />
        ))}
        <span
            className="ml-3 text-[14px] font-bold tracking-widest uppercase"
            style={{ color: '#3b82f6' }}
        >
            Processing
        </span>
    </div>
);

export default LoadingDots;
