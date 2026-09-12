import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { CHAPTERS } from '@/data';
import {
  getSpecializare,
  optiuneSummary,
  PROBA_A,
  PROBE_C,
  PROBE_D,
  probaCLabel,
} from '@/data/bac';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { colors, radius, spacing, type } from '@/theme';

// Card lat pentru o probă care încă nu are conținut în aplicație.
function LockedProba({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Card style={styles.lockedProba}>
      <View style={styles.historyRow}>
        <View style={styles.lockedIcon}>
          <Ionicons name={icon} size={26} color={colors.textMuted} />
        </View>
        <View style={styles.historyText}>
          <Text style={styles.lockedProbaTitle}>{title}</Text>
          <Text style={styles.historySubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.soonBadge}>
          <Ionicons name="lock-closed-outline" size={11} color={colors.textMuted} />
          <Text style={styles.soonText}>În curând</Text>
        </View>
      </View>
    </Card>
  );
}

export default function MateriiScreen() {
  const router = useRouter();
  const chapters = useProgressStore((s) => s.chapters);
  const profile = useAuthStore((s) => s.profile);

  const totalRuns = CHAPTERS.reduce((acc, c) => acc + (chapters[c.id]?.runs ?? 0), 0);
  const started = CHAPTERS.filter((c) => (chapters[c.id]?.runs ?? 0) > 0).length;

  const spec = getSpecializare(profile?.specializareId);
  const probaD = profile?.probaD ?? null;
  const dSummary =
    probaD && profile ? optiuneSummary(probaD, profile.probaDOptiune) : null;

  // Istoria e singura materie cu conținut, deci apare doar când chiar e proba
  // obligatorie a elevului.
  const istorieEsteProbaC = spec?.probaC === 'istorie';

  const istorieCard = (
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
  );

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.title}>Materii</Text>
          <Text style={styles.subtitle}>Alege-ți frontul de luptă.</Text>
        </Animated.View>

        {spec && probaD && (
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Probele tale</Text>

            <LockedProba
              title={PROBA_A.label}
              subtitle="Obligatorie pentru toți · E)a"
              icon={PROBA_A.icon}
            />

            {istorieEsteProbaC ? (
              istorieCard
            ) : (
              <LockedProba
                title={probaCLabel(spec)}
                subtitle="Proba obligatorie a profilului · E)c"
                icon={PROBE_C[spec.probaC].icon}
              />
            )}

            <LockedProba
              title={PROBE_D[probaD].label}
              subtitle={dSummary ? `Proba la alegere · ${dSummary}` : 'Proba la alegere · E)d'}
              icon={PROBE_D[probaD].icon}
            />
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(4) },
  section: { gap: spacing(3) },
  sectionTitle: {
    fontSize: type.small,
    fontWeight: '800',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockedProba: { opacity: 0.75 },
  lockedProbaTitle: { fontSize: type.body, fontWeight: '800', color: colors.text },
  lockedIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
