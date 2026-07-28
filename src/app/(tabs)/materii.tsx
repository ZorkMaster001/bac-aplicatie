import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { CHAPTERS } from '@/data';
import { useProgressStore } from '@/stores/useProgressStore';
import { colors, radius, spacing, type } from '@/theme';

const SOON: { title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { title: 'Română', icon: 'book-outline' },
  { title: 'Geografie', icon: 'map-outline' },
  { title: 'Matematică', icon: 'calculator-outline' },
];

function LockedSubject({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) {
  const shake = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const onPress = () => {
    shake.value = withSequence(
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return (
    <Animated.View style={[styles.gridItem, style]}>
      <PressableScale onPress={onPress} style={styles.lockedCard}>
        <Ionicons name={icon} size={30} color={colors.textMuted} />
        <Text style={styles.lockedTitle}>{title}</Text>
        <View style={styles.soonBadge}>
          <Ionicons name="lock-closed-outline" size={11} color={colors.textMuted} />
          <Text style={styles.soonText}>În curând</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export default function MateriiScreen() {
  const router = useRouter();
  const chapters = useProgressStore((s) => s.chapters);

  const totalRuns = CHAPTERS.reduce((acc, c) => acc + (chapters[c.id]?.runs ?? 0), 0);
  const started = CHAPTERS.filter((c) => (chapters[c.id]?.runs ?? 0) > 0).length;

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Materii</Text>
          <Text style={styles.subtitle}>Alege-ți frontul de luptă.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Card onPress={() => router.push('/istorie')} style={styles.historyCard}>
            <View style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <Ionicons name="time-outline" size={30} color={colors.accent} />
              </View>
              <View style={styles.historyText}>
                <Text style={styles.historyTitle}>Istorie</Text>
                <Text style={styles.historySubtitle}>
                  {started}/{CHAPTERS.length} capitole începute · {totalRuns}{' '}
                  {totalRuns === 1 ? 'rundă' : 'runde'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.grid}>
          {SOON.map((s) => (
            <LockedSubject key={s.title} title={s.title} icon={s.icon} />
          ))}
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(4) },
  title: { fontSize: type.h1, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: type.body, color: colors.textMuted, marginTop: spacing(1) },
  historyCard: { borderColor: colors.accentSoft, borderWidth: 2 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(4) },
  historyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: { flex: 1, gap: 2 },
  historyTitle: { fontSize: type.h2, fontWeight: '800', color: colors.text },
  historySubtitle: { fontSize: type.small, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) },
  gridItem: { flexBasis: '31%', flexGrow: 1 },
  lockedCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    alignItems: 'center',
    gap: spacing(2),
    opacity: 0.55,
  },
  lockedTitle: { fontSize: type.small, fontWeight: '700', color: colors.text },
  soonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing(2),
    paddingVertical: 3,
  },
  soonText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
});
