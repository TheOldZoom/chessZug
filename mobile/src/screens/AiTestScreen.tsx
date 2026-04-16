import { useCallback, useEffect, useRef, useState } from 'react';
import { Square } from 'chess.js';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chessboard } from '../components/Chessboard';
import { GameController } from '../game/GameController';
import { openStockfishEngine, type Engine } from '../engine/EngineManager';
import {
  useThemeColors,
  useThemeSettings,
} from '../theme/ThemeProvider';
import type { ThemePreference } from '../theme/theme';

const preferenceLabel: Record<ThemePreference, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
};

type Props = {
  onBack: () => void;
};

export function AiTestScreen({ onBack }: Props) {
  const theme = useThemeColors();
  const { preference, cyclePreference } = useThemeSettings();
  const [controller, setController] = useState(() => new GameController());
  const [fen, setFen] = useState(() => controller.getFen());
  const [thinking, setThinking] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

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
  const pad = 16;
  const headerSpace = 120;
  const size = Math.min(
    width - insets.left - insets.right - pad * 2,
    height - insets.top - insets.bottom - pad * 2 - headerSpace,
  );

  const status =
    error ??
    (!engineReady && Platform.OS === 'android' ? 'Starting engine…' : null);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.screenBackground,
      }}
    >
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingLeft: insets.left + pad,
          paddingRight: insets.right + pad,
          gap: 8,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flexShrink: 1,
              flex: 1,
            }}
          >
            <Pressable
              onPress={onBack}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: theme.radiusMd,
                backgroundColor: theme.secondary,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.secondaryText,
                }}
              >
                Back
              </Text>
            </Pressable>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.screenText,
                flexShrink: 1,
              }}
            >
              White vs Stockfish
            </Text>
          </View>
          <Pressable
            onPress={cyclePreference}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: theme.radiusMd,
              backgroundColor: theme.secondary,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.secondaryText,
              }}
            >
              Theme: {preferenceLabel[preference]}
            </Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable
            onPress={reset}
            disabled={thinking}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: theme.radiusMd,
              backgroundColor: theme.secondary,
              borderWidth: 1,
              borderColor: theme.border,
              opacity: thinking ? 0.5 : 1,
            }}
          >
            <Text style={{ fontWeight: '600', color: theme.secondaryText }}>
              New game
            </Text>
          </Pressable>
          {thinking ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <ActivityIndicator color={theme.screenText} />
              <Text style={{ color: theme.screenText }}>Stockfish…</Text>
            </View>
          ) : null}
        </View>
        {status ? (
          <Text
            style={{
              color: error ? theme.destructive : theme.screenText,
              fontSize: 14,
            }}
          >
            {status}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Chessboard size={size} fen={fen} onMove={onMove} humanColor="w" />
      </View>
    </View>
  );
}
