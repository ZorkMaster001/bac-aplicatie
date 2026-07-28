import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '@/theme';
import { useProStore } from '@/stores/useProStore';
import { PressableScale } from './PressableScale';

// Mock de reclamă — locul unde intră bannerul AdMob în versiunea reală.
export function AdBanner() {
  const isPro = useProStore((s) => s.isPro);
  const router = useRouter();

  if (isPro) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.ad}>
        <Ionicons name="megaphone-outline" size={18} color={colors.textMuted} />
        <Text style={styles.adText}>Reclamă · Locul tău aici</Text>
      </View>
      <PressableScale onPress={() => router.push('/paywall')}>
        <Text style={styles.upsell}>Scapă de reclame cu Pro →</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing(2) },
  ad: {
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing(2),
  },
  adText: { color: colors.textMuted, fontSize: type.small },
  upsell: {
    color: colors.accent,
    fontSize: type.small,
    fontWeight: '600',
    textAlign: 'center',
  },
});
