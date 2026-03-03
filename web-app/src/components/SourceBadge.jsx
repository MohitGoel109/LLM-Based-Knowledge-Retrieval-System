import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';

function SourceBadge({ source }) {
    const name = source.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
    return (
        <motion.span
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold tracking-widest uppercase cursor-pointer transition-all bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[rgba(255,77,0,0.3)] hover:bg-[var(--bg-hover)]"
        >
            <Hash className="w-3.5 h-3.5 text-[#ff4d00]" />
            {name}
        </motion.span>
    );
}

export default SourceBadge;
