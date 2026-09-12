import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AchievementBadge } from '@/components/AchievementBadge';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { getSpecializare, PROBA_A, PROBE_C, PROBE_D, shortLabel } from '@/data/bac';
import { ACHIEVEMENTS, levelFromXp } from '@/lib/gamification';
import { wipeAllDataAndSignOut } from '@/services/account';
import { cancelAll, requestPermission, rescheduleAll } from '@/services/notifications';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProgressStore } from '@/stores/useProgressStore';
import { useProStore } from '@/stores/useProStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors, radius, spacing, type } from '@/theme';

export default function ProfilScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const email = useAuthStore((s) => s.user?.email);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const isPro = useProStore((s) => s.isPro);
  const progress = useProgressStore();
  const [wiping, setWiping] = useState(false);

  const bacDate = profile?.bacDate ?? '';
  const spec = getSpecializare(profile?.specializareId);
  const { level } = levelFromXp(progress.xp);
  const accuracy =
    progress.answered > 0 ? Math.round((progress.correct / progress.answered) * 100) : 0;

  const toggleNotifications = async (on: boolean) => {
    if (on) {
      const granted = await requestPermission();
      setNotificationsEnabled(granted);
      if (granted) await rescheduleAll(bacDate);
      else
        Alert.alert(
          'Fără permisiune',
          'Activează notificările pentru BacPro din setările telefonului. (În Expo Go notificările nu sunt disponibile — folosește un development build.)'
        );
    } else {
      setNotificationsEnabled(false);
      await cancelAll();
    }
  };

  const confirmSignOut = () => {
    Alert.alert('Ieși din cont?', 'Progresul rămâne salvat pe acest telefon.', [
      { text: 'Rămân', style: 'cancel' },
      { text: 'Ies', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  const confirmWipe = () => {
    Alert.alert(
      'Ștergi toate datele?',
      'Progresul, realizările, setările și profilul (nume, data Bacului) se șterg ' +
        'definitiv. Contul tău rămâne, dar vei fi deconectat.',
      [
        { text: 'Renunț', style: 'cancel' },
        {
          text: 'Șterg tot',
          style: 'destructive',
          onPress: async () => {
            setWiping(true);
            const result = await wipeAllDataAndSignOut();
            // La succes ecranul dispare singur: poarta din (tabs) duce la /auth.
            if (!result.ok) {
              setWiping(false);
              Alert.alert('Nu s-au putut șterge datele', result.message);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || 'B').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{profile?.name ?? 'Campion'}</Text>
            <Text style={styles.level}>Nivel {level}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Card style={styles.statsCard}>
            {[
              [String(progress.answered), 'întrebări'],
              [`${accuracy}%`, 'acuratețe'],
              [progress.bestGrade !== null ? progress.bestGrade.toFixed(2) : '—', 'cea mai bună notă'],
            ].map(([value, label]) => (
              <View key={label} style={styles.stat}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Realizări</Text>
          <View style={styles.badges}>
            {ACHIEVEMENTS.map((a) => (
              <AchievementBadge
                key={a.id}
                def={a}
                unlocked={progress.achievements.includes(a.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.section}>
          <Card>
            <View style={styles.row}>
              <Ionicons
                name={notificationsEnabled ? 'notifications' : 'notifications-outline'}
                size={22}
                color={colors.accent}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Notificări</Text>
                <Text style={styles.rowSubtitle}>Reminder de streak + countdown Bac</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          {isPro ? (
            <Card style={styles.proActive}>
              <Ionicons name="sparkles" size={22} color={colors.gold} />
              <Text style={styles.proActiveText}>Ești Pro — mulțumim! 🎉</Text>
            </Card>
          ) : (
            <Card onPress={() => router.push('/paywall')} style={styles.proCard}>
              <View style={styles.row}>
                <Ionicons name="sparkles-outline" size={22} color="#fff" />
                <View style={styles.rowText}>
                  <Text style={styles.proTitle}>Treci la Pro</Text>
                  <Text style={styles.proSubtitle}>
                    Fără reclame · explicații complete · simulări nelimitate
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
            </Card>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).duration(400)}>
          <Card onPress={() => router.push('/probe')}>
            <View style={styles.row}>
              <Ionicons name="ribbon-outline" size={22} color={colors.accent} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Probele mele</Text>
                <Text style={styles.rowSubtitle} numberOfLines={2}>
                  {spec && profile
                    ? [
                        shortLabel(PROBA_A),
                        shortLabel(PROBE_C[spec.probaC]),
                        shortLabel(PROBE_D[profile.probaD]),
                      ].join(' · ')
                    : '—'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Card>
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={22} color={colors.accent} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Cont</Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {email ?? '—'}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(480).duration(400)}>
          <Card onPress={wiping ? undefined : confirmSignOut}>
            <View style={styles.row}>
              <Ionicons name="log-out-outline" size={20} color={colors.text} />
              <Text style={styles.signOutText}>Deconectare</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(560).duration(400)}>
          <Card onPress={wiping ? undefined : confirmWipe}>
            <View style={styles.row}>
              {wiping ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              )}
              <View style={styles.rowText}>
                <Text style={styles.resetText}>
                  {wiping ? 'Se șterge…' : 'Șterge toate datele'}
                </Text>
                <Text style={styles.rowSubtitle}>Contul rămâne · vei fi deconectat</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing(4) },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing(4) },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: { fontSize: type.h2, fontWeight: '800', color: colors.text },
  level: { fontSize: type.small, color: colors.accent, fontWeight: '700' },
  statsCard: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2, flex: 1 },
  statValue: { fontSize: type.h2, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  section: { gap: spacing(3) },
  sectionTitle: { fontSize: type.body, fontWeight: '800', color: colors.text },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: type.body, fontWeight: '700', color: colors.text },
  rowSubtitle: { fontSize: type.small, color: colors.textMuted },
  proCard: { backgroundColor: colors.accent, borderColor: colors.accent },
  proTitle: { fontSize: type.body, fontWeight: '800', color: '#fff' },
  proSubtitle: { fontSize: 12, color: '#DDDBFA' },
  proActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  proActiveText: { fontSize: type.body, fontWeight: '700', color: colors.text },
  signOutText: { fontSize: type.body, fontWeight: '600', color: colors.text },
  resetText: { fontSize: type.body, fontWeight: '600', color: colors.error },
});
