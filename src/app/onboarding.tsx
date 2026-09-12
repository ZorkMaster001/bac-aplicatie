import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { ProbaDPicker } from '@/components/ProbaDPicker';
import { Screen } from '@/components/Screen';
import { SpecializarePicker } from '@/components/SpecializarePicker';
import {
  getSpecializare,
  isProbaDId,
  probaDComplete,
  type ProbaDId,
  type SpecializareId,
} from '@/data/bac';
import { nextBacDate } from '@/lib/dates';
import { rescheduleAll, requestPermission } from '@/services/notifications';
import { authErrorMessage, supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors, radius, spacing, type } from '@/theme';

const MONTH_NAMES = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie',
];

const TOTAL_STEPS = 4;
type Step = 1 | 2 | 3 | 4;

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

function toList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string');
  return typeof raw === 'string' && raw ? [raw] : [];
}

export default function OnboardingScreen() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);

  const options = sessionOptions();
  // Conturile mai vechi au deja nume și dată: le preluăm și sărim direct la
  // prima întrebare fără răspuns, în loc să reluăm totul de la capăt.
  const meta = user?.user_metadata ?? {};
  const [name, setNameLocal] = useState<string>(() =>
    typeof meta.name === 'string' ? meta.name : ''
  );
  const [bacDate, setBacDateLocal] = useState<string>(() =>
    typeof meta.bac_date === 'string' && meta.bac_date
      ? meta.bac_date
      : options[options.length - 1].iso
  );
  const [specializareId, setSpecializareId] = useState<SpecializareId | null>(
    () => getSpecializare(meta.bac_specializare)?.id ?? null
  );
  const [probaD, setProbaD] = useState<ProbaDId | null>(() =>
    isProbaDId(meta.bac_proba_d) ? meta.bac_proba_d : null
  );
  const [optiune, setOptiune] = useState<string[]>(() => toList(meta.bac_proba_d_optiune));
  const [step, setStep] = useState<Step>(() => {
    if (typeof meta.name !== 'string' || !meta.name.trim()) return 1;
    if (typeof meta.bac_date !== 'string' || !meta.bac_date) return 2;
    if (!getSpecializare(meta.bac_specializare)) return 3;
    return 4;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/auth" />;

  const spec = getSpecializare(specializareId);

  // Schimbarea specializării poate invalida proba aleasă: lista de la E)d diferă.
  const pickSpecializare = (id: SpecializareId) => {
    setSpecializareId(id);
    const next = getSpecializare(id);
    if (probaD && next && !next.probaD.includes(probaD)) {
      setProbaD(null);
      setOptiune([]);
    }
  };

  const pickProbaD = (id: ProbaDId) => {
    setProbaD(id);
    setOptiune([]);
  };

  // Profilul se salvează pe cont (user_metadata), nu pe telefon.
  const finish = async () => {
    setBusy(true);
    setError(null);
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: {
        name: name.trim(),
        bac_date: bacDate,
        bac_specializare: specializareId,
        bac_proba_d: probaD,
        bac_proba_d_optiune: optiune,
      },
    });
    if (updateError || !data.user) {
      setBusy(false);
      setError(authErrorMessage(updateError));
      return;
    }
    // Store-ul se actualizează înainte de navigare: altfel poarta din (tabs)
    // vede încă un profil gol și trimite înapoi în onboarding.
    setUser(data.user);

    const granted = await requestPermission();
    setNotificationsEnabled(granted);
    if (granted) await rescheduleAll(bacDate);
    setBusy(false);
    router.replace('/(tabs)');
  };

  const stepBadge = (
    <Text style={styles.stepBadge}>
      Pasul {step} din {TOTAL_STEPS}
    </Text>
  );

  if (step === 3 || step === 4) {
    const ready = step === 3 ? !!spec : probaDComplete(probaD, optiune);
    return (
      <Screen>
        <View style={styles.flex}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInRight.duration(350)} style={styles.scrollStack}>
              <View>
                {stepBadge}
                <Text style={styles.titleLeft}>
                  {step === 3 ? 'Ce specializare ai?' : 'Ce dai la proba la alegere?'}
                </Text>
                <Text style={styles.subtitleLeft}>
                  {step === 3
                    ? 'După ea se stabilește proba obligatorie a profilului.'
                    : 'E)d e singura probă pe care o alegi tu.'}
                </Text>
              </View>

              {step === 3 ? (
                <SpecializarePicker value={specializareId} onChange={pickSpecializare} />
              ) : (
                spec && (
                  <ProbaDPicker
                    spec={spec}
                    value={probaD}
                    optiune={optiune}
                    onChange={pickProbaD}
                    onOptiuneChange={setOptiune}
                  />
                )
              )}
            </Animated.View>
          </ScrollView>

          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.footer}>
            <PressableScale
              onPress={() => setStep(step === 4 ? 3 : 2)}
              disabled={busy}
              style={styles.back}
            >
              <Ionicons name="arrow-back" size={20} color={colors.accent} />
            </PressableScale>
            <PressableScale
              onPress={step === 3 ? () => setStep(4) : finish}
              disabled={!ready || busy}
              style={[styles.cta, styles.ctaGrow, (!ready || busy) && styles.ctaDisabled]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.ctaText}>{step === 3 ? 'Mai departe' : 'Începe'}</Text>
                  <Ionicons
                    name={step === 3 ? 'arrow-forward' : 'rocket-outline'}
                    size={20}
                    color="#fff"
                  />
                </>
              )}
            </PressableScale>
          </View>
        </View>
      </Screen>
    );
  }

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
            <PressableScale onPress={() => setStep(3)} style={styles.cta}>
              <Text style={styles.ctaText}>Mai departe</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  scrollBody: { paddingBottom: spacing(6) },
  scrollStack: { gap: spacing(5) },
  hero: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  stepBadge: {
    fontSize: type.small,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: spacing(2),
  },
  title: {
    fontSize: type.h1,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
  },
  titleLeft: { fontSize: type.h1, fontWeight: '800', color: colors.text, lineHeight: 36 },
  subtitle: {
    fontSize: type.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  subtitleLeft: {
    fontSize: type.body,
    color: colors.textMuted,
    lineHeight: 24,
    marginTop: spacing(1),
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
  error: { fontSize: type.small, color: colors.error, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: spacing(3), paddingTop: spacing(3) },
  back: {
    width: 56,
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(2),
  },
  ctaGrow: { flex: 1 },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: type.body, fontWeight: '700' },
});
