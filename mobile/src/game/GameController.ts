import { Chess, Square } from 'chess.js';

export class GameController {
  private game: Chess;

  constructor(fen?: string) {
    this.game = fen ? new Chess(fen) : new Chess();
  }

  getFen(): string {
    return this.game.fen();
  }

  move(from: Square, to: Square): boolean {
    try {
      const move = this.game.move({ from, to, promotion: 'q' });
      return Boolean(move);
    } catch (error) {
      return false;
    }
  }
  getTurn(): string {
    return this.game.turn();
  }
}
