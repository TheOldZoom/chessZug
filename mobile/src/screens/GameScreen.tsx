import { useMemo, useState } from 'react';
import { Square } from 'chess.js';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chessboard } from '../components/Chessboard';
import { GameController } from '../game/GameController';

export function GameScreen() {
  const controller = useMemo(() => new GameController(), []);
  const [fen, setFen] = useState(controller.getFen());

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pad = 16;
  const size = Math.min(
    width - insets.left - insets.right - pad * 2,
    height - insets.top - insets.bottom - pad * 2,
  );

  const onMove = (from: Square, to: Square): boolean => {
    const ok = controller.move(from, to);
    if (!ok) return false;
    setFen(controller.getFen());
    return true;
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Chessboard size={size} onMove={onMove} fen={fen} />
    </View>
  );
}
