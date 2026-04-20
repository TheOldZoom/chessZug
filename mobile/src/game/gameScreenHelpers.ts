import { Platform } from 'react-native';
import { SCREEN_EDGE_PADDING } from '../components/Screen';
import type { GameSettings } from '../types/navigation';

export function formatSecondsToClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const mm = m < 100 ? m.toString().padStart(2, '0') : String(m);
  return `${mm}:${r.toString().padStart(2, '0')}`;
}

export function parseMmSsToTotalSeconds(s: string): number | null {
  const t = s.trim();
  if (t === '') {
    return null;
  }
  const m = /^(\d+):(\d{2})$/.exec(t);
  if (!m) {
    return null;
  }
  const mm = parseInt(m[1], 10);
  const ss = parseInt(m[2], 10);
  if (ss >= 60 || mm > 9999) {
    return null;
  }
  return mm * 60 + ss;
}

export function formatTimeControlLabel(
  minutes: number,
  incrementSeconds: number,
): string {
  const main = formatSecondsToClock(minutes * 60);
  const inc = incrementSeconds.toString().padStart(2, '0');
  return `${main} +${inc}`;
}

type CryptoSubset = { getRandomValues: (a: Uint8Array) => void };

export function pickRandomSide(): 'w' | 'b' {
  const c = (globalThis as typeof globalThis & { crypto?: CryptoSubset })
    .crypto;
  if (c && typeof c.getRandomValues === 'function') {
    const u = new Uint8Array(1);
    c.getRandomValues(u);
    return u[0] < 128 ? 'w' : 'b';
  }
  return Math.random() < 0.5 ? 'w' : 'b';
}

export function formatGameSettingsCaption(
  settings: GameSettings | undefined,
): string | null {
  if (!settings) {
    return null;
  }
  const sideLabel =
    settings.side === 'random'
      ? 'Random'
      : settings.side === 'w'
      ? 'White'
      : 'Black';
  if (settings.computer) {
    return `${sideLabel} · Computer ${settings.computer.elo}`;
  }
  const clock = formatTimeControlLabel(
    settings.minutes,
    settings.incrementSeconds,
  );
  return `${clock} · ${sideLabel}`;
}

export function getInitialHumanColor(
  settings: GameSettings | undefined,
): 'w' | 'b' | null {
  if (!settings?.computer) {
    return null;
  }
  if (settings.side === 'random') {
    return pickRandomSide();
  }
  return settings.side;
}

const BOARD_INNER_PAD = 10;
const MIN_BOARD = 120;
const BELOW_STATUS_RESERVE = 176;

export function computeGameBoardSize(options: {
  windowWidth: number;
  windowHeight: number;
  insetsTop: number;
  insetsBottom: number;
  horizontalPad: number;
}): number {
  const { windowWidth, windowHeight, insetsTop, insetsBottom, horizontalPad } =
    options;
  const fromWidth = windowWidth - horizontalPad - BOARD_INNER_PAD;
  const fromHeight =
    windowHeight -
    insetsTop -
    insetsBottom -
    SCREEN_EDGE_PADDING * 2 -
    BELOW_STATUS_RESERVE;
  return Math.max(
    MIN_BOARD,
    Math.floor(Math.min(fromWidth, fromHeight) - BOARD_INNER_PAD),
  );
}

export function engineStatusHint(options: {
  engineError: string | null;
  vsComputer: boolean;
  engineReady: boolean;
}): string | null {
  const { engineError, vsComputer, engineReady } = options;
  if (engineError) {
    return engineError;
  }
  if (vsComputer && Platform.OS === 'android' && !engineReady) {
    return 'Starting engine…';
  }
  return null;
}
