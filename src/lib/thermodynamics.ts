import {
  E_P,
  C_TERMINAL,
  HALVING_INTERVAL,
  INITIAL_SUBSIDY,
  TOTAL_ERAS,
} from './constants.ts';
import type { MempoolBlock, BlockThermo } from './types.ts';

/** Block subsidy in satoshis at height h */
export function subsidy(h: number): number {
  const era = Math.floor(h / HALVING_INTERVAL);
  if (era >= TOTAL_ERAS) return 0;
  return Math.floor(INITIAL_SUBSIDY / 2 ** era);
}

/** Circulating supply in satoshis at height h (analytic, no API) */
export function circulatingSupply(h: number): number {
  let total = 0;
  for (let era = 0; era < TOTAL_ERAS; era++) {
    const eraStart = era * HALVING_INTERVAL;
    const eraEnd = (era + 1) * HALVING_INTERVAL;
    if (h < eraStart) break;
    const blocksInEra = Math.min(h + 1, eraEnd) - eraStart;
    const eraSubsidy = Math.floor(INITIAL_SUBSIDY / 2 ** era);
    total += blocksInEra * eraSubsidy;
  }
  return total;
}

/** Block temperature T(h) = coinbase / C(h), range (0, 1] */
export function temperature(coinbase: number, supply: number): number {
  if (supply <= 0) return 1;
  return coinbase / supply;
}

/** Probability p(h) = coinbase / C(h) — fraction of domain written */
export function probability(coinbase: number, supply: number): number {
  return temperature(coinbase, supply);
}

/** Shannon entropy H(h) = -E_P * p * ln(p), in Joules */
export function shannonEntropy(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -E_P * p * Math.log(p);
}

/** Block energy DeltaU(h) = T * H */
export function blockEnergy(T: number, H: number): number {
  return T * H;
}

/** Nonce temperature T_nonce(h) = T * [-p*ln(p)] / ln(D * 2^32) */
export function nonceTemperature(
  T: number,
  p: number,
  difficulty: number,
): number {
  const denom = Math.log(difficulty * 2 ** 32);
  if (denom <= 0) return 0;
  const negPLogP = p > 0 && p < 1 ? -p * Math.log(p) : 0;
  return (T * negPLogP) / denom;
}

/** Nonce energy DeltaU_nonce(h) = T_nonce * E_P * ln(D * 2^32) */
export function nonceEnergy(T_nonce: number, difficulty: number): number {
  return T_nonce * E_P * Math.log(difficulty * 2 ** 32);
}

/** Satoshi's Constant SC(h) = E_P / C(h), converges to ~9.315e-7 J/sat */
export function satoshiConstant(supply: number): number {
  if (supply <= 0) return E_P / C_TERMINAL;
  return E_P / supply;
}

/** Fee ratio = totalFees / coinbase */
export function feeRatio(totalFees: number, coinbase: number): number {
  if (coinbase <= 0) return 0;
  return totalFees / coinbase;
}

/** Regime classification based on fee ratio */
export function regime(
  fr: number,
): 'subsidy' | 'transitional' | 'terminal' {
  if (fr < 0.1) return 'subsidy';
  if (fr < 0.9) return 'transitional';
  return 'terminal';
}

/** UTXO density rho = sats / supply */
export function utxoDensity(sats: number, supply: number): number {
  if (supply <= 0) return 0;
  return sats / supply;
}

/** Compute full thermodynamic profile for a mempool block */
export function computeBlockThermo(block: MempoolBlock): BlockThermo {
  const h = block.height;
  const sub = subsidy(h);
  const fees = block.extras.totalFees;
  const coinbase = sub + fees;
  const supply = circulatingSupply(h);

  const T = temperature(coinbase, supply);
  const p = probability(coinbase, supply);
  const H = shannonEntropy(p);
  const dU = blockEnergy(T, H);
  const T_nonce = nonceTemperature(T, p, block.difficulty);
  const dU_nonce = nonceEnergy(T_nonce, block.difficulty);
  const SC = satoshiConstant(supply);
  const fr = feeRatio(fees, coinbase);
  const r = regime(fr);

  return {
    height: h,
    timestamp: block.timestamp,
    subsidy: sub,
    totalFees: fees,
    coinbase,
    supply,
    temperature: T,
    probability: p,
    shannonEntropy: H,
    blockEnergy: dU,
    nonceTemperature: T_nonce,
    nonceEnergy: dU_nonce,
    satoshiConstant: SC,
    feeRatio: fr,
    regime: r,
    txCount: block.tx_count,
    size: block.size,
    difficulty: block.difficulty,
    pool: block.extras.pool?.name ?? 'Unknown',
  };
}
