import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdBanner } from '@/components/AdBanner';
import { Card } from '@/components/Card';
import { CountdownCard } from '@/components/CountdownCard';
import { Screen } from '@/components/Screen';
import { StreakFlame } from '@/components/StreakFlame';
import { XpBar } from '@/components/XpBar';
import { CHAPTERS } from '@/data';
import { getSpecializare, PROBA_A, PROBE_C, PROBE_D, shortLabel } from '@/data/bac';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { colors, spacing, type } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streakCount);
  const lastChapterId = useProgressStore((s) => s.lastChapterId);

  const continueChapter =
    CHAPTERS.find((c) => c.id === lastChapterId) ?? CHAPTERS[0];

  // Poarta din (tabs)/_layout garantează profilul; asta e doar pentru tipuri.
  if (!profile) return null;

  const spec = getSpecializare(profile.specializareId);

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.greeting}>Salut, {profile.name} 👋</Text>
          <Text style={styles.tagline}>Hai să facem puncte azi.</Text>
          {spec && (
            <View style={styles.probeRow}>
              <Ionicons name="ribbon-outline" size={14} color={colors.accent} />
              <Text style={styles.probeText} numberOfLines={1}>
                {shortLabel(PROBA_A)} · {shortLabel(PROBE_C[spec.probaC])} ·{' '}
                {shortLabel(PROBE_D[profile.probaD])}
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <CountdownCard bacDate={profile.bacDate} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Card style={styles.statsCard}>
            <StreakFlame count={streak} />
            <View style={styles.divider} />
            <XpBar xp={xp} />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Card onPress={() => router.push(`/quiz/${continueChapter.id}`)}>
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Ionicons name="play" size={26} color={colors.accent} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Continuă să înveți</Text>
                <Text style={styles.actionSubtitle} numberOfLines={1}>
                  {continueChapter.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <Card onPress={() => router.push('/exam')}>
            <View style={styles.actionRow}>
              <View style={[styles.actionIcon, styles.examIcon]}>
                <Ionicons name="document-text-outline" size={26} color={colors.gold} />
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Simulare examen</Text>
                <Text style={styles.actionSubtitle}>30 de întrebări · 30 de minute</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <AdBanner />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(4) },
  greeting: { fontSize: type.h1, fontWeight: '800', color: colors.text },
  tagline: { fontSize: type.body, color: colors.textMuted, marginTop: spacing(1) },
  probeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(2),
  },
  probeText: { flex: 1, fontSize: type.small, color: colors.accent, fontWeight: '600' },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(5),
  },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(4) },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examIcon: { backgroundColor: '#FEF3E2' },
  actionText: { flex: 1, gap: 2 },
  actionTitle: { fontSize: type.body, fontWeight: '700', color: colors.text },
  actionSubtitle: { fontSize: type.small, color: colors.textMuted },
});
