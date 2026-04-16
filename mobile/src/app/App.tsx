import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';
import { AiTestScreen } from '../screens/AiTestScreen';
import { GameScreen } from '../screens/GameScreen';
import { ThemeProvider, useThemeSettings } from '../theme/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="AiTest" component={AiTestScreen} />
          </Stack.Navigator>
        </NavigationContainer>
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

export default App;
