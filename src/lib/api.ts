import type { MempoolBlock } from './types.ts';

const BASE = 'https://mempool.space/api';

export async function fetchRecentBlocks(): Promise<MempoolBlock[]> {
  const res = await fetch(`${BASE}/v1/blocks`);
  if (!res.ok) throw new Error(`Blocks API error: ${res.status}`);
  return res.json();
}

export interface MempoolInfo {
  count: number;
  vsize: number;
  total_fee: number;
}

export async function fetchMempoolInfo(): Promise<MempoolInfo> {
  const res = await fetch(`${BASE}/mempool`);
  if (!res.ok) throw new Error(`Mempool API error: ${res.status}`);
  return res.json();
}
