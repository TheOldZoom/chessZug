import { useMemo, useState } from 'react';
import { Square } from 'chess.js';
import { useWindowDimensions, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider, Text, useTheme } from 'react-native-paper';
import { Chessboard } from '../components/Chessboard';
import { Screen, SCREEN_EDGE_PADDING } from '../components/Screen';
import { GameController } from '../game/GameController';

function formatPGNLines(sans: string[]): string[] {
  const lines: string[] = [];
  for (let i = 0; i < sans.length; i += 2) {
    const n = Math.floor(i / 2) + 1;
    const white = sans[i];
    const black = sans[i + 1];
    lines.push(black ? `${n}. ${white} ${black}` : `${n}. ${white}`);
  }
  return lines;
}

export function GameScreen() {
  const theme = useTheme();
  const controller = useMemo(() => new GameController(), []);
  const [fen, setFen] = useState(controller.getFen());
  const [turn, setTurn] = useState(controller.getTurn());
  const [historyLines, setHistoryLines] = useState<string[]>([]);

  const turnText = useMemo(() => (turn === 'w' ? 'White' : 'Black'), [turn]);
  const title = useMemo(() => `${turnText} to move`, [turnText]);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const footerReserve = 156;
  const size = Math.min(
    width - insets.left - insets.right - SCREEN_EDGE_PADDING * 2,
    height -
      insets.top -
      insets.bottom -
      SCREEN_EDGE_PADDING * 2 -
      56 -
      footerReserve,
  );

  const syncFromController = () => {
    setFen(controller.getFen());
    setTurn(controller.getTurn());
    setHistoryLines(formatPGNLines(controller.getHistory()));
  };

  const onMove = (from: Square, to: Square): boolean => {
    const ok = controller.move(from, to);
    if (!ok) {
      return false;
    }
    syncFromController();
    return true;
  };

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Chessboard size={size} onMove={onMove} fen={fen} />
      </View>
      <View
        style={{
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom + 16,
          maxHeight: 140,
        }}
      >
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          {title}
        </Text>
        <Divider style={{ marginBottom: 8 }} />
        <ScrollView>
          {historyLines.map((line, i) => (
            <Text
              key={`${i}-${line}`}
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: 4,
              }}
            >
              {line}
            </Text>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}
