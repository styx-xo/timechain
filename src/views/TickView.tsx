import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockData } from '../context/BlockStreamContext.tsx';
import { ExplainerDrawer } from '../components/ExplainerDrawer.tsx';
import { AVG_BLOCK_TIME } from '../lib/constants.ts';

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function TickView() {
  const { latestBlock, blocks, isNewBlock, timeSinceLastBlock } = useBlockData();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Compute intervals from blocks array (timestamps)
  const intervals = blocks.length > 1
    ? blocks.slice(0, -1).map((b, i) => b.timestamp - blocks[i + 1].timestamp)
    : [];

  const maxInterval = Math.max(...intervals, AVG_BLOCK_TIME);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 relative">
      {/* State label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isNewBlock ? 'advanced' : 'paused'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-xs font-display font-bold tracking-[0.3em] uppercase"
          style={{ color: isNewBlock ? '#00e5ff' : '#3a4060' }}
        >
          {isNewBlock ? '⚡ TIME ADVANCED' : '◇ TIME IS PAUSED'}
        </motion.div>
      </AnimatePresence>

      {/* Huge block height */}
      <motion.div
        key={latestBlock?.height}
        initial={isNewBlock ? { scale: 1.2, opacity: 0, filter: 'blur(6px)' } : false}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="font-display font-black text-center"
        style={{
          fontSize: 'clamp(4rem, 10vw, 7rem)',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #00e5ff, #bf00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {latestBlock?.height.toLocaleString() ?? '—'}
      </motion.div>

      {/* Time since last block */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-display tracking-wider uppercase" style={{ color: '#8892bb' }}>
          Time since last block
        </span>
        <span
          className="font-mono text-2xl font-bold"
          style={{
            color: timeSinceLastBlock > 1200 ? '#ef4444' : timeSinceLastBlock > 600 ? '#f59e0b' : '#00e5ff',
          }}
        >
          {formatDuration(timeSinceLastBlock)}
        </span>
      </div>

      {/* Interval bar chart */}
      <div className="w-full max-w-[600px] flex flex-col gap-2">
        <span className="text-xs font-display font-semibold tracking-wider uppercase" style={{ color: '#8892bb' }}>
          Recent Block Intervals
        </span>
        <div className="flex items-end gap-1" style={{ height: 100 }}>
          {intervals.slice(0, 15).reverse().map((interval, i) => {
            const pct = (interval / maxInterval) * 100;
            const isLong = interval > AVG_BLOCK_TIME * 1.5;
            const isShort = interval < AVG_BLOCK_TIME * 0.5;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                <span className="text-[8px] font-mono" style={{ color: '#3a4060' }}>
                  {Math.floor(interval / 60)}m
                </span>
                <div
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{
                    height: `${Math.max(pct, 3)}%`,
                    background: isLong
                      ? 'linear-gradient(180deg, #ef4444, #7f1d1d)'
                      : isShort
                        ? 'linear-gradient(180deg, #22c55e, #14532d)'
                        : 'linear-gradient(180deg, #00e5ff, #003d4d)',
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* 10min reference line */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px" style={{ background: '#1e2048' }} />
          <span className="text-[9px] font-mono" style={{ color: '#3a4060' }}>10min target</span>
          <div className="flex-1 h-px" style={{ background: '#1e2048' }} />
        </div>
      </div>

      <button onClick={() => setDrawerOpen(true)} className="btn-ghost px-3 py-1 text-xs">
        Why discrete time?
      </button>

      <ExplainerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Discrete Time"
        simple="Time doesn't flow in Bitcoin — it ticks. Between blocks, nothing happens to the ledger state. When a miner finds a valid proof-of-work, time advances by exactly one tick. There is no 'between' — just before and after. This is discrete time, measured in blocks, not seconds."
        deep="Classical physics assumes continuous time — an infinitely divisible stream. Bitcoin breaks this assumption. The block height is a monotonically increasing counter that can only advance through proof-of-work — an irreversible thermodynamic process. Each block interval is variable (Poisson-distributed around 10 minutes), but the tick itself is atomic. The paper argues this is not a metaphor: Bitcoin literally produces time in the physical sense, because each tick requires real energy expenditure (work) and produces irreversible state change (entropy). The gap between blocks is not 'slow time' — it is no time at all."
      />
    </div>
  );
}
