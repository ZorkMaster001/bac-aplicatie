import { useProStore } from '../stores/useProStore';

// Mock — se înlocuiește cu AdMob (react-native-google-mobile-ads) în dev build.
export interface AdService {
  shouldShowAds(): boolean;
}

export const ads: AdService = {
  shouldShowAds: () => !useProStore.getState().isPro,
};
