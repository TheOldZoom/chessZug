import { useMemo, type ReactNode } from 'react';
import {
  CommonActions,
  DarkTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, StyleSheet, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {
  adaptNavigationTheme,
  BottomNavigation,
  useTheme,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AiTestScreen } from '../screens/AiTestScreen';
import { GameScreen } from '../screens/GameScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ThemeProvider } from '../theme/ThemeProvider';
import type { RootStackParamList } from '../types/navigation';

const Tabs = createBottomTabNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedStatusBar />
        <ThemedAppContainer>
          <ThemedNavigation />
        </ThemedAppContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  return <StatusBar barStyle="light-content" />;
}

function ThemedAppContainer({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.appContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {children}
    </View>
  );
}

function ThemedNavigation() {
  const paperTheme = useTheme();
  const { DarkTheme: adaptedNav } = adaptNavigationTheme({
    reactNavigationDark: DarkTheme,
    materialDark: paperTheme,
  });
  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      ...adaptedNav,
      fonts: DarkTheme.fonts,
    }),
    [adaptedNav],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tabs.Navigator
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: paperTheme.colors.background },
        }}
        tabBar={({ navigation, state, descriptors, insets }) => (
          <BottomNavigation.Bar
            navigationState={state}
            safeAreaInsets={insets}
            onTabPress={({ route, preventDefault }) => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (event.defaultPrevented) {
                preventDefault();
                return;
              }
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }}
            renderIcon={({ route, focused, color }) =>
              descriptors[route.key].options.tabBarIcon?.({
                focused,
                color,
                size: 24,
              }) ?? null
            }
            getLabelText={({ route }) => {
              const { options } = descriptors[route.key];
              const label =
                typeof options.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : typeof options.title === 'string'
                  ? options.title
                  : route.name;
              return label;
            }}
          />
        )}
      >
        <Tabs.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons name="home" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="Game"
          component={GameScreen}
          options={{
            title: 'Play',
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons name="chess-pawn" color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="AiTest"
          component={AiTestScreen}
          options={{
            title: 'AI',
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons name="robot" color={color} size={24} />
            ),
          }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});

export default App;
