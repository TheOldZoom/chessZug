import {
  configureFonts,
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper';

export const Board = {
  lightSquare: '#f0d9b5',
  darkSquare: '#b58863',
  coordOnLight: '#b58863',
  coordOnDark: '#f0d9b5',
  selection: '#15781b',
  edge: '#5a3e1b',
  ripple: 'rgba(21, 120, 27, 0.25)',
} as const;

export function createAppMaterialTheme() {
  const fonts = configureFonts({ config: MD3DarkTheme.fonts });
  return {
    ...MD3DarkTheme,
    fonts,
    roundness: 12,
    colors: {
      ...MD3DarkTheme.colors,
    },
  };
}

export function createAppMaterialLightTheme() {
  const fonts = configureFonts({ config: MD3LightTheme.fonts });
  return {
    ...MD3LightTheme,
    fonts,
    roundness: 12,
    colors: {
      ...MD3LightTheme.colors,
    },
  };
}
