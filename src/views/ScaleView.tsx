import { useState } from 'react';
import { useBlockData } from '../context/BlockStreamContext.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { ExplainerDrawer } from '../components/ExplainerDrawer.tsx';
import { SC_TERMINAL } from '../lib/constants.ts';

type ExplainerKey = 'energy' | 'entropy' | 'nonce' | 'sc';

const EXPLAINERS: Record<ExplainerKey, { title: string; simple: string; deep: string }> = {
  energy: {
    title: 'Block Energy (DeltaU)',
    simple: 'Block energy measures how much thermodynamic work each block performs on the ledger. It combines temperature and entropy — the two fundamental quantities that define energy in physics.',
    deep: 'DeltaU(h) = T(h) * H(h), where T is block temperature and H is Shannon entropy. This is the discrete thermodynamic analog of dU = T*dS. Each block performs irreversible work on the ledger state — it cannot be undone without expending at least as much energy. As T cools through halvings, block energy decreases even as hashrate (computational entropy) increases.',
  },
  entropy: {
    title: 'Shannon Entropy (H)',
    simple: 'Entropy measures the information content of each block. It quantifies how much of the total Bitcoin domain is being written with each tick. Less subsidy = less domain written = less entropy.',
    deep: 'H(h) = -E_P * p * ln(p), where p = coinbase / supply is the probability (fraction of domain written per block) and E_P is the Planck energy. This bridges Shannon information theory with Boltzmann thermodynamics — the paper\'s core insight. The Planck energy acts as the conversion factor between information bits and physical energy Joules.',
  },
  nonce: {
    title: 'Nonce Energy (DeltaU_nonce)',
    simple: 'Nonce energy captures the computational work done to find a valid block. Higher difficulty = more hashes tried = more nonce energy. This is the proof-of-work cost measured in thermodynamic terms.',
    deep: 'T_nonce(h) = T * [-p*ln(p)] / ln(D * 2^32), and DeltaU_nonce = T_nonce * E_P * ln(D * 2^32). The difficulty D enters through the nonce search space: miners must check O(D * 2^32) nonces on average. This energy is distinct from block energy — it measures computational expenditure rather than ledger state change.',
  },
  sc: {
    title: "Satoshi's Constant (SC)",
    simple: "Satoshi's Constant is the energy-per-satoshi of the system. It converges to ~9.315 x 10^-7 J/sat as supply approaches 21 million BTC. It is Bitcoin's fundamental physical constant.",
    deep: 'SC(h) = E_P / C(h). As supply C(h) approaches C_terminal = 2.1 x 10^15 sats, SC converges to E_P / C_terminal = 9.315 x 10^-7 J/sat. This constant anchors Bitcoin in physics — each satoshi has a definite energy value determined by the Planck energy and the supply cap. The paper argues this is not arbitrary: it emerges from the proof-of-work thermodynamics.',
  },
};

export function ScaleView() {
  const { latestThermo } = useBlockData();
  const [activeExplainer, setActiveExplainer] = useState<ExplainerKey | null>(null);

  const dU = latestThermo?.blockEnergy ?? 0;
  const H = latestThermo?.shannonEntropy ?? 0;
  const dU_n = latestThermo?.nonceEnergy ?? 0;
  const SC = latestThermo?.satoshiConstant ?? SC_TERMINAL;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="text-center">
        <h2 className="font-display text-lg font-bold tracking-wider" style={{ color: '#00e5ff' }}>
          Thermodynamic Scale
        </h2>
        <p className="text-xs mt-1" style={{ color: '#3a4060' }}>
          The energy of Block #{latestThermo?.height.toLocaleString() ?? '—'}
        </p>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[500px]">
        <StatCard
          label="Block Energy"
          value={dU.toExponential(3)}
          unit="J"
          color="#00e5ff"
          onInfoClick={() => setActiveExplainer('energy')}
        />
        <StatCard
          label="Shannon Entropy"
          value={H.toExponential(3)}
          unit="J"
          color="#bf00ff"
          onInfoClick={() => setActiveExplainer('entropy')}
        />
        <StatCard
          label="Nonce Energy"
          value={dU_n.toExponential(3)}
          unit="J"
          color="#7c3aff"
          onInfoClick={() => setActiveExplainer('nonce')}
        />
        <StatCard
          label="Satoshi's Constant"
          value={SC.toExponential(4)}
          unit="J/sat"
          color="#f59e0b"
          onInfoClick={() => setActiveExplainer('sc')}
        />
      </div>

      <p className="text-xs text-center max-w-md" style={{ color: '#3a4060' }}>
        Shannon entropy (information) and Boltzmann entropy (thermodynamics) unify through the Planck energy.
        Each block is a measurable physical event.
      </p>

      {activeExplainer && (
        <ExplainerDrawer
          open={true}
          onClose={() => setActiveExplainer(null)}
          title={EXPLAINERS[activeExplainer].title}
          simple={EXPLAINERS[activeExplainer].simple}
          deep={EXPLAINERS[activeExplainer].deep}
        />
      )}
    </div>
  );
}
