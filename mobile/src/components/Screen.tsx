import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

export const SCREEN_EDGE_PADDING = 16;

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, style }: Props) {
  const theme = useTheme();
  return (
    <Surface
      mode="flat"
      elevation={0}
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: SCREEN_EDGE_PADDING,
        },
        style,
      ]}
    >
      {children}
    </Surface>
  );
}
