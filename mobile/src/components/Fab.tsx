import React from 'react';
import {
  StyleProp,
  ViewStyle,
  Animated,
  StyleSheet,
  Platform,
  ScrollView,
  Text,
  SafeAreaView,
  I18nManager,
} from 'react-native';
import {
  AnimatedFAB,
  AnimatedFABAnimateFrom,
  AnimatedFABIconMode,
  useTheme,
} from 'react-native-paper';

type Props = {
  animatedValue: Animated.Value;
  visible: boolean;
  extended: boolean;
  label: string;
  animateFrom: AnimatedFABAnimateFrom;
  style?: StyleProp<ViewStyle>;
  iconMode: AnimatedFABIconMode;
  onPress: () => void;
};

export const Fab = ({
  animatedValue,
  visible,
  extended,
  label,
  animateFrom,
  style,
  iconMode = 'static',
  onPress,
}: Props) => {
  const [isExtended, setIsExtended] = React.useState(true);
  const theme = useTheme();
  const onScroll = ({
    nativeEvent,
  }: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
    const currentScrollPosition =
      Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

    setIsExtended(currentScrollPosition <= 0);
  };

  const fabStyle = { [animateFrom]: 16 };

  return (
    <AnimatedFAB
      icon={'plus'}
      label={label}
      extended={isExtended}
      onPress={onPress}
      visible={visible}
      animateFrom={animateFrom}
      iconMode={iconMode}
      style={[
        styles.fabStyle,
        style,
        fabStyle,
        { backgroundColor: theme.colors.secondaryContainer },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  fabStyle: {
    bottom: 16,
    right: 16,
    position: 'absolute',
  },
});
