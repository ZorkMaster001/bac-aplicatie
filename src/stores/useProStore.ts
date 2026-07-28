import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProState {
  isPro: boolean;
  activatePro: () => void;
  deactivatePro: () => void;
}

export const useProStore = create<ProState>()(
  persist(
    (set) => ({
      isPro: false,
      activatePro: () => set({ isPro: true }),
      deactivatePro: () => set({ isPro: false }),
    }),
    { name: 'bacpro-pro', storage: createJSONStorage(() => AsyncStorage) }
  )
);
