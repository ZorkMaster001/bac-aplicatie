import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@/theme';

export function StreakFlame({ count }: { count: number }) {
  const active = count > 0;
  return (
    <View style={styles.wrap}>
      <Ionicons
        name={active ? 'flame' : 'flame-outline'}
        size={32}
        color={active ? colors.gold : colors.textMuted}
      />
      <Text style={[styles.count, active && styles.countActive]}>{count}</Text>
      <Text style={styles.label}>{count === 1 ? 'zi la rând' : 'zile la rând'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing(1) },
  count: { fontSize: type.h2, fontWeight: '800', color: colors.textMuted },
  countActive: { color: colors.text },
  label: { fontSize: type.small, color: colors.textMuted },
});
