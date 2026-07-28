import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { nextBacDate } from '@/lib/dates';
import { rescheduleAll, requestPermission } from '@/services/notifications';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors, radius, spacing, type } from '@/theme';

const MONTH_NAMES = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

// Opțiuni de sesiune: august (toamnă) anul curent dacă mai e în viitor + iunie următor.
function sessionOptions(): { label: string; iso: string }[] {
  const now = new Date();
  const options: { label: string; iso: string }[] = [];
  const august = `${now.getFullYear()}-08-18`;
  if (new Date(`${august}T00:00:00`).getTime() > now.getTime()) {
    options.push({ label: `August ${now.getFullYear()}`, iso: august });
  }
  const june = nextBacDate(now);
  options.push({ label: `Iunie ${june.slice(0, 4)}`, iso: june });
  return options;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { setName, setBacDate, completeOnboarding, setNotificationsEnabled } =
    useSettingsStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setNameLocal] = useState('');
  const options = sessionOptions();
  const [bacDate, setBacDateLocal] = useState(options[options.length - 1].iso);

  const finish = async () => {
    setName(name.trim());
    setBacDate(bacDate);
    completeOnboarding();
    const granted = await requestPermission();
    setNotificationsEnabled(granted);
    if (granted) await rescheduleAll(bacDate);
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step === 1 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.body}>
            <View style={styles.hero}>
              <Ionicons name="school-outline" size={64} color={colors.accent} />
            </View>
            <Text style={styles.title}>Pregătește-te de Bac{'\n'}ca la un joc</Text>
            <Text style={styles.subtitle}>
              Runde scurte, serie zilnică și simulări de examen. Cum te cheamă?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Numele tău"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setNameLocal}
              returnKeyType="done"
              maxLength={24}
            />
            <PressableScale
              onPress={() => setStep(2)}
              disabled={!name.trim()}
              style={[styles.cta, !name.trim() && styles.ctaDisabled]}
            >
              <Text style={styles.ctaText}>Mai departe</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </PressableScale>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInRight.duration(350)} style={styles.body}>
            <View style={styles.hero}>
              <Ionicons name="calendar-outline" size={64} color={colors.accent} />
            </View>
            <Text style={styles.title}>Când dai Bacul?</Text>
            <Text style={styles.subtitle}>
              Pornim countdown-ul și îți amintim din timp că se apropie.
            </Text>
            <View style={styles.chips}>
              {options.map((o) => {
                const active = o.iso === bacDate;
                return (
                  <PressableScale
                    key={o.iso}
                    onPress={() => setBacDateLocal(o.iso)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Ionicons
                      name={active ? 'calendar' : 'calendar-outline'}
                      size={18}
                      color={active ? '#fff' : colors.accent}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {o.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
            <Text style={styles.dateNote}>Proba scrisă: {formatDate(bacDate)}</Text>
            <PressableScale onPress={finish} style={styles.cta}>
              <Text style={styles.ctaText}>Începe</Text>
              <Ionicons name="rocket-outline" size={20} color="#fff" />
            </PressableScale>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { flex: 1, justifyContent: 'center', gap: spacing(5) },
  hero: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: type.h1,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: type.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(4),
    fontSize: type.body,
    color: colors.text,
  },
  chips: { flexDirection: 'row', gap: spacing(3), justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.accent, fontWeight: '600', fontSize: type.body },
  chipTextActive: { color: '#fff' },
  dateNote: { textAlign: 'center', color: colors.textMuted, fontSize: type.small },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: type.body, fontWeight: '700' },
});
