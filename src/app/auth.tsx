import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { Screen } from '@/components/Screen';
import { authErrorMessage, supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors, radius, spacing, type } from '@/theme';

type Mode = 'signIn' | 'signUp' | 'checkEmail';

export default function AuthScreen() {
  const status = useAuthStore((s) => s.status);
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Cine e deja conectat n-are ce căuta aici.
  if (status === 'signedIn') return <Redirect href="/(tabs)" />;

  const isSignUp = mode === 'signUp';

  const submit = async () => {
    const address = email.trim();
    setError(null);
    setInfo(null);
    if (!address || !password) {
      setError('Completează emailul și parola.');
      return;
    }

    setBusy(true);
    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: address,
        password,
      });
      setBusy(false);
      if (signUpError) {
        setError(authErrorMessage(signUpError));
        return;
      }
      // Ca să nu deconspire ce emailuri există, Supabase întoarce pentru un
      // email deja înregistrat un user fals, fără identități.
      if (data.user && data.user.identities?.length === 0) {
        setError('Există deja un cont cu acest email.');
        return;
      }
      // Cu confirmarea pe email pornită nu primim sesiune acum; altfel intrăm direct.
      if (!data.session) setMode('checkEmail');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: address,
      password,
    });
    setBusy(false);
    if (signInError) setError(authErrorMessage(signInError));
    // La succes, poarta din (tabs)/_layout preia navigarea.
  };

  const resend = async () => {
    setBusy(true);
    setError(null);
    setInfo(null);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });
    setBusy(false);
    if (resendError) setError(authErrorMessage(resendError));
    else setInfo('Am retrimis emailul de confirmare.');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword('');
  };

  if (mode === 'checkEmail') {
    return (
      <Screen>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.body}>
          <View style={styles.hero}>
            <Ionicons name="mail-unread-outline" size={64} color={colors.accent} />
          </View>
          <Text style={styles.title}>Verifică-ți emailul</Text>
          <Text style={styles.subtitle}>
            Am trimis un link de confirmare la {email.trim()}. Apasă-l, apoi întoarce-te
            aici și intră în cont.
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}
          {info && <Text style={styles.info}>{info}</Text>}
          <PressableScale onPress={resend} disabled={busy} style={styles.secondary}>
            <Text style={styles.secondaryText}>
              {busy ? 'Se trimite…' : 'Retrimite emailul'}
            </Text>
          </PressableScale>
          <PressableScale onPress={() => switchMode('signIn')} disabled={busy}>
            <Text style={styles.link}>Înapoi la conectare</Text>
          </PressableScale>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.body}>
          <View style={styles.hero}>
            <Ionicons name="school-outline" size={64} color={colors.accent} />
          </View>

          <Text style={styles.title}>
            {isSignUp ? 'Creează-ți contul' : 'Bine ai revenit'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Un cont îți ține progresul legat de tine, nu de telefon.'
              : 'Intră în cont ca să-ți continui pregătirea.'}
          </Text>

          <View style={styles.fields}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!busy}
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Parolă"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              textContentType={isSignUp ? 'newPassword' : 'password'}
              secureTextEntry
              editable={!busy}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            {isSignUp && !error && (
              <Text style={styles.hint}>Parola trebuie să aibă cel puțin 6 caractere.</Text>
            )}
            {error && <Text style={styles.error}>{error}</Text>}
          </View>

          <PressableScale
            onPress={submit}
            disabled={busy}
            style={[styles.cta, busy && styles.ctaDisabled]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {isSignUp ? 'Creează contul' : 'Intră în cont'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </PressableScale>

          <PressableScale
            onPress={() => switchMode(isSignUp ? 'signIn' : 'signUp')}
            disabled={busy}
          >
            <Text style={styles.link}>
              {isSignUp ? 'Ai deja cont? Intră în cont' : 'Nu ai cont? Creează-l'}
            </Text>
          </PressableScale>
        </Animated.View>
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
  fields: { gap: spacing(3) },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(4),
    fontSize: type.body,
    color: colors.text,
  },
  hint: { fontSize: type.small, color: colors.textMuted, paddingHorizontal: spacing(1) },
  error: { fontSize: type.small, color: colors.error, paddingHorizontal: spacing(1) },
  info: { fontSize: type.small, color: colors.success, textAlign: 'center' },
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
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: '#fff', fontSize: type.body, fontWeight: '700' },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing(4),
    alignItems: 'center',
  },
  secondaryText: { color: colors.accent, fontSize: type.body, fontWeight: '700' },
  link: { color: colors.accent, fontSize: type.small, fontWeight: '600', textAlign: 'center' },
});
