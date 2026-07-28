import { useProStore } from '../stores/useProStore';

// Interfață compatibilă conceptual cu RevenueCat — implementarea mock
// se înlocuiește cu SDK-ul real fără a atinge ecranele.
export interface MonetizationService {
  getOffer(): { priceMonthly: string; trialDays: number };
  purchase(): Promise<boolean>;
  restore(): Promise<boolean>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const monetization: MonetizationService = {
  getOffer: () => ({ priceMonthly: '2 €', trialDays: 7 }),

  async purchase() {
    await delay(1200); // simulează fluxul de plată
    useProStore.getState().activatePro();
    return true;
  },

  async restore() {
    await delay(800);
    return useProStore.getState().isPro;
  },
};
