import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { daysUntil } from '@/lib/dates';
import { colors, radius, spacing, type } from '@/theme';

export function CountdownCard({ bacDate }: { bacDate: string }) {
  const days = daysUntil(bacDate);
  return (
    <View style={styles.card}>
      <View style={styles.textCol}>
        <Text style={styles.days}>{days}</Text>
        <Text style={styles.label}>{days === 1 ? 'zi până la Bac' : 'zile până la Bac'}</Text>
      </View>
      <View style={styles.iconWrap}>
        <Ionicons name="hourglass-outline" size={44} color="#FFFFFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    padding: spacing(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: { gap: spacing(1) },
  days: { fontSize: 48, fontWeight: '800', color: '#FFFFFF', lineHeight: 52 },
  label: { fontSize: type.body, color: '#E4E2FB', fontWeight: '600' },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
