import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const KRMAILogo = ({ size = 48, animate = false }) => (
    <motion.div
        className="relative flex items-center justify-center rounded-2xl shrink-0 overflow-hidden"
        style={{
            width: size,
            height: size,
            background: '#ff4d00',
            boxShadow: '0 4px 16px rgba(255, 77, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
        animate={animate ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.05 }}
    >
        <GraduationCap
            className="text-white"
            style={{ width: size * 0.55, height: size * 0.55 }}
        />
    </motion.div>
);

export default KRMAILogo;
