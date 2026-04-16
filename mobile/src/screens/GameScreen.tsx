import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Square } from 'chess.js';
import {
  useWindowDimensions,
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chessboard } from '../components/Chessboard';
import { GameController } from '../game/GameController';
import type { RootStackParamList } from '../navigation/types';
import {
  useThemeColors,
  useThemeSettings,
  type ThemePreference,
} from '../theme';

const preferenceLabel: Record<ThemePreference, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
};

type GameNav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

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
  const navigation = useNavigation<GameNav>();
  const theme = useThemeColors();
  const { preference, cyclePreference } = useThemeSettings();
  const controller = useMemo(() => new GameController(), []);
  const [fen, setFen] = useState(controller.getFen());
  const [turn, setTurn] = useState(controller.getTurn());
  const [historyLines, setHistoryLines] = useState<string[]>([]);

  const turnText = useMemo(() => (turn === 'w' ? 'White' : 'Black'), [turn]);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pad = 16;
  const headerSpace = 48;
  const size = Math.min(
    width - insets.left - insets.right - pad * 2,
    height - insets.top - insets.bottom - pad * 2 - headerSpace,
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

  const onReset = () => {
    controller.reset();
    syncFromController();
  };

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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.screenText,
          }}
        >
          {turnText}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable
            onPress={onReset}
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
                fontSize: 15,
                fontWeight: '600',
                color: theme.secondaryText,
              }}
            >
              Reset
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('AiTest')}
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
                fontSize: 15,
                fontWeight: '600',
                color: theme.secondaryText,
              }}
            >
              AI test
            </Text>
          </Pressable>
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
                fontSize: 15,
                fontWeight: '600',
                color: theme.secondaryText,
              }}
            >
              Theme: {preferenceLabel[preference]}
            </Text>
          </Pressable>
        </View>
      </View>
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
          paddingHorizontal: insets.left + pad,
          paddingRight: insets.right + pad,
          paddingBottom: insets.bottom + 8,
          maxHeight: 140,
        }}
      >
        <ScrollView>
          {historyLines.map((line, i) => (
            <Text
              key={`${i}-${line}`}
              style={{
                fontSize: 14,
                color: theme.screenText,
                marginBottom: 4,
              }}
            >
              {line}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
