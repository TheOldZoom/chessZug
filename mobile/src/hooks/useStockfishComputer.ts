import { useCallback, useEffect, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import { Platform } from 'react-native';
import { GameController } from '../game/GameController';
import { openStockfishEngine, type Engine } from '../game/EngineManager';

type Options = {
  vsComputer: boolean;
  elo: number | undefined;
  controller: GameController;
  syncFromController: () => void;
  humanColor: 'w' | 'b' | null;
  clockExpired: boolean;
};

export function useStockfishComputer({
  vsComputer,
  elo,
  controller,
  syncFromController,
  humanColor,
  clockExpired,
}: Options) {
  const [thinking, setThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const openingEngineScheduled = useRef(false);

  const runEngineTurn = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || controller.isGameOver() || clockExpired) {
      return;
    }
    setThinking(true);
    setEngineError(null);
    try {
      await engine.setPosition(controller.getFen());
      const uci = await engine.go(500);
      if (!uci) {
        setEngineError('Engine returned no move');
        return;
      }
      const ok = controller.moveFromUci(uci);
      if (!ok) {
        setEngineError(`Engine move rejected: ${uci}`);
        return;
      }
      syncFromController();
    } catch (e) {
      setEngineError(e instanceof Error ? e.message : String(e));
    } finally {
      setThinking(false);
    }
  }, [controller, syncFromController, clockExpired]);

  useEffect(() => {
    if (!vsComputer || elo === undefined) {
      return;
    }
    if (Platform.OS !== 'android') {
      setEngineError('Stockfish runs on Android only in this build.');
      return;
    }
    let cancelled = false;
    openStockfishEngine()
      .then(async engine => {
        if (cancelled) {
          await engine.shutdown().catch(() => {});
          return;
        }
        await engine.setElo(elo);
        engineRef.current = engine;
        setEngineReady(true);
        setEngineError(null);
      })
      .catch(e => {
        setEngineError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
      const e = engineRef.current;
      engineRef.current = null;
      setEngineReady(false);
      if (e) {
        e.shutdown().catch(() => {});
      }
    };
  }, [vsComputer, elo]);

  useEffect(() => {
    if (!vsComputer || !engineReady || thinking || clockExpired) {
      return;
    }
    if (humanColor !== 'b') {
      return;
    }
    if (openingEngineScheduled.current) {
      return;
    }
    if (controller.getHistory().length > 0) {
      return;
    }
    if (controller.getTurn() !== 'w') {
      return;
    }
    openingEngineScheduled.current = true;
    runEngineTurn().catch(() => {});
  }, [
    vsComputer,
    engineReady,
    thinking,
    humanColor,
    controller,
    runEngineTurn,
    clockExpired,
  ]);

  const canAcceptHumanMove =
    !clockExpired && (!vsComputer || (engineReady && !thinking));

  const tryHumanMove = useCallback(
    (from: Square, to: Square): boolean => {
      if (clockExpired) {
        return false;
      }
      if (!canAcceptHumanMove) {
        return false;
      }
      const ok = controller.move(from, to);
      if (!ok) {
        return false;
      }
      syncFromController();
      if (vsComputer && !controller.isGameOver()) {
        runEngineTurn().catch(() => {});
      }
      return true;
    },
    [
      canAcceptHumanMove,
      controller,
      syncFromController,
      vsComputer,
      runEngineTurn,
      clockExpired,
    ],
  );

  return {
    thinking,
    engineReady,
    engineError,
    tryHumanMove,
  };
}
