import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Divider, Surface, Text, useTheme } from 'react-native-paper';
import { Screen } from '../components/Screen';
import { Board } from '../theme/materialTheme';
import { useThemeMode } from '../theme/ThemeProvider';

type Entry =
  | { kind: 'section'; title: string }
  | { kind: 'swatch'; key: string; value: string };

function buildEntries(colors: Record<string, unknown>): Entry[] {
  const out: Entry[] = [];
  for (const key of Object.keys(colors).sort((a, b) => a.localeCompare(b))) {
    const val = colors[key];
    if (typeof val === 'string') {
      out.push({ kind: 'swatch', key, value: val });
      continue;
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      out.push({ kind: 'section', title: key });
      const nested = val as Record<string, unknown>;
      for (const sub of Object.keys(nested).sort((a, b) =>
        a.localeCompare(b),
      )) {
        const ev = nested[sub];
        if (typeof ev === 'string') {
          out.push({ kind: 'swatch', key: `${key}.${sub}`, value: ev });
        }
      }
    }
  }
  return out;
}

export function ThemePaletteScreen() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const entries = useMemo(
    () => buildEntries(theme.colors as Record<string, unknown>),
    [theme.colors],
  );
  const rowBg =
    (theme.colors as { surfaceContainerHighest?: string })
      .surfaceContainerHighest ?? theme.colors.surfaceVariant;

  return (
    <Screen>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
        MD3 theme colors
      </Text>
      <Surface
        mode="flat"
        elevation={0}
        style={{
          padding: 12,
          marginBottom: 16,
          borderRadius: theme.roundness,
          backgroundColor: rowBg,
        }}
      >
        <Text variant="labelLarge" style={{ marginBottom: 8 }}>
          Appearance: {mode === 'dark' ? 'Dark' : 'Light'}
        </Text>
        <Button mode="contained-tonal" onPress={toggleMode}>
          Switch to {mode === 'dark' ? 'light' : 'dark'} theme
        </Button>
      </Surface>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {entries.map((item, index) =>
          item.kind === 'section' ? (
            <Text
              key={`s-${item.title}-${index}`}
              variant="titleSmall"
              style={{ marginTop: index === 0 ? 0 : 14, marginBottom: 8 }}
            >
              {item.title}
            </Text>
          ) : (
            <Surface
              key={item.key}
              mode="flat"
              elevation={0}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
                paddingVertical: 6,
                paddingHorizontal: 8,
                borderRadius: theme.roundness,
                backgroundColor: rowBg,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: item.value,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.outlineVariant,
                }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="labelMedium" numberOfLines={2}>
                  {item.key}
                </Text>
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {item.value}
                </Text>
              </View>
            </Surface>
          ),
        )}
        <Divider style={{ marginVertical: 16 }} />
        <Text variant="titleSmall" style={{ marginBottom: 8 }}>
          Chessboard
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          <View
            style={{
              flex: 1,
              height: 48,
              borderRadius: 8,
              backgroundColor: Board.lightSquare,
              borderWidth: 2,
              borderColor: Board.edge,
            }}
          />
          <View
            style={{
              flex: 1,
              height: 48,
              borderRadius: 8,
              backgroundColor: Board.darkSquare,
              borderWidth: 2,
              borderColor: Board.edge,
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
