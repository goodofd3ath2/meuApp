import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { Button, Platform, Alert } from 'react-native';

export default function MyScreen() {
  useEffect(() => {
    // Pedir permissão assim que o componente carrega
    requestPermissions();
    // Configurar canal no Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  }, []);

  async function requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Notificações', 'As notificações foram bloqueadas ou não permitidas.');
    }
  }

  async function scheduleExactNotification() {
    const triggerDate = new Date(Date.now() + 2 * 60 * 1000); // daqui a 2 minutos
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificação em 2 minutos',
        body: 'Exemplo de data exata usando date-based trigger.',
        sound: 'default',
      },
      trigger: {
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
    Alert.alert('Agendado', 'Notificação vai aparecer em 2 minutos.');
  }

  return (
    <Button 
      title="Agendar Notificação para 2 min" 
      onPress={scheduleExactNotification} 
    />
  );
}