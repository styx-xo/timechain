import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBlockData } from '../context/BlockStreamContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { CoolingChart } from '../components/CoolingChart.tsx';
import { ExplainerDrawer } from '../components/ExplainerDrawer.tsx';
import { HALVING_INTERVAL } from '../lib/constants.ts';

const REGIME_COLORS = {
  subsidy: '#00e5ff',
  transitional: '#f59e0b',
  terminal: '#bf00ff',
};

export function ThermoView() {
  const { latestThermo, isNewBlock } = useBlockData();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const T = latestThermo?.temperature ?? 0;
  const fr = latestThermo?.feeRatio ?? 0;
  const r = latestThermo?.regime ?? 'subsidy';
  const sub = latestThermo?.subsidy ?? 0;
  const height = latestThermo?.height ?? 0;
  const currentEra = Math.floor(height / HALVING_INTERVAL);
  const nextHalving = (currentEra + 1) * HALVING_INTERVAL;
  const blocksUntilHalving = nextHalving - height;

  // Temperature gauge — log scale position (T ranges from ~1e-1 to ~1e-15)
  const logT = T > 0 ? -Math.log10(T) : 15;
  const gaugePct = Math.min(Math.max((logT / 15) * 100, 0), 100);

  return (
    <div className="flex h-full gap-6 items-start pt-4">
      {/* Left: Temperature Gauge */}
      <div className="flex flex-col items-center gap-3 w-48 shrink-0">
        <span className="text-xs font-display font-semibold tracking-wider uppercase" style={{ color: '#8892bb' }}>
          Block Temperature
        </span>

        {/* Vertical gauge */}
        <div className="relative w-8 rounded-full overflow-hidden" style={{ height: 260, background: '#0c0c1e', border: '1px solid #1e2048' }}>
          <motion.div
            animate={{ height: `${gaugePct}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute bottom-0 left-0 right-0 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #bf00ff, #00e5ff)',
              boxShadow: '0 0 20px rgba(0,229,255,0.3)',
            }}
          />
          {/* Scale labels */}
          {[0, 5, 10, 15].map((v) => (
            <span
              key={v}
              className="absolute text-[8px] font-mono"
              style={{ right: -28, bottom: `${(v / 15) * 100}%`, color: '#3a4060', transform: 'translateY(50%)' }}
            >
              10⁻{v}
            </span>
          ))}
        </div>

        {/* Current value */}
        <motion.div
          key={latestThermo?.height}
          initial={isNewBlock ? { scale: 1.1 } : false}
          animate={{ scale: 1 }}
          className="font-mono text-sm font-bold text-center"
          style={{ color: '#00e5ff' }}
        >
          T = {T.toExponential(3)}
        </motion.div>

        {/* Regime badge */}
        <span
          className="chip-low text-xs font-display font-bold tracking-wider uppercase px-3 py-1"
          style={{ color: REGIME_COLORS[r], borderColor: REGIME_COLORS[r], background: `${REGIME_COLORS[r]}15` }}
        >
          {r} era
        </span>
      </div>

      {/* Right: Charts + stats */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Cooling chart */}
        <CoolingChart currentHeight={height} />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            label="Fee Ratio"
            value={(fr * 100).toFixed(2) + '%'}
            color={fr > 0.5 ? '#f59e0b' : '#8892bb'}
          />
          <StatCard
            label="Subsidy"
            value={(sub / 1e8).toFixed(4)}
            unit="BTC"
            color="#bf00ff"
          />
          <StatCard
            label="Next Halving"
            value={blocksUntilHalving.toLocaleString()}
            unit="blocks"
            color="#00e5ff"
          />
        </div>

        {/* Fee ratio bar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono" style={{ color: '#3a4060' }}>
            <span>Subsidy</span>
            <span>Fees</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex" style={{ background: '#0c0c1e', border: '1px solid #1e2048' }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${(1 - fr) * 100}%`, background: 'linear-gradient(90deg, #bf00ff, #7c3aff)' }}
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${fr * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
            />
          </div>
        </div>

        <button onClick={() => setDrawerOpen(true)} className="btn-ghost px-3 py-1 text-xs self-start">
          Why temperature?
        </button>
      </div>

      <ExplainerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Bitcoin's Temperature"
        simple="Bitcoin has a measurable temperature. Each block's coinbase (subsidy + fees) divided by the circulating supply gives a temperature T that cools over time. Halvings cut the subsidy in half, reducing T. Bitcoin is cooling toward absolute zero — a state of perfect order where no new coins are created."
        deep="The paper defines block temperature as T(h) = coinbase(h) / C(h), where coinbase is the total block reward (subsidy + fees) and C(h) is the circulating supply. This maps directly to the Boltzmann framework: T governs how much 'disorder' (new satoshis entering the system) each block introduces relative to the existing supply. As halvings reduce the subsidy, T drops exponentially — a discrete cooling schedule. The fee ratio determines the regime: subsidy-dominant (T driven by issuance), transitional (mixed), or terminal (fees only, T → minimum). In the terminal era, Bitcoin's temperature approaches SC_terminal = E_P / 21M BTC — Satoshi's Constant."
      />
    </div>
  );
}
