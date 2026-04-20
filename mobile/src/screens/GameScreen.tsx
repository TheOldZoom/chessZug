import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Move } from 'chess.js';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Chessboard } from '../components/Chessboard';
import { MoveHistoryStrip } from '../components/MoveHistoryStrip';
import { Screen, SCREEN_EDGE_PADDING } from '../components/Screen';
import {
  computeGameBoardSize,
  engineStatusHint,
  formatGameSettingsCaption,
  formatSecondsToClock,
  getInitialHumanColor,
} from '../game/gameScreenHelpers';
import { GameController } from '../game/GameController';
import { useChessClock } from '../hooks/useChessClock';
import { useStockfishComputer } from '../hooks/useStockfishComputer';
import type { RootStackParamList } from '../types/navigation';

export function GameScreen() {
  const theme = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const settings = route.params?.settings;
  const vsComputer = Boolean(settings?.computer);
  const clockEnabled = Boolean(settings) && !vsComputer;

  const [humanColor, setHumanColor] = useState<'w' | 'b' | null>(() =>
    getInitialHumanColor(settings),
  );

  useEffect(() => {
    setHumanColor(getInitialHumanColor(settings));
  }, [settings]);

  const bottomPlayerColor = useMemo((): 'w' | 'b' => {
    if (!settings) {
      return 'w';
    }
    if (vsComputer) {
      return humanColor === 'b' ? 'b' : 'w';
    }
    if (settings.side === 'b') {
      return 'b';
    }
    return 'w';
  }, [settings, vsComputer, humanColor]);

  const moveOnlyAs =
    vsComputer && humanColor != null ? humanColor : undefined;

  const settingsCaption = useMemo(
    () => formatGameSettingsCaption(settings),
    [settings],
  );

  const controller = useMemo(() => new GameController(), []);
  const [fen, setFen] = useState(controller.getFen());
  const [turn, setTurn] = useState(controller.getTurn());
  const [verboseMoves, setVerboseMoves] = useState<Move[]>(() =>
    controller.getVerboseHistory(),
  );

  const syncFromController = useCallback(() => {
    setFen(controller.getFen());
    setTurn(controller.getTurn());
    setVerboseMoves(controller.getVerboseHistory());
  }, [controller]);

  const chessGameOver = controller.isGameOver();

  const { whiteSec, blackSec, timedOut, clockExpired } = useChessClock({
    enabled: clockEnabled,
    initialMinutes: settings?.minutes ?? 5,
    incrementSeconds: settings?.incrementSeconds ?? 0,
    turn: turn as 'w' | 'b',
    gameOver: chessGameOver,
    verboseMoves,
  });

  const { thinking, engineReady, engineError, tryHumanMove } =
    useStockfishComputer({
      vsComputer,
      elo: settings?.computer?.elo,
      controller,
      syncFromController,
      humanColor,
      clockExpired,
    });

  const turnLabel = turn === 'w' ? 'White' : 'Black';

  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const horizontalPad = insets.left + insets.right + SCREEN_EDGE_PADDING * 2;

  const boardSize = useMemo(
    () =>
      computeGameBoardSize({
        windowWidth: winW,
        windowHeight: winH,
        insetsTop: insets.top,
        insetsBottom: insets.bottom,
        horizontalPad,
      }),
    [winW, winH, insets.top, insets.bottom, horizontalPad],
  );

  const engineHint = engineStatusHint({
    engineError,
    vsComputer,
    engineReady,
  });

  const timeoutHint =
    timedOut != null
      ? `${timedOut === 'w' ? 'White' : 'Black'} ran out of time`
      : null;

  const statusHint = timeoutHint ?? engineHint;

  return (
    <Screen style={styles.screen}>
      <Surface
        style={[
          styles.statusBar,
          {
            backgroundColor: theme.colors.surfaceVariant,
          },
        ]}
        elevation={0}
      >
        {clockEnabled ? (
          <View style={styles.clockRow}>
            <View
              style={[
                styles.clockPill,
                {
                  backgroundColor:
                    turn === 'w'
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                White
              </Text>
              <Text variant="titleMedium" style={styles.clockDigits}>
                {formatSecondsToClock(whiteSec)}
              </Text>
            </View>
            <View
              style={[
                styles.clockPill,
                {
                  backgroundColor:
                    turn === 'b'
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Black
              </Text>
              <Text variant="titleMedium" style={styles.clockDigits}>
                {formatSecondsToClock(blackSec)}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.statusRow}>
          <View style={styles.statusMeta}>
            <Text
              variant="labelSmall"
              style={[
                styles.statusLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {vsComputer ? 'Side' : 'Time · side'}
            </Text>
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onSurface }}
              numberOfLines={2}
            >
              {settingsCaption ?? '—'}
            </Text>
            {statusHint ? (
              <Text
                variant="bodySmall"
                style={[
                  styles.statusHint,
                  {
                    color:
                      timeoutHint || engineError
                        ? theme.colors.error
                        : theme.colors.primary,
                  },
                ]}
              >
                {statusHint}
              </Text>
            ) : null}
          </View>
          <View style={styles.turnCol}>
            {thinking ? (
              <ActivityIndicator
                animating
                color={theme.colors.primary}
                style={styles.thinkingSpinner}
              />
            ) : null}
            <Chip
              mode="flat"
              compact
              elevated={false}
              style={[
                styles.turnChip,
                {
                  backgroundColor: theme.colors.secondaryContainer,
                },
              ]}
              textStyle={{ color: theme.colors.onSecondaryContainer }}
            >
              {turnLabel} to move
            </Chip>
          </View>
        </View>
      </Surface>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.boardBlock}>
          <Chessboard
            size={boardSize}
            fen={fen}
            onMove={tryHumanMove}
            bottomPlayerColor={bottomPlayerColor}
            moveOnlyAs={moveOnlyAs}
          />
        </View>
        <View style={styles.historyBlock}>
          <Divider />
          <MoveHistoryStrip moves={verboseMoves} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  statusBar: {
    flexShrink: 0,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  clockPill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  clockDigits: {
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusMeta: {
    flex: 1,
    minWidth: 0,
  },
  statusLabel: {
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusHint: {
    marginTop: 4,
  },
  thinkingSpinner: {
    marginBottom: 4,
  },
  turnCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
    maxWidth: '42%',
  },
  turnChip: {
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    alignItems: 'center',
  },
  boardBlock: {
    alignItems: 'center',
    paddingTop: 4,
  },
  historyBlock: {
    width: '100%',
    alignSelf: 'stretch',
    marginTop: 4,
    maxHeight: 120,
  },
});
