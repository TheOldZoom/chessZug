import { configureFonts, MD3DarkTheme } from 'react-native-paper';

export const chessBoardPalette = {
  squareA: '#7c3aed',
  squareB: '#c4b5fd',
  selection: '#ffffff',
} as const;

export function createAppMaterialTheme() {
  const fonts = configureFonts({ config: MD3DarkTheme.fonts });
  return {
    ...MD3DarkTheme,
    fonts,
    roundness: 12,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#D0BCFF',
      onPrimary: '#381E72',
      primaryContainer: '#4F378B',
      onPrimaryContainer: '#EADDFF',
      secondary: '#CCC2DC',
      onSecondary: '#332D41',
      secondaryContainer: '#4A4458',
      onSecondaryContainer: '#E8DEF8',
      tertiary: '#EFB8C8',
      onTertiary: '#492532',
      tertiaryContainer: '#633B48',
      onTertiaryContainer: '#FFD8E4',
      error: '#F2B8B5',
      onError: '#601410',
      errorContainer: '#8C1D18',
      onErrorContainer: '#F9DEDC',
      background: '#141218',
      onBackground: '#E6E1E5',
      surface: '#141218',
      onSurface: '#E6E1E5',
      surfaceVariant: '#49454F',
      onSurfaceVariant: '#CAC4D0',
      outline: '#948F99',
      outlineVariant: '#49454F',
      inverseSurface: '#E6E1E5',
      inverseOnSurface: '#313033',
      inversePrimary: '#6750A4',
    },
  };
}
