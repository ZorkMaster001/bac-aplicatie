import Constants, { ExecutionEnvironment } from 'expo-constants';

import { daysUntil } from '../lib/dates';

// În Expo Go (SDK 53+) expo-notifications aruncă erori pe Android la orice
// apel — acolo serviciul devine no-op. În development build merge complet.
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// expo-notifications aruncă eroare la import în Expo Go (SDK 53+ a scos
// suportul pe Android). Îl încărcăm lazy: în Expo Go devine no-op elegant,
// iar într-un development build funcționează complet.
type NotificationsModule = typeof import('expo-notifications');

let cached: NotificationsModule | null | undefined;

function getModule(): NotificationsModule | null {
  if (cached !== undefined) return cached;
  if (IS_EXPO_GO) {
    cached = null;
    return cached;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod: NotificationsModule = require('expo-notifications');
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    cached = mod;
  } catch {
    cached = null;
  }
  return cached;
}

export async function requestPermission(): Promise<boolean> {
  const mod = getModule();
  if (!mod) return false;
  try {
    const current = await mod.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await mod.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

const BAC_MILESTONES = [30, 14, 7, 3, 1];

// Anulează tot și reprogramează: reminder zilnic de streak + countdown spre Bac.
export async function rescheduleAll(bacDate: string): Promise<void> {
  const mod = getModule();
  if (!mod) return;
  try {
    await mod.cancelAllScheduledNotificationsAsync();

    await mod.scheduleNotificationAsync({
      content: {
        title: '🔥 Nu-ți pierde seria!',
        body: 'O rundă scurtă de întrebări și streak-ul tău e în siguranță.',
      },
      trigger: {
        type: mod.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 30,
      },
    });

    const remaining = daysUntil(bacDate);
    for (const days of BAC_MILESTONES) {
      if (days >= remaining) continue;
      const fireDate = new Date(`${bacDate}T09:00:00`);
      fireDate.setDate(fireDate.getDate() - days);
      await mod.scheduleNotificationAsync({
        content: {
          title: `📚 Mai ${days === 1 ? 'este 1 zi' : `sunt ${days} zile`} până la Bac!`,
          body: 'Fiecare rundă contează. Hai la antrenament!',
        },
        trigger: { type: mod.SchedulableTriggerInputTypes.DATE, date: fireDate },
      });
    }
  } catch {
    // Fără permisiune sau platformă fără suport: aplicația merge normal.
  }
}

export async function cancelAll(): Promise<void> {
  const mod = getModule();
  if (!mod) return;
  try {
    await mod.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignorat
  }
}
