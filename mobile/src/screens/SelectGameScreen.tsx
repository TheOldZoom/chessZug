import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Chip,
  IconButton,
  List,
  SegmentedButtons,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import {
  formatSecondsToClock,
  pickRandomSide,
} from '../game/gameScreenHelpers';
import {
  COMPUTER_ELO_OPTIONS,
  type ComputerElo,
  type GameSettings,
  type RootStackParamList,
  type TimePresetId,
} from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SelectGame'>;

const PRESETS: Record<
  Exclude<TimePresetId, 'custom'>,
  Pick<GameSettings, 'minutes' | 'incrementSeconds'>
> = {
  bullet: { minutes: 1, incrementSeconds: 0 },
  blitz: { minutes: 3, incrementSeconds: 0 },
  rapid: { minutes: 10, incrementSeconds: 0 },
  classical: { minutes: 15, incrementSeconds: 15 },
};

const MAX_MAIN_SEC = 999 * 60 + 59;
const MAX_INC_SEC = 999;

const REPEAT_DELAY_MS = 450;
const REPEAT_INTERVAL_MS = 85;

const layout = StyleSheet.create({
  cardTitleCenter: {
    textAlign: 'center',
    width: '100%',
  },
  centerBlock: {
    alignItems: 'center',
  },
  centerLabel: {
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  centerClock: {
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepperRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  startButton: {
    alignSelf: 'stretch',
    maxWidth: 420,
  },
});

function RepeatIconButton(props: {
  icon: string;
  onStep: () => void;
  disabled?: boolean;
  onGestureStart?: () => void;
  accessibilityLabel: string;
}) {
  const { icon, onStep, disabled, onGestureStart, accessibilityLabel } = props;
  const timers = useRef<{
    delay?: ReturnType<typeof setTimeout>;
    repeat?: ReturnType<typeof setInterval>;
  }>({});

  const clear = () => {
    if (timers.current.delay) {
      clearTimeout(timers.current.delay);
    }
    if (timers.current.repeat) {
      clearInterval(timers.current.repeat);
    }
    timers.current = {};
  };

  useEffect(() => () => clear(), []);

  const onPressIn = () => {
    if (disabled) {
      return;
    }
    onGestureStart?.();
    onStep();
    timers.current.delay = setTimeout(() => {
      timers.current.repeat = setInterval(onStep, REPEAT_INTERVAL_MS);
    }, REPEAT_DELAY_MS);
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={clear}
      style={{ opacity: disabled ? 0.38 : 1 }}
    >
      <View pointerEvents="none">
        <IconButton icon={icon} mode="contained-tonal" size={22} />
      </View>
    </Pressable>
  );
}

export function SelectGameScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [preset, setPreset] = useState<TimePresetId>('blitz');
  const [mainTotalSec, setMainTotalSec] = useState(() =>
    Math.round(PRESETS.blitz.minutes * 60),
  );
  const [incTotalSec, setIncTotalSec] = useState(0);
  const [side, setSide] = useState<GameSettings['side']>('random');
  const [vsComputer, setVsComputer] = useState(false);
  const [elo, setElo] = useState<ComputerElo>(1200);

  const timeOk = mainTotalSec > 0 && incTotalSec <= MAX_INC_SEC;
  const canStart = vsComputer || timeOk;

  const markCustom = () => setPreset('custom');

  const applyPreset = (id: keyof typeof PRESETS) => {
    setPreset(id);
    const p = PRESETS[id];
    setMainTotalSec(Math.min(MAX_MAIN_SEC, Math.round(p.minutes * 60)));
    setIncTotalSec(Math.min(MAX_INC_SEC, p.incrementSeconds));
  };

  const bumpElo = (d: number) => {
    setElo(prev => {
      const i = COMPUTER_ELO_OPTIONS.indexOf(prev);
      const n = Math.min(COMPUTER_ELO_OPTIONS.length - 1, Math.max(0, i + d));
      return COMPUTER_ELO_OPTIONS[n];
    });
  };

  const buildSettings = (): GameSettings => ({
    preset,
    minutes: vsComputer ? 5 : mainTotalSec / 60,
    incrementSeconds: vsComputer ? 0 : incTotalSec,
    side: side === 'random' ? pickRandomSide() : side,
    computer: vsComputer ? { elo } : null,
  });

  const stepMain = (delta: number) => {
    setMainTotalSec(prev => Math.max(0, Math.min(MAX_MAIN_SEC, prev + delta)));
  };

  const stepInc = (delta: number) => {
    setIncTotalSec(prev => Math.max(0, Math.min(MAX_INC_SEC, prev + delta)));
  };

  return (
    <Screen style={{ paddingBottom: 0 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        bounces={false}
        overScrollMode="never"
      >
        <Card mode="elevated" style={{ marginBottom: 12 }}>
          <Card.Title title="Opponent" titleStyle={layout.cardTitleCenter} />
          <Card.Content>
            <List.Item
              title="Play against computer"
              right={() => (
                <Switch value={vsComputer} onValueChange={setVsComputer} />
              )}
            />
            {vsComputer ? (
              <View style={[layout.centerBlock, { marginTop: 8 }]}>
                <Text
                  variant="labelLarge"
                  style={[layout.centerLabel, { marginBottom: 4 }]}
                >
                  Engine strength
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[layout.centerClock, { marginBottom: 8 }]}
                >
                  {elo}
                </Text>
                <View
                  collapsable={false}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    justifyContent: 'center',
                  }}
                >
                  <RepeatIconButton
                    icon="minus"
                    disabled={elo <= COMPUTER_ELO_OPTIONS[0]}
                    accessibilityLabel="Lower engine strength"
                    onStep={() => bumpElo(-1)}
                  />
                  <RepeatIconButton
                    icon="plus"
                    disabled={
                      elo >=
                      COMPUTER_ELO_OPTIONS[COMPUTER_ELO_OPTIONS.length - 1]
                    }
                    accessibilityLabel="Raise engine strength"
                    onStep={() => bumpElo(1)}
                  />
                </View>
              </View>
            ) : null}
          </Card.Content>
        </Card>

        {!vsComputer ? (
          <Card mode="elevated" style={{ marginBottom: 12 }}>
            <Card.Title title="Time" titleStyle={layout.cardTitleCenter} />
            <Card.Content>
              <View style={layout.chipRow}>
                {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map(id => (
                  <Chip
                    key={id}
                    selected={preset === id}
                    onPress={() => applyPreset(id)}
                  >
                    {id}
                  </Chip>
                ))}
              </View>

              <View style={layout.centerBlock}>
                <Text
                  variant="labelLarge"
                  style={[layout.centerLabel, { marginBottom: 4 }]}
                >
                  Main time
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    layout.centerClock,
                    {
                      fontVariant: ['tabular-nums'],
                      color: theme.colors.primary,
                      marginBottom: 8,
                    },
                  ]}
                >
                  {formatSecondsToClock(mainTotalSec)}
                </Text>
              </View>
              <View style={layout.stepperRow}>
                <Text variant="labelSmall">Min</Text>
                <RepeatIconButton
                  icon="minus"
                  accessibilityLabel="Decrease main minutes"
                  onGestureStart={markCustom}
                  onStep={() => stepMain(-60)}
                />
                <RepeatIconButton
                  icon="plus"
                  accessibilityLabel="Increase main minutes"
                  onGestureStart={markCustom}
                  onStep={() => stepMain(60)}
                />
                <Text variant="labelSmall" style={{ marginLeft: 8 }}>
                  Sec
                </Text>
                <RepeatIconButton
                  icon="minus"
                  accessibilityLabel="Decrease main seconds"
                  onGestureStart={markCustom}
                  onStep={() => stepMain(-1)}
                />
                <RepeatIconButton
                  icon="plus"
                  accessibilityLabel="Increase main seconds"
                  onGestureStart={markCustom}
                  onStep={() => stepMain(1)}
                />
              </View>

              <View style={layout.centerBlock}>
                <Text
                  variant="labelLarge"
                  style={[layout.centerLabel, { marginBottom: 4 }]}
                >
                  Increment
                </Text>
                <Text
                  variant="headlineSmall"
                  style={[
                    layout.centerClock,
                    {
                      fontVariant: ['tabular-nums'],
                      color: theme.colors.primary,
                      marginBottom: 8,
                    },
                  ]}
                >
                  {formatSecondsToClock(incTotalSec)}
                </Text>
              </View>
              <View style={layout.stepperRowLast}>
                <Text variant="labelSmall">Min</Text>
                <RepeatIconButton
                  icon="minus"
                  accessibilityLabel="Decrease increment minutes"
                  onGestureStart={markCustom}
                  onStep={() => stepInc(-60)}
                />
                <RepeatIconButton
                  icon="plus"
                  accessibilityLabel="Increase increment minutes"
                  onGestureStart={markCustom}
                  onStep={() => stepInc(60)}
                />
                <Text variant="labelSmall" style={{ marginLeft: 8 }}>
                  Sec
                </Text>
                <RepeatIconButton
                  icon="minus"
                  accessibilityLabel="Decrease increment seconds"
                  onGestureStart={markCustom}
                  onStep={() => stepInc(-1)}
                />
                <RepeatIconButton
                  icon="plus"
                  accessibilityLabel="Increase increment seconds"
                  onGestureStart={markCustom}
                  onStep={() => stepInc(1)}
                />
              </View>
            </Card.Content>
          </Card>
        ) : null}

        <Card mode="elevated" style={{ marginBottom: 12 }}>
          <Card.Title title="Side" titleStyle={layout.cardTitleCenter} />
          <Card.Content>
            <SegmentedButtons
              value={side}
              onValueChange={v => setSide(v as GameSettings['side'])}
              buttons={[
                { value: 'random', label: 'Random' },
                { value: 'w', label: 'White' },
                { value: 'b', label: 'Black' },
              ]}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={[layout.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          mode="contained"
          disabled={!canStart}
          style={layout.startButton}
          onPress={() =>
            navigation.navigate('Game', { settings: buildSettings() })
          }
        >
          Start game
        </Button>
      </View>
    </Screen>
  );
}
