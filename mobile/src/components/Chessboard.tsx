import { Chess, Color, Square } from 'chess.js';
import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { Board } from '../theme/materialTheme';

type Props = {
  fen: string;
  size: number;
  onMove: (from: Square, to: Square) => boolean;
  humanColor?: Color;
};

const pieceImages = {
  w_p: require('../assets/pieces/w_pawn.png'),
  w_n: require('../assets/pieces/w_knight.png'),
  w_b: require('../assets/pieces/w_bishop.png'),
  w_r: require('../assets/pieces/w_rook.png'),
  w_q: require('../assets/pieces/w_queen.png'),
  w_k: require('../assets/pieces/w_king.png'),
  b_p: require('../assets/pieces/b_pawn.png'),
  b_n: require('../assets/pieces/b_knight.png'),
  b_b: require('../assets/pieces/b_bishop.png'),
  b_r: require('../assets/pieces/b_rook.png'),
  b_q: require('../assets/pieces/b_queen.png'),
  b_k: require('../assets/pieces/b_king.png'),
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export function Chessboard({ size = 320, fen, onMove, humanColor }: Props) {
  const game = useMemo(() => new Chess(fen), [fen]);
  const [selected, setSelected] = useState<Square | null>(null);
  const cell = size / 8;
  const label = cell * 0.28;

  const onPressSquare = (square: Square) => {
    if (humanColor !== undefined && game.turn() !== humanColor) {
      setSelected(null);
      return;
    }
    if (!selected) {
      const p = game.get(square);
      if (p && p.color === game.turn()) setSelected(square);
      return;
    }
    if (square === selected) {
      setSelected(null);
      return;
    }
    const ok = onMove(selected, square);
    if (ok) {
      setSelected(null);
      return;
    }
    const next = game.get(square);
    if (next && next.color === game.turn()) setSelected(square);
    else setSelected(null);
  };

  return (
    <View
      style={[
        styles.board,
        {
          borderWidth: 5,
          borderColor: Board.edge,
        },
      ]}
    >
      {ranks.map((rank, r) => (
        <View key={rank} style={styles.row}>
          {files.map((file, col) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);
            const key = piece
              ? (`${piece.color}_${piece.type}` as keyof typeof pieceImages)
              : null;
            const isLight = (r + col) % 2 === 0;
            const bg = isLight ? Board.lightSquare : Board.darkSquare;
            const selectedHere = selected === square;
            const borderColor = selectedHere ? Board.selection : 'transparent';
            const borderWidth = selectedHere ? 3 : 0;
            const labelColor = isLight ? Board.coordOnLight : Board.coordOnDark;
            return (
              <TouchableRipple
                key={square}
                onPress={() => onPressSquare(square)}
                borderless={false}
                rippleColor={Board.ripple}
                style={[
                  styles.cell,
                  {
                    width: cell,
                    height: cell,
                    borderWidth,
                    borderColor,
                    backgroundColor: bg,
                  },
                ]}
              >
                <View style={styles.cellInner}>
                  {col === 0 ? (
                    <Text
                      style={[
                        styles.rankCoord,
                        {
                          fontSize: label,
                          color: labelColor,
                        },
                      ]}
                    >
                      {rank}
                    </Text>
                  ) : null}
                  {r === 7 ? (
                    <Text
                      style={[
                        styles.fileCoord,
                        {
                          fontSize: label,
                          color: labelColor,
                        },
                      ]}
                    >
                      {file}
                    </Text>
                  ) : null}
                  {key ? (
                    <Image
                      source={pieceImages[key]}
                      style={{ width: cell * 0.95, height: cell * 0.95 }}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>
              </TouchableRipple>
            );
          })}
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  board: {},
  row: { flexDirection: 'row' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  cellInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankCoord: { position: 'absolute', top: 2, left: 3, fontWeight: '700' },
  fileCoord: { position: 'absolute', bottom: 2, right: 3, fontWeight: '700' },
});
