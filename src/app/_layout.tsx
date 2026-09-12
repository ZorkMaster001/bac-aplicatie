import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors } from '@/theme';

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    // Sesiunea persistată scoate aplicația din starea „loading" chiar dacă
    // evenimentul INITIAL_SESSION întârzie.
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: auth } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );

    // Tokenul se reîmprospătează doar cât timp aplicația e în prim-plan.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    if (AppState.currentState === 'active') supabase.auth.startAutoRefresh();

    return () => {
      auth.subscription.unsubscribe();
      appState.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, [setSession]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="probe" options={{ presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
