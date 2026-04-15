# ChessZug

# 0. System Architecture (read first)

You are building three layers:

```
UI (React Native)
    ↓
Game Logic (TypeScript)
    ↓
Engine Layer (Kotlin + Stockfish)
```

### Responsibilities

| Layer  | Responsibility                  |
| ------ | ------------------------------- |
| UI     | Rendering, user input           |
| Logic  | Rules, validation, flow control |
| Engine | Move calculation and evaluation |

Key rule:

- **Only the logic layer knows about the game**
- UI and engine are both “clients” of the logic layer

---

# Phase 1 — Foundation (UI + Rules)

## Goal

Playable chess without AI

## What to build

- Board UI
- Drag/drop or tap moves
- Integrate `chess.js`

## Requirements

- Legal move validation
- Turn handling
- Reset / undo

---

## Data model (critical)

Always store:

```ts
{
  fen: string,
  moves: string[]
}
```

Why:

- FEN = current state
- Moves = history

This enables:

- Save/load
- Replay
- Future multiplayer sync

---

## Output

- Fully playable offline chess
- Game can be saved and resumed

---

# Phase 2 — Architecture Layer

## Goal

Decouple game from opponent

## Core interface

```ts
interface Opponent {
  getMove(fen: string): Promise<string>;
}
```

---

## GameController

Central coordinator:

Responsibilities:

- Apply user moves
- Request opponent move
- Update state
- Emit events to UI

---

## Important rule

Do NOT call engine directly from UI.

Correct flow:

```
UI → GameController → Opponent → Engine
```

---

## Output

- Clean separation
- Future multiplayer ready

---

# Phase 3 — Engine Integration (Native Layer)

## Goal

Run Stockfish locally

---

## Step 1 — Bundle binary

Place in:

```
android/app/src/main/assets/stockfish
```

At runtime:

- Copy to internal storage
- Set executable permissions

---

## Step 2 — EngineManager (critical component)

This manages the engine lifecycle.

### Responsibilities

1. Persistent process
   - Start once
   - Reuse for all moves

2. Communication
   - Send UCI commands
   - Parse output

3. Stability
   - Handle crashes
   - Restart if needed

4. Threading
   - Run off UI thread

---

## Step 3 — Engine initialization

On startup:

```
uci
isready
ucinewgame
go depth 1   (warm-up)
```

Why:

- Reduces first-move latency

---

## Step 4 — UCI communication

Send:

```
position fen <FEN>
go movetime 500
```

Receive:

```
bestmove e2e4
```

---

## Step 5 — Move parsing

You must handle:

- Promotions: `e7e8q`
- Castling: `e1g1`
- En passant

Convert to `chess.js` format before applying.

---

## Output

- Engine returns valid moves reliably

---

# Phase 4 — Engine Control & Safety

## Goal

Make engine interaction stable

---

## 1. Search control

Before any new request:

```
stop
```

Why:

- Prevent outdated results corrupting state

---

## 2. Queue system

- Only one active search
- Ignore late responses

---

## 3. Timeout handling

If no response in ~3 seconds:

- Kill process
- Restart engine

---

## 4. Error recovery

- Detect crash
- Reinitialize automatically

---

## Output

- Stable engine behavior under all conditions

---

# Phase 5 — AI Gameplay

## Goal

Play vs AI

## Flow

```
User move
→ validate (chess.js)
→ update FEN
→ request engine move
→ apply result
```

---

## Difficulty system

Use time-based search:

| Level  | movetime |
| ------ | -------- |
| Easy   | 200 ms   |
| Medium | 500 ms   |
| Hard   | 1000 ms  |

Why:

- Consistent across devices

---

## Output

- Responsive AI opponent

---

# Phase 6 — Practice Features

## 1. Puzzle mode

- Load FEN
- Compare user move vs engine best move

---

## 2. Zug mode (core feature)

Logic:

- Get top 2 engine moves
- Compare evaluation

If large gap:

- Only one correct move

---

## Output

- Training-focused gameplay

---

# Phase 7 — Evaluation System

## Parse engine output

Example:

```
score cp 34
```

---

## Features

1. Evaluation bar
2. Blunder detection:
   - Large eval drop

3. Best move hint

---

## Smoothing (important)

- Animate eval changes
- Clamp extreme values

---

## Output

- Clear, usable feedback

---

# Phase 8 — Persistence & Replay

## Store

- FEN
- Move list (PGN-compatible)

---

## Features

- Save game
- Load game
- Replay moves

---

## Output

- State durability

---

# Phase 9 — UX & Performance

## UI improvements

- Move animations
- Highlight legal moves
- Highlight last move
- Loading indicator during engine thinking

---

## Battery control

- Limit movetime
- Pause engine when app backgrounded

---

## Output

- Smooth experience

---

# Phase 10 — Settings System

## Add configurable options

- Difficulty
- Engine strength
- Sound toggle

---

## Output

- User control

---

# Phase 11 — Analytics (local)

## Track

- Blunders
- Accuracy percentage

Store locally.

---

## Output

- Progress tracking foundation

---

# Phase 12 — GPL Compliance

Because you bundle Stockfish:

## You must include:

- GPLv3 license text
- Stockfish attribution
- Link to Stockfish source
- Access to your app’s source code

---

## Add in-app screen:

- “Open Source Licenses”

---

# Phase 13 — Testing

## Required tests

- Move parsing (especially promotions)
- Engine response parsing
- FEN correctness
- Endgame cases:
  - Checkmate
  - Stalemate

---

## Output

- Reliability

---

# Final MVP Criteria

You are done when:

- AI works offline reliably
- Engine never blocks UI
- Puzzle + Zug mode work
- Games can be saved/loaded
- GPL compliance is implemented
