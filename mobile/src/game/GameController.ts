import { Chess, Square } from 'chess.js';

export class GameController {
  private game: Chess;

  constructor(fen?: string) {
    this.game = fen ? new Chess(fen) : new Chess();
  }

  getFen(): string {
    return this.game.fen();
  }

  getHistory(): string[] {
    return this.game.history();
  }

  getTurn(): string {
    return this.game.turn();
  }

  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  reset(): void {
    this.game = new Chess();
  }

  move(
    from: Square,
    to: Square,
    promotion = 'q' as 'q' | 'r' | 'b' | 'n',
  ): boolean {
    try {
      const move = this.game.move({ from, to, promotion });
      if (move) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  moveFromUci(uci: string): boolean {
    const clean = uci.trim().toLowerCase();
    if (clean.length < 4) {
      return false;
    }
    const from = clean.slice(0, 2) as Square;
    const to = clean.slice(2, 4) as Square;
    try {
      const move =
        clean.length >= 5
          ? this.game.move({
              from,
              to,
              promotion: clean[4] as 'q' | 'r' | 'b' | 'n',
            })
          : this.game.move({ from, to });
      if (move) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
