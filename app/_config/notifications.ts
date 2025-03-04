// notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Handler para iOS exibir banner no foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/**
 * Agenda uma notificação local. Se isRecurring === true,
 * repete diariamente no mesmo horário.
 */
export async function scheduleNotification(date: Date, message: string, isRecurring?: boolean) {
  if (isRecurring) {
    const trigger = {
      hour: date.getHours(),
      minute: date.getMinutes(),
      repeats: true,
      channelId: Platform.OS === 'android' ? 'default' : undefined,
    };
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Lembrete', body: message },
      trigger,
    });
  } else {
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Lembrete', body: message },
      trigger: {
        date,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  }
}
