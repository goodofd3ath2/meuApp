// notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Solicita permissão de envio de notificações ao usuário.
 */
export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de notificações não concedida');
  }
}

/**
 * Agenda uma notificação local para uma data/hora específica.
 * @param dateString data no formato "YYYY-MM-DD" ou Date
 * @param message texto que será exibido na notificação
 */
export async function scheduleNotification(dateString: string, message: string) {
  // Se quiser permitir horário exato, você pode adicionar um TimePicker e gerar uma data completa.
  // Aqui, como exemplo, vamos agendar para as 09:00 da data escolhida:
  const [year, month, day] = dateString.split('-').map(Number);
  const triggerDate = new Date(year, month - 1, day, 9, 0, 0);

  // Ajuste para não agendar algo no passado
  if (triggerDate.getTime() < Date.now()) {
    console.log('Data no passado. Notificação não será agendada.');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lembrete de Anotação',
      body: message,
      sound: Platform.OS === 'ios' ? 'default' : undefined,
    },
    trigger: {
      date: triggerDate, // dispara na data/hora configurada
    },
  });
}
