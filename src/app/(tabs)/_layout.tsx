import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ColorValue } from 'react-native';

import { useSettingsStore } from '@/stores/useSettingsStore';
import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function tabIcon(outline: IconName, filled: IconName) {
  return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

export default function TabsLayout() {
  const onboarded = useSettingsStore((s) => s.onboarded);
  const [hydrated, setHydrated] = useState(useSettingsStore.persist.hasHydrated());

  useEffect(() => useSettingsStore.persist.onFinishHydration(() => setHydrated(true)), []);

  if (!hydrated) return null;
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Acasă', tabBarIcon: tabIcon('home-outline', 'home') }}
      />
      <Tabs.Screen
        name="materii"
        options={{ title: 'Materii', tabBarIcon: tabIcon('library-outline', 'library') }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: tabIcon('person-outline', 'person') }}
      />
    </Tabs>
  );
}
