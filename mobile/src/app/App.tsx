import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from '../screens/GameScreen';
import { ThemeProvider, useThemeSettings } from '../theme';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const { effectiveScheme } = useThemeSettings();
  return (
    <StatusBar
      barStyle={effectiveScheme === 'dark' ? 'light-content' : 'dark-content'}
    />
  );
}

function AppContent() {
  return <GameScreen />;
}

export default App;
