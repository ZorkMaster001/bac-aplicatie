import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '@/theme';

const LOW_TIME = 5 * 60;

export function TimerPill({ secondsLeft }: { secondsLeft: number }) {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const low = secondsLeft <= LOW_TIME;
  return (
    <View style={[styles.pill, low && styles.pillLow]}>
      <Ionicons
        name={low ? 'alarm' : 'alarm-outline'}
        size={16}
        color={low ? colors.error : colors.text}
      />
      <Text style={[styles.text, low && styles.textLow]}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  pillLow: { backgroundColor: colors.errorSoft, borderColor: colors.error },
  text: { fontSize: type.small, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  textLow: { color: colors.error },
});
