import { Activity, Clock, Thermometer, Scale, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ViewId } from '../lib/types.ts';
import { useBlockData } from '../context/BlockStreamContext.tsx';

const TABS: { id: ViewId; label: string; icon: typeof Activity }[] = [
  { id: 'pulse', label: 'Pulse', icon: Activity },
  { id: 'tick', label: 'Clock', icon: Clock },
  { id: 'thermo', label: 'Thermo', icon: Thermometer },
  { id: 'scale', label: 'Scale', icon: Scale },
  { id: 'utxo', label: 'UTXO', icon: Search },
];

interface HeaderProps {
  activeView: ViewId;
  onViewChange: (v: ViewId) => void;
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  const { connected, latestBlock, isNewBlock } = useBlockData();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4"
      style={{ background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e2048' }}>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="font-display text-lg font-bold tracking-wider"
          style={{ background: 'linear-gradient(135deg, #00e5ff, #bf00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TIMECHAIN
        </span>
        <span className="text-text-dim text-xs font-mono hidden sm:inline">The Open Laboratory</span>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-semibold tracking-wide transition-colors"
            style={{
              color: activeView === id ? '#00e5ff' : '#8892bb',
              background: activeView === id ? 'rgba(0,229,255,0.08)' : 'transparent',
            }}
          >
            <Icon size={14} />
            <span className="hidden md:inline">{label}</span>
            {activeView === id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ background: '#00e5ff' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Live indicator */}
      <div className="flex items-center gap-2">
        {latestBlock && (
          <span className="font-mono text-xs text-text-secondary">
            #{latestBlock.height.toLocaleString()}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: connected ? (isNewBlock ? '#00e5ff' : '#22c55e') : '#ef4444',
              boxShadow: isNewBlock ? '0 0 12px rgba(0,229,255,0.8)' : connected ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
              transition: 'all 0.3s',
            }}
          />
          <span className="text-xs font-mono text-text-dim">
            {connected ? 'LIVE' : '...'}
          </span>
        </div>
      </div>
    </header>
  );
}
