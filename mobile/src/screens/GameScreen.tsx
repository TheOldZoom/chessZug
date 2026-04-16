import { useMemo, useState } from 'react';
import { Square } from 'chess.js';
import {
  useWindowDimensions,
  View,
  Text,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chessboard } from '../components/Chessboard';
import { GameController } from '../game/GameController';
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

export function GameScreen() {
  const theme = useThemeColors();
  const { preference, cyclePreference } = useThemeSettings();
  const controller = useMemo(() => new GameController(), []);
  const [fen, setFen] = useState(controller.getFen());

  const [turn, setTurn] = useState(controller.getTurn());
  const turnText = useMemo(() => (turn === 'w' ? 'White' : 'Black'), [turn]);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pad = 16;
  const headerSpace = 48;
  const size = Math.min(
    width - insets.left - insets.right - pad * 2,
    height - insets.top - insets.bottom - pad * 2 - headerSpace,
  );

  const onMove = (from: Square, to: Square): boolean => {
    const ok = controller.move(from, to);
    if (!ok) return false;
    setFen(controller.getFen());
    setTurn(controller.getTurn());
    return true;
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
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Chessboard size={size} onMove={onMove} fen={fen} />
      </View>
    </View>
  );
}
