import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CadeiraPicker, ICadeira } from '../components/CadeiraPicker';
import { API_CADEIRAS, API_DESCRICOES } from '../_config/config';

interface IAnotacao {
  id?: number;
  cadeira: string;
  descricao: string;
  dataHora: string;
  tipo: string;
  user_id: number;
  isRecurring?: boolean;     
  notificationTime?: string; 
}

const usuarioLogado = { id: 2, curso_id: 1 };

export default function AnotacoesScreen() {
  const [cadeiras, setCadeiras] = useState<ICadeira[]>([]);
  const [selectedCadeira, setSelectedCadeira] = useState<ICadeira | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [descricao, setDescricao] = useState('');
  const [historico, setHistorico] = useState<IAnotacao[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Tempo e recorrência
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);

  // Carrega as cadeiras ao montar
  useEffect(() => {
    fetch(`${API_CADEIRAS}?curso_id=${usuarioLogado.curso_id}`)
      .then((res) => res.json())
      .then((data: ICadeira[]) => setCadeiras(data))
      .catch((err) => {
        console.error('Erro ao buscar cadeiras:', err);
        Alert.alert('Erro', 'Erro ao buscar cadeiras');
      });
  }, []);

  // Buscar histórico do dia selecionado
  async function fetchHistorico(date: string) {
    if (!date) return;
    try {
      const response = await fetch(`${API_DESCRICOES}?data=${date}&user_id=${usuarioLogado.id}`);
      if (!response.ok) throw new Error('Erro ao buscar anotações');
      const data: IAnotacao[] = await response.json();
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao buscar anotações:', error);
    }
  }

  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString);
    fetchHistorico(day.dateString);
  }

  function handleSelectCadeira(cadeira: ICadeira) {
    setSelectedCadeira(cadeira);
    setModalVisible(false);
  }

  // Quando muda o horário
  function onChangeTime(event: any, date?: Date) {
    if (date) {
      setSelectedTime(date);
    }
  }

  // Salvar no servidor
  async function salvarAnotacao() {
    if (!selectedDate) {
      Alert.alert('Atenção', 'Selecione uma data no calendário!');
      return;
    }
    if (!selectedCadeira) {
      Alert.alert('Atenção', 'Selecione uma cadeira!');
      return;
    }
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Digite alguma anotação!');
      return;
    }

    // Monta a data/hora
    const [year, month, day] = selectedDate.split('-').map(Number);
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    const combinedDate = new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0);

    const novaAnotacao: IAnotacao = {
      cadeira: selectedCadeira.nome,
      descricao,
      dataHora: combinedDate.toISOString(),
      tipo: 'anotacao',
      user_id: usuarioLogado.id,
      isRecurring,
      notificationTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    };

    try {
      const response = await fetch(API_DESCRICOES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaAnotacao),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Erro ao salvar anotação:', data);
        throw new Error(data.error || 'Erro ao salvar a anotação');
      }

      Alert.alert('Sucesso', 'Anotação salva com sucesso!');
      setDescricao('');
      setHistorico((prev) => [...prev, data]);

    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a anotação.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Calendário */}
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#007AFF' },
            }}
          />

          {/* Texto da anotação */}
          <TextInput
            style={styles.input}
            placeholder="Digite sua anotação..."
            value={descricao}
            multiline
            onChangeText={(text) => setDescricao(text.replace(/\n/g, ' '))}
          />

          {/* Título para o date-time picker */}
          <Text style={{ marginBottom: 10 }}>Selecione o horário:</Text>

          {/* iOS vs Android */}
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              onChange={onChangeTime}
              display="inline"      // iOS 14+
            />
          ) : (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              onChange={onChangeTime}
              display="spinner"     // Android
              is24Hour={true}
            />
          )}

          {/* Switch para recorrência */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ marginRight: 8 }}>É recorrente?</Text>
            <Switch value={isRecurring} onValueChange={setIsRecurring} />
          </View>

          {/* Escolha de cadeira */}
          <Text style={styles.label}>Selecione a cadeira:</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectedOptionText}>
              {selectedCadeira ? selectedCadeira.nome : 'Clique para escolher'}
            </Text>
          </TouchableOpacity>

          <CadeiraPicker
            visible={modalVisible}
            cadeiras={cadeiras}
            onSelect={handleSelectCadeira}
            onClose={() => setModalVisible(false)}
          />

          {/* Botão de salvar */}
          <TouchableOpacity style={styles.button} onPress={salvarAnotacao}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Anotações do dia {selectedDate || '...'}</Text>

          {/* Ajuste para a dataHora retornada pelo back-end */}
          {historico.map((item, index) => {
            // Se vier em formato "2025-03-10 14:00:00", substitui espaço por 'T'
            let dataValida = item.dataHora || ''; 
            if (dataValida.includes(' ')) {
              dataValida = dataValida.replace(' ', 'T'); 
              // Se precisar de UTC, acrescente 'Z': dataValida += 'Z'
            }
            const dataLocalString = new Date(dataValida).toLocaleString();

            return (
              <View key={index} style={styles.item}>
                <Text style={styles.itemCadeira}>{item.cadeira}</Text>
                <Text style={styles.itemDesc}>{item.descricao}</Text>
                <Text style={styles.itemDate}>{dataLocalString}</Text>
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 100,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  picker: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOptionText: { fontSize: 16, color: '#333' },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  item: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginVertical: 5 },
  itemCadeira: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemDesc: { fontSize: 14, color: '#333' },
  itemDate: { color: '#999', fontSize: 14, marginTop: 5 },
});
