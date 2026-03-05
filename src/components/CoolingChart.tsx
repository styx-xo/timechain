import { useMemo } from 'react';
import { subsidy, circulatingSupply, temperature } from '../lib/thermodynamics.ts';
import { HALVING_INTERVAL } from '../lib/constants.ts';

const ERA_COUNT = 10; // Show first 10 eras (plenty to see cooling)

export function CoolingChart({ currentHeight }: { currentHeight: number }) {
  const eras = useMemo(() => {
    const result: { era: number; height: number; temp: number; isCurrent: boolean }[] = [];
    for (let e = 0; e < ERA_COUNT; e++) {
      const h = e * HALVING_INTERVAL;
      const sub = subsidy(h);
      const supply = circulatingSupply(h);
      const coinbase = sub; // Pure subsidy at era start
      const T = temperature(coinbase, supply);
      const currentEra = Math.floor(currentHeight / HALVING_INTERVAL);
      result.push({ era: e, height: h, temp: T, isCurrent: e === currentEra });
    }
    return result;
  }, [currentHeight]);

  const maxTemp = Math.max(...eras.map((e) => e.temp));

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-display font-semibold tracking-wider uppercase" style={{ color: '#8892bb' }}>
        Cooling Curve — Halving Eras
      </span>
      <div className="flex items-end gap-1.5" style={{ height: 120 }}>
        {eras.map((e) => {
          const pct = maxTemp > 0 ? (e.temp / maxTemp) * 100 : 0;
          return (
            <div key={e.era} className="flex flex-col items-center gap-1 flex-1">
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  background: e.isCurrent
                    ? 'linear-gradient(180deg, #00e5ff, #003d4d)'
                    : 'linear-gradient(180deg, #2d3270, #1e2048)',
                  boxShadow: e.isCurrent ? '0 0 12px rgba(0,229,255,0.4)' : 'none',
                }}
              />
              <span className="text-[9px] font-mono" style={{ color: e.isCurrent ? '#00e5ff' : '#3a4060' }}>
                {e.era}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
