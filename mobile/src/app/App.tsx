import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AiTestScreen } from '../screens/AiTestScreen';
import { GameScreen } from '../screens/GameScreen';
import type { RootStackParamList } from '../navigation/types';
import { ThemeProvider, useThemeSettings } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'ChessZug' }}
        />
        <Stack.Screen
          name="AiTest"
          component={AiTestScreen}
          options={{ title: 'AI test' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
