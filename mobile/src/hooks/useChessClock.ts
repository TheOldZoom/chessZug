import type { Move } from 'chess.js';
import { useEffect, useRef, useState } from 'react';

type Color = 'w' | 'b';

type Options = {
  enabled: boolean;
  initialMinutes: number;
  incrementSeconds: number;
  turn: Color;
  gameOver: boolean;
  verboseMoves: Move[];
};

export function useChessClock({
  enabled,
  initialMinutes,
  incrementSeconds,
  turn,
  gameOver,
  verboseMoves,
}: Options) {
  const initialSec = Math.max(1, initialMinutes * 60);
  const [whiteSec, setWhiteSec] = useState(initialSec);
  const [blackSec, setBlackSec] = useState(initialSec);
  const [timedOut, setTimedOut] = useState<Color | null>(null);
  const lastMoveIndexRef = useRef(-1);

  const clockStopped = gameOver || timedOut !== null;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setWhiteSec(initialSec);
    setBlackSec(initialSec);
    setTimedOut(null);
    lastMoveIndexRef.current = -1;
  }, [enabled, initialSec]);

  useEffect(() => {
    if (!enabled || !verboseMoves.length) {
      return;
    }
    const lastIdx = verboseMoves.length - 1;
    if (lastIdx <= lastMoveIndexRef.current) {
      return;
    }
    lastMoveIndexRef.current = lastIdx;
    const mover = verboseMoves[lastIdx].color;
    if (mover === 'w') {
      setWhiteSec(s => s + incrementSeconds);
    } else {
      setBlackSec(s => s + incrementSeconds);
    }
  }, [enabled, verboseMoves, incrementSeconds]);

  const started = verboseMoves.length > 0;

  useEffect(() => {
    if (!enabled || clockStopped || !started) {
      return;
    }
    const id = setInterval(() => {
      if (turn === 'w') {
        setWhiteSec(s => {
          const n = Math.max(0, s - 1);
          if (n === 0) {
            setTimedOut('w');
          }
          return n;
        });
      } else {
        setBlackSec(s => {
          const n = Math.max(0, s - 1);
          if (n === 0) {
            setTimedOut('b');
          }
          return n;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, clockStopped, started, turn]);

  return {
    whiteSec,
    blackSec,
    timedOut,
    clockExpired: timedOut !== null,
  };
}
