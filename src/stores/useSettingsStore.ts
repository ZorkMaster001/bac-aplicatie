import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Doar setări legate de dispozitiv. Numele și data Bacului stau pe cont,
// în user_metadata — vezi useAuthStore.
interface SettingsState {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (on: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: false,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'bacpro-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // v1 ținea name/bacDate/onboarded local; acum vin de pe cont.
      version: 2,
      migrate: (persisted) => ({
        notificationsEnabled: Boolean(
          (persisted as { notificationsEnabled?: boolean } | null)?.notificationsEnabled
        ),
      }),
    }
  )
);
