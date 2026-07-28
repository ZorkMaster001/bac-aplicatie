import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AchievementBadge } from '@/components/AchievementBadge';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ACHIEVEMENTS, levelFromXp } from '@/lib/gamification';
import { cancelAll, requestPermission, rescheduleAll } from '@/services/notifications';
import { useProgressStore } from '@/stores/useProgressStore';
import { useProStore } from '@/stores/useProStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors, radius, spacing, type } from '@/theme';

export default function ProfilScreen() {
  const router = useRouter();
  const name = useSettingsStore((s) => s.name);
  const bacDate = useSettingsStore((s) => s.bacDate);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const isPro = useProStore((s) => s.isPro);
  const progress = useProgressStore();

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

  const confirmReset = () => {
    Alert.alert('Resetezi progresul?', 'XP, seria și stelele se pierd definitiv.', [
      { text: 'Renunț', style: 'cancel' },
      { text: 'Resetez', style: 'destructive', onPress: () => progress.resetAll() },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.stack}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(name || 'B').charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{name || 'Campion'}</Text>
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

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Card onPress={confirmReset}>
            <View style={styles.row}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={styles.resetText}>Resetează progresul</Text>
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
  resetText: { fontSize: type.body, fontWeight: '600', color: colors.error },
});
