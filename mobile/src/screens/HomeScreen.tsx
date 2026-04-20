import {
  useNavigation,
  type CompositeNavigationProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Surface, Text } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { Fab } from '../components/Fab';
import { Animated } from 'react-native';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';

type HomeScreenNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigation>();

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
      <Fab
        animatedValue={new Animated.Value(0)}
        visible={true}
        extended={true}
        label="Play Game"
        animateFrom="right"
        iconMode="dynamic"
        onPress={() => navigation.navigate('SelectGame')}
      />
    </Screen>
  );
}
