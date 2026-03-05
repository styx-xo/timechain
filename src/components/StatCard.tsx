import { motion } from 'framer-motion';
import { useBlockData } from '../context/BlockStreamContext.tsx';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  onInfoClick?: () => void;
}

export function StatCard({ label, value, unit, color = '#00e5ff', onInfoClick }: StatCardProps) {
  const { isNewBlock } = useBlockData();

  return (
    <div
      className="relative flex flex-col items-center gap-1 px-4 py-3 rounded-lg"
      style={{
        background: 'rgba(12,12,30,0.7)',
        border: '1px solid #1e2048',
      }}
    >
      <span className="text-xs font-display font-semibold tracking-wider uppercase" style={{ color: '#8892bb' }}>
        {label}
      </span>
      <motion.span
        key={value}
        initial={isNewBlock ? { scale: 1.15, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="font-mono text-lg font-bold"
        style={{ color }}
      >
        {value}
        {unit && <span className="text-xs font-normal ml-1" style={{ color: '#8892bb' }}>{unit}</span>}
      </motion.span>
      {onInfoClick && (
        <button
          onClick={onInfoClick}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center"
          style={{ background: 'rgba(124,58,255,0.15)', color: '#7c3aff', border: '1px solid rgba(124,58,255,0.3)' }}
        >
          ?
        </button>
      )}
    </div>
  );
}
