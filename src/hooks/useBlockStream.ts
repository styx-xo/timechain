import { useState, useEffect, useRef, useCallback } from 'react';
import type { MempoolBlock, BlockThermo, BlockStreamState } from '../lib/types.ts';
import { computeBlockThermo } from '../lib/thermodynamics.ts';
import { fetchRecentBlocks } from '../lib/api.ts';

const WS_URL = 'wss://mempool.space/api/v1/ws';
const NEW_BLOCK_DURATION = 3000;

export function useBlockStream(): BlockStreamState {
  const [blocks, setBlocks] = useState<MempoolBlock[]>([]);
  const [thermos, setThermos] = useState<BlockThermo[]>([]);
  const [isNewBlock, setIsNewBlock] = useState(false);
  const [timeSinceLastBlock, setTimeSinceLastBlock] = useState(0);
  const [connected, setConnected] = useState(false);
  const [mempoolTxCount, setMempoolTxCount] = useState(0);
  const [mempoolSize, setMempoolSize] = useState(0);
  const lastBlockTime = useRef<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const newBlockTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tickTimer = useRef<ReturnType<typeof setInterval>>(undefined);

  const processBlocks = useCallback((rawBlocks: MempoolBlock[]) => {
    setBlocks(rawBlocks);
    setThermos(rawBlocks.map(computeBlockThermo));
    if (rawBlocks.length > 0) {
      lastBlockTime.current = rawBlocks[0].timestamp;
    }
  }, []);

  const triggerNewBlock = useCallback(() => {
    setIsNewBlock(true);
    clearTimeout(newBlockTimer.current);
    newBlockTimer.current = setTimeout(() => setIsNewBlock(false), NEW_BLOCK_DURATION);
  }, []);

  // Initial REST fetch
  useEffect(() => {
    fetchRecentBlocks()
      .then(processBlocks)
      .catch(console.error);
  }, [processBlocks]);

  // Time since last block ticker
  useEffect(() => {
    tickTimer.current = setInterval(() => {
      if (lastBlockTime.current > 0) {
        setTimeSinceLastBlock(Math.floor(Date.now() / 1000) - lastBlockTime.current);
      }
    }, 1000);
    return () => clearInterval(tickTimer.current);
  }, []);

  // WebSocket connection
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ action: 'want', data: ['blocks', 'mempool-info'] }));
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);

          if (data.block) {
            // New block arrived — re-fetch full block data via REST
            triggerNewBlock();
            fetchRecentBlocks()
              .then(processBlocks)
              .catch(console.error);
          }

          if (data.mempoolInfo) {
            setMempoolTxCount(data.mempoolInfo.count ?? 0);
            setMempoolSize(data.mempoolInfo.vsize ?? 0);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimer = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [processBlocks, triggerNewBlock]);

  return {
    blocks,
    thermos,
    latestBlock: blocks[0] ?? null,
    latestThermo: thermos[0] ?? null,
    isNewBlock,
    timeSinceLastBlock,
    connected,
    mempoolTxCount,
    mempoolSize,
  };
}
