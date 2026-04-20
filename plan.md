# ChessZug — ZugZug your chess games

## 0. What you are actually building

A **local chess training app**:

- Play chess (legal moves only)
- Play vs Stockfish (local)
- Get evaluation feedback
- Save games
- Practice positions (puzzles later)
- Bluetooth local play later (nearby device, before full multiplayer)
- Multiplayer later (separate system entirely)

---

# 1. System reality (do not overthink)

You only have 3 real systems:

```
1. UI (React Native)
2. Chess State (JS)
3. Stockfish process (native)
```

Everything else is just organization.

---

# 2. Core architecture (minimal correct version)

```
UI
 ↓
Game State (single source of truth)
 ↓
Engine Bridge (Stockfish only)
```

That’s it.

No extra layers needed.

---

# 3. Responsibilities (strict and simple)

## UI (React Native)

- Render board
- Send user moves
- Show engine move + evaluation
- Show game state

NO rules logic

---

## Game State (TypeScript)

This is your “brain”.

Responsible for:

- legal move validation
- FEN tracking
- move history
- game over detection

Use:

- `chess.js`

So your “state layer” is basically a wrapper around it.

---

## Engine Bridge (Stockfish adapter)

Only does:

- send FEN
- request move
- return best move
- return evaluation (optional later)

Nothing else.

---

# 4. Data model (this is your real foundation)

```ts id="c1"
type Game = {
  fen: string;
  moves: string[];
};
```

That is your entire app state.

Everything derives from this.

---

# 5. Game flow (this is the whole app)

## User move

```
UI → validate move → update FEN → update UI
```

## Engine move

```
UI → Game State → Engine → move → apply → UI update
```

No controllers, no orchestration classes needed.

---

# 6. Stockfish integration (simple version)

Do NOT over-engineer engine lifecycle.

You only need:

## Engine API

```ts id="c2"
interface Engine {
  setPosition(fen: string): void;
  go(movetime: number): Promise<string>;
  stop(): void;
}
```

---

## Flow

```
setPosition(fen)
go(500ms)
→ "bestmove e2e4"
```

Done.

---

# 7. Difficulty system (simple, correct)

Do NOT build AI frameworks.

Just:

| Mode   | movetime |
| ------ | -------- |
| Easy   | 200ms    |
| Medium | 500ms    |
| Hard   | 1000ms   |

That’s it.

---

# 8. Features roadmap (corrected order)

## Phase 1 — Core App (MVP)

- Chess board UI
- legal moves (chess.js)
- move history
- reset game

---

## Phase 2 — Stockfish

- local engine integration
- play vs AI
- move timing system

---

## Phase 3 — Feedback system

- evaluation bar
- blunder detection (simple eval diff)

---

## Phase 4 — Storage

- save/load games (FEN + moves)

---

## Phase 5 — Training tools

- Gambits learning
- puzzles (fixed positions)
- best move hints

---

## Phase 6 — UX polish

- animations
- highlights
- smooth transitions

---

## Phase 7 — Bluetooth (similar to how Dual works)

- discover / pair nearby devices
- send moves over a Bluetooth channel (same game-state rules as local play)
- keep separate from engine and from online multiplayer

---

## Phase 8 — Multiplayer (completely separate system)

- do NOT mix with engine logic
- treat as different product layer
