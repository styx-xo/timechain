import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useBlockStream } from '../hooks/useBlockStream.ts';
import type { BlockStreamState } from '../lib/types.ts';

const defaultState: BlockStreamState = {
  blocks: [],
  thermos: [],
  latestBlock: null,
  latestThermo: null,
  isNewBlock: false,
  timeSinceLastBlock: 0,
  connected: false,
  mempoolTxCount: 0,
  mempoolSize: 0,
};

const BlockStreamContext = createContext<BlockStreamState>(defaultState);

export function BlockStreamProvider({ children }: { children: ReactNode }) {
  const state = useBlockStream();
  return (
    <BlockStreamContext.Provider value={state}>
      {children}
    </BlockStreamContext.Provider>
  );
}

export function useBlockData(): BlockStreamState {
  return useContext(BlockStreamContext);
}
