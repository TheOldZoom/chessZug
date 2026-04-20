import { NativeModules, Platform } from 'react-native';

export interface Engine {
  setPosition(fen: string): Promise<void>;
  go(movetime: number): Promise<string>;
  stop(): Promise<void>;
  shutdown(): Promise<void>;
  setElo(elo: number): Promise<void>;
}

type StockfishNative = {
  prepare: () => Promise<void>;
  setPosition: (fen: string) => Promise<void>;
  setElo: (elo: number) => Promise<void>;
  goMovetime: (movetimeMs: number) => Promise<string>;
  goDepth: (depth: number) => Promise<string>;
  stop: () => Promise<void>;
  quit: () => Promise<void>;
};

export async function openStockfishEngine(): Promise<Engine> {
  if (Platform.OS !== 'android') {
    throw new Error('Stockfish native engine is only available on Android');
  }
  const native = NativeModules.Stockfish as StockfishNative | undefined;
  if (!native) {
    throw new Error('Stockfish native module is not linked');
  }
  await native.prepare();
  return {
    setElo: async elo => {
      await native.setElo(elo);
    },
    setPosition: async fen => {
      await native.setPosition(fen);
    },
    go: async movetime => {
      const best = await native.goMovetime(movetime);
      return best;
    },
    stop: async () => {
      await native.stop();
    },
    shutdown: async () => {
      await native.quit();
    },
  };
}
