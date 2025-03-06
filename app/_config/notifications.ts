import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração para exibir notificações no iOS enquanto o app está aberto
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
 * 📌 Função para agendar notificações locais corretamente.
 * Se `isRecurring === true`, repete diariamente no mesmo horário.
 */
export async function scheduleNotification(date: Date, message: string, isRecurring?: boolean) {
  if (isRecurring) {
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Lembrete', body: message },
      trigger: {
        type: 'daily', // 🛠 Correção para notificações diárias
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
      },
    });
  } else {
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Lembrete', body: message },
      trigger: {
        type: 'calendar', // 🛠 Corrigido para notificações agendadas no futuro
        date: date.toISOString(),
      },
    });
  }
}

export default { requestNotificationPermissions, scheduleNotification };
