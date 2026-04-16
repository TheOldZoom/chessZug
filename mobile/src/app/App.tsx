import { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AiTestScreen } from '../screens/AiTestScreen';
import { GameScreen } from '../screens/GameScreen';
import { ThemeProvider, useThemeSettings } from '../theme/ThemeProvider';

type Route = 'game' | 'aiTest';

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
  const [route, setRoute] = useState<Route>('game');
  if (route === 'aiTest') {
    return <AiTestScreen onBack={() => setRoute('game')} />;
  }
  return <GameScreen onOpenAiTest={() => setRoute('aiTest')} />;
}

export default App;
