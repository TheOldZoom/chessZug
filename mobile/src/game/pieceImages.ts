import type { Color, PieceSymbol } from 'chess.js';

export const PIECE_IMAGES = {
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
} as const;

export function pieceImageKey(
  color: Color,
  piece: PieceSymbol,
): keyof typeof PIECE_IMAGES {
  return `${color}_${piece}` as keyof typeof PIECE_IMAGES;
}
