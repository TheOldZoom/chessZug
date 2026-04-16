import type { Theme } from './types';

const rem = 16;
const radiusBaseRem = 0.625;

const layout = {
  fontSans: 'Roboto, sans-serif',
  fontSerif: 'Playfair Display, serif',
  fontMono: 'Fira Code, monospace',
  radiusSm: radiusBaseRem * rem - 4,
  radiusMd: radiusBaseRem * rem - 2,
  radiusLg: radiusBaseRem * rem,
  radiusXl: radiusBaseRem * rem + 4,
  spacing: 4,
} as const;

const light: Theme = {
  ...layout,
  screenBackground: '#ffffff',
  screenText: '#312e81',
  boardSquareA: '#6d28d9',
  boardSquareB: '#c4b5fd',
  boardSelection: '#ffffff',
  surface: '#ffffff',
  surfaceText: '#312e81',
  overlay: '#ffffff',
  overlayText: '#312e81',
  primary: '#8b5cf6',
  primaryText: '#ffffff',
  secondary: '#f3f0ff',
  secondaryText: '#4338ca',
  muted: '#faf8ff',
  mutedText: '#7c3aed',
  accent: '#dbeafe',
  accentText: '#1e40af',
  destructive: '#ef4444',
  destructiveText: '#ffffff',
  border: '#e0e7ff',
  inputBorder: '#e0e7ff',
  focusRing: '#8b5cf6',
  chart1: '#8b5cf6',
  chart2: '#7c3aed',
  chart3: '#6d28d9',
  chart4: '#5b21b6',
  chart5: '#4c1d95',
};

const dark: Theme = {
  ...layout,
  screenBackground: '#0f172a',
  screenText: '#e0e7ff',
  boardSquareA: '#7c3aed',
  boardSquareB: '#c4b5fd',
  boardSelection: '#ffffff',
  surface: '#32306a',
  surfaceText: '#e0e7ff',
  overlay: '#32306a',
  overlayText: '#e0e7ff',
  primary: '#8b5cf6',
  primaryText: '#ffffff',
  secondary: '#32306a',
  secondaryText: '#e0e7ff',
  muted: '#292454',
  mutedText: '#c4b5fd',
  accent: '#4338ca',
  accentText: '#e0e7ff',
  destructive: '#ef4444',
  destructiveText: '#ffffff',
  border: '#2e1065',
  inputBorder: '#2e1065',
  focusRing: '#8b5cf6',
  chart1: '#a78bfa',
  chart2: '#8b5cf6',
  chart3: '#7c3aed',
  chart4: '#6d28d9',
  chart5: '#5b21b6',
};

export { dark, light };

export const themes = { light, dark } as const;

export function resolveTheme(
  scheme: 'light' | 'dark' | null | undefined | 'unspecified',
): Theme {
  return scheme === 'light' ? themes.light : themes.dark;
}
