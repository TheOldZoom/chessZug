import { useMemo, type ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { createAppMaterialTheme } from './materialTheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createAppMaterialTheme(), []);
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
