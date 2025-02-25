import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  FlatList,
  StyleSheet
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import * as Notifications from 'expo-notifications';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Annotation = {
  id: number;
  cadeira: string;
  descricao: string;
  dataHora: string; // armazenado em formato ISO no banco
  tipo?: string; // opcional: "notificacao" ou "descricao"
};

const API_BASE = "http://192.168.95.190:5000";

export default function AnotacoesScreen() {
  // Dados da anotação
  const [selectedDate, setSelectedDate] = useState<string>('');   // Ex.: "2025-02-27"
  const [text, setText] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [selectedCadeira, setSelectedCadeira] = useState<string>('');
  const [cadeiras, setCadeiras] = useState<Array<{ id: number; nome: string }>>([]);

  // Histórico do dia
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Notificação e modal
  const [notificationType, setNotificationType] = useState<'daily' | 'once' | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [notifModalVisible, setNotifModalVisible] = useState<boolean>(false);

  // Controle de edição
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);

  useEffect(() => {
    async function getPermission() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Ative as notificações nas configurações do celular.');
      }
    }
    getPermission();
    fetchCadeiras();
  }, []);

  // Busca cadeiras para o Picker
  const fetchCadeiras = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cadeiras`);
      if (response.ok) {
        const data = await response.json();
        setCadeiras(data);
        if (data.length > 0 && !selectedCadeira) setSelectedCadeira(data[0].nome);
      } else {
        console.error('Erro ao buscar cadeiras');
      }
    } catch (error) {
      console.error('Erro ao buscar cadeiras:', error);
    }
  };

  // Busca as anotações do dia via parâmetro "data"
  const fetchAnnotations = async (date: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/descricoes?data=${date}`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data);
      } else {
        setAnnotations([]);
      }
    } catch (error) {
      console.error('Erro ao buscar anotações:', error);
    }
  };

  // Ao clicar em um dia no calendário, define a data e busca o histórico
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);  // Ex.: "2025-02-27"
    fetchAnnotations(day.dateString);
  };

  // Abre o modal para definir notificação
  const openNotifModal = () => {
    setNotifModalVisible(true);
  };

  // Seleção do tipo de notificação
  const handleNotificationSelection = (type: 'daily' | 'once') => {
    setNotificationType(type);
    if (type === 'once') {
      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: selectedTime,
          onChange: handleTimeSelection,
          mode: 'time',
        });
        setNotifModalVisible(false);
      } else if (Platform.OS !== 'web') {
        setShowTimePicker(true);
      } else {
        setNotifModalVisible(false);
      }
    } else {
      setNotifModalVisible(false);
    }
  };

  const handleTimeSelection = (_event: any, selected?: Date) => {
    if (selected) {
      setSelectedTime(selected);
    }
    setShowTimePicker(false);
    setNotifModalVisible(false);
  };

  // Calcula os segundos até o próximo horário alvo
  const getSecondsUntilNextTrigger = (targetHour: number, targetMinute: number): number => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(targetHour, targetMinute, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    return Math.ceil((target.getTime() - now.getTime()) / 1000);
  };

  // Agenda a notificação conforme o tipo escolhido
  const scheduleNotification = async () => {
    if (Platform.OS === 'web') {
      console.warn('Notificações não são suportadas na web.');
      return;
    }
    if (notificationType === 'daily') {
      const secondsUntilTrigger = getSecondsUntilNextTrigger(
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete',
          body: text || 'Você tem uma anotação!',
        },
        trigger: {
          seconds: secondsUntilTrigger,
          repeats: true,
        },
      });
    } else if (notificationType === 'once') {
      const dateTimeObj = new Date(selectedDate); // ex.: new Date("2025-02-27")
      dateTimeObj.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      const seconds = Math.max(Math.ceil((dateTimeObj.getTime() - Date.now()) / 1000), 1);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lembrete',
          body: text || 'Você tem uma anotação!',
        },
        trigger: {
          seconds,
          repeats: false,
        },
      });
    }
  };

  // Função para salvar ou atualizar a anotação
  const saveAnnotation = async () => {
    // Verifica se um dia foi selecionado
    if (!selectedDate) {
      Alert.alert("Atenção", "Selecione um dia no calendário antes de salvar a anotação.");
      return;
    }
    if (!selectedCadeira || !text) {
      Alert.alert("Atenção", "Selecione uma cadeira e digite uma descrição!");
      return;
    }

    // Se o usuário definiu notificação, agenda-a
    if (notificationType) {
      try {
        await scheduleNotification();
      } catch (error) {
        console.error('Erro ao agendar notificação:', error);
      }
    }
    // Cria um objeto Date usando selectedDate e selectedTime
    const dateTimeObj = new Date(selectedDate); 
    dateTimeObj.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    const dateTimeISO = dateTimeObj.toISOString(); // Ex.: "2025-02-27T13:00:00.000Z"

    // Inclui um campo "tipo" para diferenciar notificações de descrições comuns
    const payload = {
      cadeira: selectedCadeira,
      descricao: text,
      dataHora: dateTimeISO,
      tipo: notificationType ? "notificacao" : "descricao"
    };

    console.log("Payload:", payload);
    try {
      let response;
      if (editingAnnotation) {
        response = await fetch(`${API_BASE}/api/descricoes/${editingAnnotation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE}/api/descricoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      console.log("Response status:", response.status);
      if (response.ok) {
        Alert.alert('Sucesso', editingAnnotation ? 'Anotação atualizada.' : 'Anotação salva com sucesso.');
        fetchAnnotations(selectedDate);
        // Limpa o formulário
        setText('');
        setNotificationType(null);
        setEditingAnnotation(null);
      } else {
        const errorText = await response.text();
        Alert.alert('Erro', 'Erro ao salvar a anotação: ' + errorText);
      }
    } catch (error) {
      console.error('Erro ao salvar a anotação:', error);
      Alert.alert('Erro', 'Erro ao salvar a anotação.');
    }
  };

  // Carrega a anotação para edição ao tocar no item da lista
  const handleEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setText(annotation.descricao);
    if (!annotation.dataHora) {
      console.warn('Anotação sem dataHora, não é possível editar data/hora.');
      return;
    }
    // Extrai somente a data da string ISO (YYYY-MM-DD)
    const isoDate = annotation.dataHora.split('T')[0];
    setSelectedDate(isoDate);
    // Ajusta o horário usando a data completa
    setSelectedTime(new Date(annotation.dataHora));
    setSelectedCadeira(annotation.cadeira);
  };

  // Exclui uma anotação via DELETE
  const deleteAnnotation = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/descricoes/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Alert.alert('Sucesso', 'Anotação excluída.');
        fetchAnnotations(selectedDate);
      } else {
        Alert.alert('Erro', 'Erro ao excluir a anotação.');
      }
    } catch (error) {
      console.error('Erro ao excluir a anotação:', error);
      Alert.alert('Erro', 'Erro ao excluir a anotação.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anotações</Text>
      <Calendar
        minDate={new Date().toISOString().split('T')[0]}
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#007AFF' },
        }}
        style={styles.calendar}
      />
      <TextInput
        placeholder="Digite sua anotação..."
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
      />
      <Text style={styles.label}>Selecione a cadeira:</Text>
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedCadeira}
          onValueChange={(itemValue) => setSelectedCadeira(itemValue)}
          style={styles.pickerInner}
        >
          {cadeiras.map((c) => (
            <Picker.Item key={c.id} label={c.nome} value={c.nome} />
          ))}
        </Picker>
      </View>
      <View style={styles.buttonRow}>
        <Button title="Definir Notificação" onPress={() => openNotifModal()} color="#007AFF" />
        <Button title={editingAnnotation ? "Atualizar" : "Salvar"} onPress={saveAnnotation} color="#007AFF" />
      </View>
      <Text style={styles.label}>Histórico do Dia</Text>
      <FlatList
        data={annotations}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleEditAnnotation(item)}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.descricao}</Text>
              <Text style={styles.itemInfo}>
                {item.dataHora} {item.tipo === "notificacao" ? "(Notificação)" : ""}
              </Text>
              <Text style={styles.itemInfo}>Cadeira: {item.cadeira}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteAnnotation(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Modal para escolha do tipo de notificação */}
      <Modal visible={notifModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha o tipo de notificação:</Text>
            <TouchableOpacity onPress={() => handleNotificationSelection('daily')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>🔁 Repetir diariamente</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNotificationSelection('once')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>📅 Notificar apenas neste dia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNotificationType(null);
                setNotifModalVisible(false);
              }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>🚫 Não notificar</Text>
            </TouchableOpacity>
            <Button title="Fechar" onPress={() => setNotifModalVisible(false)} color="#007AFF" />
          </View>
        </View>
      </Modal>

      {Platform.OS !== 'android' && Platform.OS !== 'web' && showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeSelection}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 20, paddingTop: 40 },
  title: { fontSize: 24, color: '#333', marginBottom: 20, fontWeight: '600', textAlign: 'center' },
  calendar: { marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    marginBottom: 15,
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: { fontSize: 16, fontWeight: '500', color: '#555', marginBottom: 10 },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Platform.OS === 'ios' ? '#007AFF' : '#000',
    justifyContent: 'center',
  },
  pickerInner: { height: 50 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    alignItems: 'center',
  },
  itemContent: { flex: 1 },
  itemTitle: { fontWeight: '600', fontSize: 16, color: '#333', marginBottom: 5 },
  itemInfo: { fontSize: 14, color: '#666' },
  deleteButton: { padding: 5, backgroundColor: '#FF3B30', borderRadius: 5 },
  deleteButtonText: { color: '#fff', fontSize: 12 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  modalButton: { marginVertical: 5 },
  modalButtonText: { fontSize: 16, color: '#007AFF' },
});

export default AnotacoesScreen;
