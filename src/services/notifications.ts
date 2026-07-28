import * as Notifications from 'expo-notifications';
import { daysUntil } from '../lib/dates';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

const BAC_MILESTONES = [30, 14, 7, 3, 1];

// Anulează tot și reprogramează: reminder zilnic de streak + countdown spre Bac.
export async function rescheduleAll(bacDate: string): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Nu-ți pierde seria!',
        body: 'O rundă scurtă de întrebări și streak-ul tău e în siguranță.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 30,
      },
    });

    const remaining = daysUntil(bacDate);
    for (const days of BAC_MILESTONES) {
      if (days >= remaining) continue;
      const fireDate = new Date(`${bacDate}T09:00:00`);
      fireDate.setDate(fireDate.getDate() - days);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📚 Mai ${days === 1 ? 'este 1 zi' : `sunt ${days} zile`} până la Bac!`,
          body: 'Fiecare rundă contează. Hai la antrenament!',
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
      });
    }
  } catch {
    // Fără permisiune sau platformă fără suport (web): aplicația merge normal.
  }
}

export async function cancelAll(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignorat
  }
}
