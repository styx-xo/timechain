import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useBlockData } from '../context/BlockStreamContext.tsx';
import { utxoDensity } from '../lib/thermodynamics.ts';
import { ExplainerDrawer } from '../components/ExplainerDrawer.tsx';
import { C_TERMINAL, E_P } from '../lib/constants.ts';

export function UtxoView() {
  const { latestThermo } = useBlockData();
  const [inputValue, setInputValue] = useState('1');
  const [isSats, setIsSats] = useState(false);
  const [copied, setCopied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const supply = latestThermo?.supply ?? C_TERMINAL;

  const computed = useMemo(() => {
    const raw = parseFloat(inputValue);
    if (isNaN(raw) || raw <= 0) return null;

    const sats = isSats ? raw : raw * 1e8;
    const density = utxoDensity(sats, supply);
    const valueBits = -Math.log2(density || 1e-30);
    const energyValue = sats * (E_P / supply);
    const pctOfSupply = (sats / supply) * 100;

    return { sats, density, valueBits, energyValue, pctOfSupply };
  }, [inputValue, isSats, supply]);

  const copyResults = () => {
    if (!computed) return;
    const text = [
      `TIMECHAIN UTXO Analysis`,
      `Amount: ${computed.sats.toLocaleString()} sats (${(computed.sats / 1e8).toFixed(8)} BTC)`,
      `Density (rho): ${computed.density.toExponential(6)}`,
      `Value-bits: ${computed.valueBits.toFixed(2)}`,
      `Energy value: ${computed.energyValue.toExponential(4)} J`,
      `% of supply: ${computed.pctOfSupply.toExponential(4)}%`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Density bar (log scale visualization)
  const densityLog = computed && computed.density > 0
    ? Math.min(Math.max(-Math.log10(computed.density) / 15, 0), 1) * 100
    : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="text-center">
        <h2 className="font-display text-lg font-bold tracking-wider" style={{ color: '#00e5ff' }}>
          Your UTXO
        </h2>
        <p className="text-xs mt-1" style={{ color: '#3a4060' }}>
          Find your place in the ledger
        </p>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="input-neon px-3 py-2 flex-1"
          placeholder={isSats ? 'Satoshis' : 'BTC'}
          min="0"
          step={isSats ? '1' : '0.00000001'}
        />
        <button
          onClick={() => setIsSats(!isSats)}
          className="btn-ghost px-3 py-2 text-xs shrink-0"
        >
          {isSats ? 'SATS' : 'BTC'}
        </button>
      </div>

      {/* Results */}
      {computed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col gap-3"
        >
          {/* Amount display */}
          <div className="text-center font-mono text-sm" style={{ color: '#8892bb' }}>
            {computed.sats.toLocaleString()} sats = {(computed.sats / 1e8).toFixed(8)} BTC
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(12,12,30,0.7)', border: '1px solid #1e2048' }}>
              <span className="text-[10px] font-display tracking-wider uppercase block" style={{ color: '#8892bb' }}>Density (rho)</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#00e5ff' }}>{computed.density.toExponential(6)}</span>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(12,12,30,0.7)', border: '1px solid #1e2048' }}>
              <span className="text-[10px] font-display tracking-wider uppercase block" style={{ color: '#8892bb' }}>Value-Bits</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#bf00ff' }}>{computed.valueBits.toFixed(2)} bits</span>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(12,12,30,0.7)', border: '1px solid #1e2048' }}>
              <span className="text-[10px] font-display tracking-wider uppercase block" style={{ color: '#8892bb' }}>Energy Value</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#7c3aff' }}>{computed.energyValue.toExponential(4)} J</span>
            </div>
            <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(12,12,30,0.7)', border: '1px solid #1e2048' }}>
              <span className="text-[10px] font-display tracking-wider uppercase block" style={{ color: '#8892bb' }}>% of Supply</span>
              <span className="font-mono text-sm font-bold" style={{ color: '#f59e0b' }}>{computed.pctOfSupply.toExponential(4)}%</span>
            </div>
          </div>

          {/* Density bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono" style={{ color: '#3a4060' }}>
              <span>Dense (whole coins)</span>
              <span>Sparse (dust)</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden relative" style={{ background: '#0c0c1e', border: '1px solid #1e2048' }}>
              <motion.div
                animate={{ width: `${100 - densityLog}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #00e5ff, #bf00ff)' }}
              />
            </div>
          </div>

          {/* Copy + Info */}
          <div className="flex items-center gap-2 justify-center">
            <button onClick={copyResults} className="btn-ghost px-3 py-1 text-xs flex items-center gap-1.5">
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Share'}
            </button>
            <button onClick={() => setDrawerOpen(true)} className="btn-ghost px-3 py-1 text-xs">
              What is density?
            </button>
          </div>
        </motion.div>
      )}

      <ExplainerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Your Place in the Ledger"
        simple="UTXO density measures how much of Bitcoin's total supply your output represents. A higher density means a larger share of the fixed 21 million. Value-bits measures how many binary decisions it takes to locate your UTXO in the full supply — more bits = smaller share."
        deep="Density rho = sats / C(h), where C(h) is the current circulating supply. This is a thermodynamic measure: your UTXO occupies a fraction of the total energy domain. Value-bits = -log2(rho) gives the information content — the number of bits needed to specify your position in the ledger. Energy value = sats * SC(h) converts your holding to physical energy units via Satoshi's Constant. As supply approaches C_terminal, these values converge to their final, permanent measurements."
      />
    </div>
  );
}
