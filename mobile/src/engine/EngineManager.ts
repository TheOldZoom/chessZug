import { NativeModules, Platform } from 'react-native';

export interface Engine {
  setPosition(fen: string): Promise<void>;
  go(movetime: number): Promise<string>;
  stop(): Promise<void>;
  shutdown(): Promise<void>;
}

type StockfishNative = {
  prepare: () => Promise<void>;
  setPosition: (fen: string) => Promise<void>;
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
    setPosition: fen => native.setPosition(fen),
    go: movetime => native.goMovetime(movetime),
    stop: () => native.stop(),
    shutdown: () => native.quit(),
  };
}
