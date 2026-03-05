export type ViewId = 'pulse' | 'tick' | 'thermo' | 'scale' | 'utxo';

export interface MempoolBlock {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
  extras: {
    reward: number;
    coinbaseRaw: string;
    totalFees: number;
    medianFee: number;
    feeRange: number[];
    avgFee: number;
    avgFeeRate: number;
    pool: { id: number; name: string; slug: string };
  };
}

export interface BlockThermo {
  height: number;
  timestamp: number;
  subsidy: number;
  totalFees: number;
  coinbase: number;
  supply: number;
  temperature: number;
  probability: number;
  shannonEntropy: number;
  blockEnergy: number;
  nonceTemperature: number;
  nonceEnergy: number;
  satoshiConstant: number;
  feeRatio: number;
  regime: 'subsidy' | 'transitional' | 'terminal';
  txCount: number;
  size: number;
  difficulty: number;
  pool: string;
}

export interface BlockStreamState {
  blocks: MempoolBlock[];
  thermos: BlockThermo[];
  latestBlock: MempoolBlock | null;
  latestThermo: BlockThermo | null;
  isNewBlock: boolean;
  timeSinceLastBlock: number;
  connected: boolean;
  mempoolTxCount: number;
  mempoolSize: number;
}
