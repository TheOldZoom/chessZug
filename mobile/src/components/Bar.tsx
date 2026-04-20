import { useMemo, type ReactNode } from 'react';
import {
  CommonActions,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet, View } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import {
  adaptNavigationTheme,
  BottomNavigation,
  useTheme,
} from 'react-native-paper';
import { GameScreen } from '../screens/GameScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SelectGameScreen } from '../screens/SelectGameScreen';
import { ThemePaletteScreen } from '../screens/ThemePaletteScreen';
import {
  createAppMaterialLightTheme,
  createAppMaterialTheme,
} from '../theme/materialTheme';
import { useThemeMode } from '../theme/ThemeProvider';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const paperTheme = useTheme();
  return (
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
        name="ThemePalette"
        component={ThemePaletteScreen}
        options={{
          title: 'Theme',
          tabBarIcon: ({ color }) => (
            <MaterialDesignIcons name="palette" color={color} size={24} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

export function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />;
}

export function ThemedAppContainer({ children }: { children: ReactNode }) {
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

const materialDarkNav = createAppMaterialTheme();
const materialLightNav = createAppMaterialLightTheme();
const { LightTheme: adaptedNavLight, DarkTheme: adaptedNavDark } =
  adaptNavigationTheme({
    reactNavigationLight: DefaultTheme,
    reactNavigationDark: DarkTheme,
    materialLight: materialLightNav,
    materialDark: materialDarkNav,
  });

export function ThemedNavigation() {
  const paperTheme = useTheme();
  const { mode } = useThemeMode();
  const navigationTheme = useMemo(
    () =>
      mode === 'dark'
        ? {
            ...DarkTheme,
            ...adaptedNavDark,
            fonts: DarkTheme.fonts,
          }
        : {
            ...DefaultTheme,
            ...adaptedNavLight,
            fonts: DefaultTheme.fonts,
          },
    [mode],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: paperTheme.colors.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{
            headerShown: true,
            title: 'Game',
            headerStyle: { backgroundColor: paperTheme.colors.surface },
            headerTintColor: paperTheme.colors.onSurface,
            contentStyle: { backgroundColor: paperTheme.colors.background },
          }}
        />
        <Stack.Screen
          name="SelectGame"
          component={SelectGameScreen}
          options={{
            headerShown: true,
            title: 'New Game',
            headerStyle: { backgroundColor: paperTheme.colors.surface },
            headerTintColor: paperTheme.colors.onSurface,
            contentStyle: { backgroundColor: paperTheme.colors.background },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
