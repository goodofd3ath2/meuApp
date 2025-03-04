import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { requestNotificationPermissions, scheduleNotification } from '../_config/notifications';
import { CadeiraPicker, ICadeira } from '../components/CadeiraPicker';
import { API_CADEIRAS, API_DESCRICOES } from '../_config/config';

interface IAnotacao {
  id?: number;
  cadeira: string;
  descricao: string;
  dataHora: string;
  tipo: string;
  user_id: number;
}

const usuarioLogado = { id: 2, curso_id: 1 };

export default function AnotacoesScreen() {
  const [cadeiras, setCadeiras] = useState<ICadeira[]>([]);
  const [selectedCadeira, setSelectedCadeira] = useState<ICadeira | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [descricao, setDescricao] = useState('');
  const [historico, setHistorico] = useState<IAnotacao[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    requestNotificationPermissions().catch(() => {
      Alert.alert('Notificações', 'As notificações foram bloqueadas ou não permitidas.');
    });
  }, []);

  useEffect(() => {
    fetch(`${API_CADEIRAS}?curso_id=${usuarioLogado.curso_id}`)
      .then((res) => res.json())
      .then((data: ICadeira[]) => setCadeiras(data))
      .catch((err) => {
        console.error('Erro ao buscar cadeiras:', err);
        Alert.alert('Erro', 'Erro ao buscar cadeiras');
      });
  }, []);

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

    // Combina a data selecionada com a hora atual
    const now = new Date();
    const [year, month, day] = selectedDate.split('-').map(Number);
    const combinedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

    const novaAnotacao: IAnotacao = {
      cadeira: selectedCadeira.nome,
      descricao,
      dataHora: combinedDate.toISOString(),
      tipo: 'anotacao',
      user_id: usuarioLogado.id,
    };

    try {
      const response = await fetch(API_DESCRICOES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaAnotacao),
      });
      if (!response.ok) throw new Error('Erro ao salvar a anotação');
      Alert.alert('Sucesso', 'Anotação salva com sucesso!');
      setDescricao('');
      setHistorico((prev) => [...prev, novaAnotacao]);
      await scheduleNotification(selectedDate, `Lembrete: ${descricao}`);
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a anotação.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.headerContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#007AFF' },
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Digite sua anotação..."
            value={descricao}
            multiline
            onChangeText={(text) => setDescricao(text.replace(/\n/g, ' '))}
          />
          <Text style={styles.label}>Selecione a cadeira:</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setModalVisible(true)}>
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
          <TouchableOpacity style={styles.button} onPress={salvarAnotacao}>
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Anotações do dia {selectedDate || '...'}</Text>
        </View>
        <FlatList
          data={historico}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemCadeira}>{item.cadeira}</Text>
              <Text style={styles.itemDesc}>{item.descricao}</Text>
              <Text style={styles.itemDate}>{new Date(item.dataHora).toLocaleString()}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: { padding: 20, paddingTop: 40 },
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
