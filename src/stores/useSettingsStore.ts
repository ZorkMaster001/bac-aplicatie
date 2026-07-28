import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nextBacDate } from '../lib/dates';

interface SettingsState {
  name: string;
  bacDate: string; // 'YYYY-MM-DD'
  onboarded: boolean;
  notificationsEnabled: boolean;
  setName: (name: string) => void;
  setBacDate: (iso: string) => void;
  completeOnboarding: () => void;
  setNotificationsEnabled: (on: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      name: '',
      bacDate: nextBacDate(),
      onboarded: false,
      notificationsEnabled: false,
      setName: (name) => set({ name }),
      setBacDate: (bacDate) => set({ bacDate }),
      completeOnboarding: () => set({ onboarded: true }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    { name: 'bacpro-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
