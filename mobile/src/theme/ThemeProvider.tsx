import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';
import type { Theme, ThemePreference } from './types';
import { themes } from './themes';

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  cyclePreference: () => void;
  effectiveScheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function effectiveSchemeFrom(
  preference: ThemePreference,
  system: ColorSchemeName,
): 'light' | 'dark' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return system === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  const effectiveScheme = useMemo(
    () => effectiveSchemeFrom(preference, system),
    [preference, system],
  );

  const theme = effectiveScheme === 'light' ? themes.light : themes.dark;

  const cyclePreference = useCallback(() => {
    setPreference(p =>
      p === 'system' ? 'light' : p === 'light' ? 'dark' : 'system',
    );
  }, []);

  const value = useMemo(
    () => ({
      theme,
      preference,
      cyclePreference,
      effectiveScheme,
    }),
    [theme, preference, cyclePreference, effectiveScheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeColors(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeColors must be used within ThemeProvider');
  }
  return ctx.theme;
}

export function useThemeSettings(): Pick<
  ThemeContextValue,
  'preference' | 'cyclePreference' | 'effectiveScheme'
> {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeSettings must be used within ThemeProvider');
  }
  const { preference, cyclePreference, effectiveScheme } = ctx;
  return { preference, cyclePreference, effectiveScheme };
}
