import { Surface, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';

export function HomeScreen() {
  return (
    <Screen>
      <Surface
        mode="flat"
        elevation={0}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text variant="headlineMedium">ChessZug</Text>
        <Text variant="bodyLarge" style={{ marginTop: 8, opacity: 0.85 }}>
          Home
        </Text>
      </Surface>
    </Screen>
  );
}
