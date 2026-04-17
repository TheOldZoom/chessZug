import { useCallback, useEffect, useRef, useState } from 'react';
import { Square } from 'chess.js';
import {
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  HelperText,
  Text,
  useTheme,
} from 'react-native-paper';
import { Chessboard } from '../components/Chessboard';
import { Screen, SCREEN_EDGE_PADDING } from '../components/Screen';
import { GameController } from '../game/GameController';
import { openStockfishEngine, type Engine } from '../engine/EngineManager';

export function AiTestScreen() {
  const theme = useTheme();
  const [controller, setController] = useState(() => new GameController());
  const [fen, setFen] = useState(() => controller.getFen());
  const [thinking, setThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setError('Stockfish runs on Android only in this build.');
      return;
    }
    let cancelled = false;
    openStockfishEngine()
      .then(engine => {
        if (cancelled) {
          engine.shutdown().catch(() => {});
          return;
        }
        engineRef.current = engine;
        setEngineReady(true);
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
      const e = engineRef.current;
      engineRef.current = null;
      if (e) {
        e.shutdown().catch(() => {});
      }
    };
  }, []);

  const runEngineTurn = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || controller.isGameOver()) {
      return;
    }
    setThinking(true);
    setError(null);
    try {
      await engine.setPosition(controller.getFen());
      const uci = await engine.go(500);
      if (!uci) {
        setError('Engine returned no move');
        return;
      }
      const ok = controller.moveFromUci(uci);
      if (!ok) {
        setError(`Engine move rejected: ${uci}`);
        return;
      }
      setFen(controller.getFen());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setThinking(false);
    }
  }, [controller]);

  const onMove = useCallback(
    (from: Square, to: Square): boolean => {
      if (thinking || !engineReady) {
        return false;
      }
      const ok = controller.move(from, to);
      if (!ok) {
        return false;
      }
      setFen(controller.getFen());
      if (controller.isGameOver()) return true;
      runEngineTurn().catch(() => {});
      return true;
    },
    [controller, thinking, engineReady, runEngineTurn],
  );

  const reset = useCallback(() => {
    if (thinking) return;
    const next = new GameController();
    setController(next);
    setFen(next.getFen());
    setError(null);
  }, [thinking]);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const belowBarReserve = 112;
  const size = Math.min(
    width - insets.left - insets.right - SCREEN_EDGE_PADDING * 2,
    height -
      insets.top -
      insets.bottom -
      SCREEN_EDGE_PADDING * 2 -
      56 -
      belowBarReserve,
  );

  const status =
    error ??
    (!engineReady && Platform.OS === 'android' ? 'Starting engine…' : null);

  return (
    <Screen>
      <Card mode="elevated" style={{ marginBottom: 8 }}>
        <Card.Title title="Stockfish" subtitle="White vs Stockfish" />
        <Card.Content>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <Button mode="contained-tonal" onPress={reset} disabled={thinking}>
              New game
            </Button>
            {thinking ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ActivityIndicator animating color={theme.colors.primary} />
                <Text variant="bodyMedium">Stockfish…</Text>
              </View>
            ) : null}
          </View>
          {status ? (
            <HelperText type={error ? 'error' : 'info'} visible style={{ marginTop: 8 }}>
              {status}
            </HelperText>
          ) : null}
        </Card.Content>
      </Card>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Chessboard size={size} fen={fen} onMove={onMove} humanColor="w" />
      </View>
    </Screen>
  );
}
