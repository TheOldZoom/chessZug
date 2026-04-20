import { Chess, Square } from 'chess.js';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Text as PaperText,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { PIECE_IMAGES } from '../game/pieceImages';
import { Board } from '../theme/materialTheme';

export type ChessboardProps = {
  fen: string;
  size: number;
  onMove: (from: Square, to: Square) => boolean;
  bottomPlayerColor?: 'w' | 'b';
  moveOnlyAs?: 'w' | 'b';
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

function isLightSquare(square: Square): boolean {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1], 10);
  return (file + rank) % 2 === 0;
}

export function Chessboard({
  size = 320,
  fen,
  onMove,
  bottomPlayerColor = 'w',
  moveOnlyAs,
}: ChessboardProps) {
  const game = useMemo(() => new Chess(fen), [fen]);
  const [selected, setSelected] = useState<Square | null>(null);
  const cell = size / 8;
  const label = cell * 0.28;

  const displayRanks = bottomPlayerColor === 'b' ? [...ranks].reverse() : ranks;
  const displayFiles = bottomPlayerColor === 'b' ? [...files].reverse() : files;
  const bottomRankIndex = displayRanks.length - 1;

  const onPressSquare = (square: Square) => {
    if (moveOnlyAs !== undefined && game.turn() !== moveOnlyAs) {
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
      {displayRanks.map((rank, r) => (
        <View key={`${rank}-${r}`} style={styles.row}>
          {displayFiles.map((file, col) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);
            const key = piece
              ? (`${piece.color}_${piece.type}` as keyof typeof PIECE_IMAGES)
              : null;
            const isLight = isLightSquare(square);
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
                  {r === bottomRankIndex ? (
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
                      source={PIECE_IMAGES[key]}
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

export type GameBoardProps = ChessboardProps;

export function formatPGNLines(sans: string[]): string[] {
  const lines: string[] = [];
  for (let i = 0; i < sans.length; i += 2) {
    const n = Math.floor(i / 2) + 1;
    const white = sans[i];
    const black = sans[i + 1];
    lines.push(black ? `${n}. ${white} ${black}` : `${n}. ${white}`);
  }
  return lines;
}

export function GameBoard({
  size = 320,
  fen,
  onMove,
  bottomPlayerColor,
  moveOnlyAs,
}: GameBoardProps) {
  return (
    <View>
      <Chessboard
        size={size}
        fen={fen}
        onMove={onMove}
        bottomPlayerColor={bottomPlayerColor}
        moveOnlyAs={moveOnlyAs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {},
  historyScroll: { maxHeight: 160, marginTop: 12 },
  historyScrollContent: { paddingBottom: 8 },
  historyLine: { marginBottom: 4 },
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
