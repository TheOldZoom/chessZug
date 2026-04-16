import { useMemo, useState } from 'react';
import { Chess, Square } from 'chess.js';
import { useWindowDimensions, View } from 'react-native';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Chessboard } from '../components/Chessboard';

export function GameScreen() {
  const game = useMemo(() => new Chess(), []);

  const [fen, setFen] = useState(game.fen());

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pad = 16;
  const size = Math.min(
    width - insets.left - insets.right - pad * 2,
    height - insets.top - insets.bottom - pad * 2,
  );

  const onMove = (from: Square, to: Square): boolean => {
    const move = game.move({ from, to, promotion: 'q' });
    if (!move) return false;
    setFen(game.fen());
    return true;
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Chessboard size={size} onMove={onMove} fen={fen} />
    </View>
  );
}
