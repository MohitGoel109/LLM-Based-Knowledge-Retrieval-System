import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

function getSourceLabel(source) {
    const name = source.replace(/\.[^.]+$/, '');
    if (name.startsWith('krmu_') || name.startsWith('krmu-')) {
        return 'krmangalam.edu.in';
    }
    return name.replace(/_/g, ' ');
}

function SourceBadge({ source }) {
    const name = getSourceLabel(source);
    return (
        <motion.span
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold tracking-widest uppercase cursor-pointer transition-all bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[rgba(59, 130, 246,0.3)] hover:bg-[var(--bg-hover)]"
        >
            <ExternalLink className="w-3.5 h-3.5 text-[#3b82f6]" />
            {name}
        </motion.span>
    );
}

export { getSourceLabel };
export default SourceBadge;
