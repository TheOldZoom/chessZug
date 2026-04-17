import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PaperProvider } from 'react-native-paper';
import {
  createAppMaterialLightTheme,
  createAppMaterialTheme,
} from './materialTheme';

export type ThemeMode = 'light' | 'dark';

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const paperTheme = useMemo(
    () =>
      mode === 'dark'
        ? createAppMaterialTheme()
        : createAppMaterialLightTheme(),
    [mode],
  );
  const toggleMode = useCallback(() => {
    setMode(m => (m === 'dark' ? 'light' : 'dark'));
  }, []);
  const modeApi = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, toggleMode],
  );
  return (
    <ThemeModeContext.Provider value={modeApi}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeModeContext.Provider>
  );
}
