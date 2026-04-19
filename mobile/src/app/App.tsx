import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../theme/ThemeProvider';
import {
  ThemedAppContainer,
  ThemedNavigation,
  ThemedStatusBar,
} from '../components/Bar';

const styles = StyleSheet.create({
  root: { flex: 1 },
});

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <ThemedAppContainer>
            <ThemedNavigation />
          </ThemedAppContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
