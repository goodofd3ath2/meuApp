import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  TextInput,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Device from 'expo-device';

type ScheduleType = 'exact' | 'daily' | 'seconds';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('exact');
  const [exactDate, setExactDate] = useState<Date>(new Date(Date.now() + 60 * 1000));
  const [dailyTime, setDailyTime] = useState<Date>(new Date(Date.now() + 60 * 1000));
  const [seconds, setSeconds] = useState('60');

  useEffect(() => {
    requestPermissionsAndSetupChannel();
  }, []);

  async function requestPermissionsAndSetupChannel() {
    if (Device.isDevice) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Notificações', 'Permissão de notificações não concedida.');
      }
    } else {
      console.log('As notificações não funcionam em simuladores de iOS. Use um dispositivo físico.');
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
      });
    }
  }

  async function handleScheduleNotification() {
    // Se estivermos na web, não tente agendar notificações
    if (Platform.OS === 'web') {
      Alert.alert('Notificações', 'Notificações não são suportadas na web.');
      onClose();
      return;
    }
    try {
      switch (scheduleType) {
        case 'exact':
          await scheduleExactNotification(exactDate);
          break;
        case 'daily':
          await scheduleDailyNotification(dailyTime);
          break;
        case 'seconds':
          await scheduleSecondsNotification(parseInt(seconds, 10));
          break;
      }
      Alert.alert('Agendado', 'Notificação agendada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro no agendamento:', error);
      Alert.alert('Erro', 'Falha ao agendar a notificação.');
    }
  }

  // Agendamento para data exata
  async function scheduleExactNotification(date: Date) {
    if (date <= new Date()) {
      throw new Error('A data/hora escolhida já passou.');
    }
    console.log('Agendando notificação para:', date.toString());
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificação de Data Exata',
        body: `Dispara em ${date.toLocaleString()}`,
        sound: 'default',
      },
      trigger: {
        date,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  }

  // Agendamento diário
  async function scheduleDailyNotification(time: Date) {
    const hour = time.getHours();
    const minute = time.getMinutes();
    console.log(`Agendando notificação diária para: ${hour}:${minute}`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificação Diária',
        body: `Repetirá todo dia às ${formatHourMinute(hour, minute)}`,
        sound: 'default',
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  }

  // Agendamento para X segundos
  async function scheduleSecondsNotification(sec: number) {
    if (isNaN(sec) || sec < 1) {
      throw new Error('Número de segundos inválido');
    }
    console.log(`Agendando notificação para ${sec} segundo(s) no futuro`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notificação em segundos',
        body: `Disparará em ${sec} segundo(s)`,
        sound: 'default',
      },
      trigger: {
        seconds: sec,
        repeats: false,
        channelId: Platform.OS === 'android' ? 'default' : undefined,
      },
    });
  }

  function formatHourMinute(hour: number, minute: number) {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    return `${h}:${m}`;
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.container}>
        <View style={modalStyles.content}>
          <Text style={modalStyles.title}>Configurar Notificação</Text>
          <Text style={modalStyles.label}>Selecione o tipo de agendamento:</Text>
          <View style={modalStyles.row}>
            <Button
              title="Data Exata"
              onPress={() => setScheduleType('exact')}
              color={scheduleType === 'exact' ? '#007AFF' : '#666'}
            />
            <Button
              title="Diária"
              onPress={() => setScheduleType('daily')}
              color={scheduleType === 'daily' ? '#007AFF' : '#666'}
            />
            <Button
              title="Segundos"
              onPress={() => setScheduleType('seconds')}
              color={scheduleType === 'seconds' ? '#007AFF' : '#666'}
            />
          </View>
          {scheduleType === 'exact' && (
            <>
              <Text style={modalStyles.label}>Data/Hora exata:</Text>
              <DateTimePicker
                value={exactDate}
                mode="datetime"
                display="default"
                onChange={(_, selected) => {
                  if (selected) setExactDate(selected);
                }}
              />
            </>
          )}
          {scheduleType === 'daily' && (
            <>
              <Text style={modalStyles.label}>Hora/Minuto (todo dia):</Text>
              <DateTimePicker
                value={dailyTime}
                mode="time"
                display="default"
                onChange={(_, selected) => {
                  if (selected) setDailyTime(selected);
                }}
              />
            </>
          )}
          {scheduleType === 'seconds' && (
            <>
              <Text style={modalStyles.label}>Segundos no futuro:</Text>
              <TextInput
                style={modalStyles.input}
                keyboardType="numeric"
                value={seconds}
                onChangeText={setSeconds}
              />
            </>
          )}
          <View style={modalStyles.buttonRow}>
            <Button title="Agendar" onPress={handleScheduleNotification} />
            <Button title="Cancelar" onPress={onClose} color="#888" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    width: 100,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default NotificationModal;
