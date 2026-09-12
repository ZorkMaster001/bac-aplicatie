import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { ProbaDPicker } from '@/components/ProbaDPicker';
import { Screen } from '@/components/Screen';
import { SpecializarePicker } from '@/components/SpecializarePicker';
import {
  getSpecializare,
  probaDComplete,
  type ProbaDId,
  type SpecializareId,
} from '@/data/bac';
import { authErrorMessage, supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors, radius, spacing, type } from '@/theme';

export default function ProbeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setUser = useAuthStore((s) => s.setUser);

  const [specializareId, setSpecializareId] = useState<SpecializareId | null>(
    profile?.specializareId ?? null
  );
  const [probaD, setProbaD] = useState<ProbaDId | null>(profile?.probaD ?? null);
  const [optiune, setOptiune] = useState<string[]>(profile?.probaDOptiune ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ecranul se deschide doar din Profil, deci profilul există deja.
  if (!profile) return <Redirect href="/(tabs)" />;

  const spec = getSpecializare(specializareId);
  const ready = !!spec && probaDComplete(probaD, optiune);

  const pickSpecializare = (id: SpecializareId) => {
    setSpecializareId(id);
    const next = getSpecializare(id);
    if (probaD && next && !next.probaD.includes(probaD)) {
      setProbaD(null);
      setOptiune([]);
    }
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: {
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
    setUser(data.user);
    setBusy(false);
    router.back();
  };

  return (
    <Screen>
      <View style={styles.flex}>
        <View style={styles.header}>
          <PressableScale onPress={() => router.back()} style={styles.close}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </PressableScale>
          <Text style={styles.title}>Probele mele</Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollBody}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(350)} style={styles.stack}>
            <SpecializarePicker value={specializareId} onChange={pickSpecializare} />
            {spec && (
              <ProbaDPicker
                spec={spec}
                value={probaD}
                optiune={optiune}
                onChange={(id) => {
                  setProbaD(id);
                  setOptiune([]);
                }}
                onOptiuneChange={setOptiune}
              />
            )}
          </Animated.View>
        </ScrollView>

        {error && <Text style={styles.error}>{error}</Text>}
        <PressableScale
          onPress={save}
          disabled={!ready || busy}
          style={[styles.cta, (!ready || busy) && styles.ctaDisabled]}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>Salvează</Text>
          )}
        </PressableScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginBottom: spacing(4),
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: type.h2, fontWeight: '800', color: colors.text },
  scrollBody: { paddingBottom: spacing(6) },
  stack: { gap: spacing(5) },
  error: { fontSize: type.small, color: colors.error, textAlign: 'center' },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(3),
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#fff', fontSize: type.body, fontWeight: '700' },
});
