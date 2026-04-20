import type { Move, PieceSymbol } from 'chess.js';
import { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PIECE_IMAGES, pieceImageKey } from '../game/pieceImages';

type Pair = { num: number; white: Move; black?: Move };

function groupPairs(moves: Move[]): Pair[] {
  const pairs: Pair[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const white = moves[i];
    const black = moves[i + 1];
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white,
      black,
    });
  }
  return pairs;
}

function iconPiece(move: Move): PieceSymbol {
  return move.promotion ?? move.piece;
}

function HalfMove({ move, iconSize }: { move: Move; iconSize: number }) {
  const key = pieceImageKey(move.color, iconPiece(move));
  return (
    <View style={styles.halfMove}>
      <Image
        source={PIECE_IMAGES[key]}
        style={{ width: iconSize, height: iconSize }}
        resizeMode="contain"
      />
      <Text variant="bodyMedium" style={styles.san}>
        {move.san}
      </Text>
    </View>
  );
}

type Props = {
  moves: Move[];
};

export function MoveHistoryStrip({ moves }: Props) {
  const theme = useTheme();
  const pairs = useMemo(() => groupPairs(moves), [moves]);
  const iconSize = 17;

  if (moves.length === 0) {
    return (
      <View style={styles.empty}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          —
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {pairs.map(({ num, white, black }, index) => (
        <View
          key={num}
          style={[
            styles.pair,
            index < pairs.length - 1 ? styles.pairSpacer : null,
            {
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outlineVariant,
            },
          ]}
        >
          <Text
            variant="labelLarge"
            style={[styles.moveNum, { color: theme.colors.onSurfaceVariant }]}
          >
            {num}.
          </Text>
          <HalfMove move={white} iconSize={iconSize} />
          {black ? <HalfMove move={black} iconSize={iconSize} /> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  pairSpacer: {
    marginRight: 8,
  },
  pair: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 6,
    gap: 8,
  },
  moveNum: {
    minWidth: 22,
    fontVariant: ['tabular-nums'],
  },
  halfMove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  san: {
    fontVariant: ['tabular-nums'],
  },
  empty: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
