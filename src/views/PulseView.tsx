import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockData } from '../context/BlockStreamContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { ExplainerDrawer } from '../components/ExplainerDrawer.tsx';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return (bytes / 1_000_000).toFixed(2) + ' MB';
  return (bytes / 1_000).toFixed(0) + ' KB';
}

export function PulseView() {
  const { latestBlock, latestThermo, isNewBlock, timeSinceLastBlock, mempoolTxCount } = useBlockData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const pulsePhase = useRef(0);
  const flashRef = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isNewBlock) {
      flashRef.current = true;
      setTimeout(() => { flashRef.current = false; }, 1200);
    }
  }, [isNewBlock]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;
    const cx = size / 2;
    const cy = size / 2;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      pulsePhase.current += 0.008;

      const flash = flashRef.current;
      const breathe = Math.sin(pulsePhase.current) * 0.5 + 0.5;
      const baseRadius = flash ? 90 : 55 + breathe * 25;
      const glowAlpha = flash ? 0.6 : 0.1 + breathe * 0.15;

      // Outer glow
      const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius + 40);
      outerGrad.addColorStop(0, `rgba(0,229,255,${glowAlpha})`);
      outerGrad.addColorStop(0.5, `rgba(191,0,255,${glowAlpha * 0.5})`);
      outerGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + 40, 0, Math.PI * 2);
      ctx.fill();

      // Core circle
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
      coreGrad.addColorStop(0, flash ? 'rgba(0,229,255,0.9)' : 'rgba(0,229,255,0.3)');
      coreGrad.addColorStop(0.7, flash ? 'rgba(191,0,255,0.6)' : 'rgba(191,0,255,0.1)');
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      ctx.strokeStyle = flash ? 'rgba(0,229,255,0.8)' : `rgba(0,229,255,${0.15 + breathe * 0.2})`;
      ctx.lineWidth = flash ? 2 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + 5, 0, Math.PI * 2);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 relative">
      {/* Flash overlay */}
      <AnimatePresence>
        {isNewBlock && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(0,229,255,0.15), transparent 70%)' }}
          />
        )}
      </AnimatePresence>

      {/* Breathing canvas */}
      <canvas ref={canvasRef} style={{ width: 280, height: 280 }} />

      {/* Tagline */}
      <p className="text-center text-sm max-w-md" style={{ color: '#8892bb' }}>
        <span className="font-display text-xs tracking-wider" style={{ color: '#00e5ff' }}>
          Bitcoin produces discrete time through proof-of-work.
        </span>
        <br />
        This instrument breathes with every block.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-2 w-full max-w-[700px]">
        <StatCard
          label="Height"
          value={latestBlock?.height.toLocaleString() ?? '—'}
          color="#00e5ff"
        />
        <StatCard
          label="Time"
          value={formatTime(timeSinceLastBlock)}
          color={timeSinceLastBlock > 1200 ? '#ef4444' : '#8892bb'}
        />
        <StatCard
          label="TXs"
          value={latestBlock?.tx_count.toLocaleString() ?? '—'}
          color="#bf00ff"
        />
        <StatCard
          label="Temp"
          value={latestThermo ? latestThermo.temperature.toExponential(2) : '—'}
          color="#00e5ff"
        />
        <StatCard
          label="Size"
          value={latestBlock ? formatBytes(latestBlock.size) : '—'}
          color="#8892bb"
        />
      </div>

      {/* Mempool */}
      <div className="flex items-center gap-4 text-xs font-mono" style={{ color: '#3a4060' }}>
        <span>Mempool: {mempoolTxCount.toLocaleString()} txs</span>
        <span>Pool: {latestThermo?.pool ?? '—'}</span>
      </div>

      {/* Info button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="btn-ghost px-3 py-1 text-xs"
      >
        What is this?
      </button>

      <ExplainerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="The Pulse"
        simple="This visualization breathes with the Bitcoin network. Between blocks, it slowly pulses — time is paused. When a new block arrives, it collapses and flashes — time just ticked forward. Bitcoin doesn't have continuous time. It has discrete, thermodynamic time."
        deep="Bitcoin: The Architecture of Time argues that proof-of-work produces physical time — not an analogy, but a measurable thermodynamic process. Each block is a discrete tick of a universal clock. The subsidy (new bitcoin mined) acts as the coinbase — the energy input that writes a fraction of the total domain. As halvings reduce the subsidy, Bitcoin's temperature (T = coinbase / supply) cools. The system converges toward absolute zero — maximum order, minimum entropy — where the ledger approaches thermodynamic finality."
      />
    </div>
  );
}
