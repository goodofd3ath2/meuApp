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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface IAnotacao {
  id?: number;
  cadeira: string;
  descricao: string;
  dataHora: string;
  data_hora?: string; // Permite que o backend retorne com esse nome
  tipo: string;
  user_id: number;
  isRecurring?: boolean;     
  notificationTime?: string; 
}

export default function AnotacoesScreen() {
  const router = useRouter();

  const [cadeiras, setCadeiras] = useState<ICadeira[]>([]);
  const [selectedCadeira, setSelectedCadeira] = useState<ICadeira | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [descricao, setDescricao] = useState('');
  const [historico, setHistorico] = useState<IAnotacao[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [cursoId, setCursoId] = useState<number | null>(null);

  // Tempo e recorrência
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);

  // Verifica se há user_id salvo, caso não exista, redireciona para login
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (!storedUserId) {
          console.error('Sem usuário logado ainda');
          router.push('/'); // Redireciona ao login (rota "/")
          return;
        }
        setUserId(parseInt(storedUserId, 10));
      } catch (error) {
        console.error('Erro ao checar login:', error);
      }
    };
    checkLoggedIn();
  }, [router]);

  // Carrega o cursoId do usuário
  useEffect(() => {
    if (!userId) return;

    const fetchCursoId = async () => {
      try {
        console.log('🔍 Buscando cursoId do usuário:', userId);
        const response = await fetch(`http://192.168.95.190:5000/api/usuarios?user_id=${userId}`);
        const data = await response.json();

        // Ex: se data = [ { id: 1, email: '...', curso_id: 2, ... } ]
        if (response.ok && Array.isArray(data) && data.length > 0) {
          setCursoId(data[0].curso_id);
        } else {
          console.error('🚨 Erro ao buscar curso_id:', data.error || data);
        }
      } catch (error) {
        console.error('🚨 Erro ao buscar curso_id:', error);
      }
    };
    fetchCursoId();
  }, [userId]);

  // Carrega as cadeiras do curso
  useEffect(() => {
    if (!cursoId) return;
    fetch(`${API_CADEIRAS}?curso_id=${cursoId}`)
      .then((res) => res.json())
      .then((data: ICadeira[]) => setCadeiras(data))
      .catch((err) => {
        console.error('Erro ao buscar cadeiras:', err);
        Alert.alert('Erro', 'Erro ao buscar cadeiras');
      });
  }, [cursoId]);

  // Carrega as anotações do dia selecionado
  useEffect(() => {
    if (!selectedDate || !userId) return;
    fetchHistorico(selectedDate);
  }, [selectedDate, userId]);

  async function fetchHistorico(date: string) {
    if (!date || !userId) return;
    try {
      const response = await fetch(`${API_DESCRICOES}?data=${date}&user_id=${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar anotações');
      const data: IAnotacao[] = await response.json();

      // Ajuste para manter "dataHora" sempre presente
      const anotacoes = data.map((item) => ({
        ...item,
        dataHora: item.data_hora || item.dataHora,
      }));

      setHistorico(anotacoes);
    } catch (error) {
      console.error('Erro ao buscar anotações:', error);
    }
  }

  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString);
    // Não precisa chamar fetchHistorico aqui de novo porque já está no useEffect
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

  // Salvar anotação
  async function salvarAnotacao() {
    if (!selectedDate || !selectedCadeira || !descricao.trim() || !userId) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    // Monta data/hora no formato ISO
    const [year, month, day] = selectedDate.split('-').map(Number);
    const hours = selectedTime.getHours();
    const minutes = selectedTime.getMinutes();
    const combinedDateUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));

    const novaAnotacao: IAnotacao = {
      cadeira: selectedCadeira.nome,
      descricao,
      dataHora: combinedDateUTC.toISOString(),
      tipo: 'anotacao',
      user_id: userId,
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
        throw new Error(data.error || 'Erro ao salvar a anotação');
      }

      Alert.alert('Sucesso', 'Anotação salva com sucesso!');
      setDescricao('');
      // Atualiza o histórico localmente
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
              display="inline"
            />
          ) : (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              onChange={onChangeTime}
              display="spinner"
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

          {historico.map((item, index) => {
            console.log('📢 Debug: Item recebido do backend:', JSON.stringify(item, null, 2));

            // dataValida pode estar em item.dataHora ou item.data_hora
            const dataValida = item.dataHora || item.data_hora || undefined;
            if (!dataValida) {
              console.warn('⚠️ Data não disponível para:', item);
              return (
                <View key={index} style={styles.item}>
                  <Text style={styles.itemCadeira}>{item.cadeira}</Text>
                  <Text style={styles.itemDesc}>{item.descricao}</Text>
                  <Text style={styles.itemDate}>Erro: Data não disponível</Text>
                </View>
              );
            }

            try {
              // Date a partir da string
              const dataObjeto = new Date(dataValida);
              // Exibe no formato local
              const dataFormatada = dataObjeto.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <View key={index} style={styles.item}>
                  <Text style={styles.itemCadeira}>{item.cadeira}</Text>
                  <Text style={styles.itemDesc}>{item.descricao}</Text>
                  <Text style={styles.itemDate}>{dataFormatada}</Text>
                </View>
              );
            } catch (error) {
              console.error('🚨 Erro ao processar data:', error);
              return (
                <View key={index} style={styles.item}>
                  <Text style={styles.itemCadeira}>{item.cadeira}</Text>
                  <Text style={styles.itemDesc}>{item.descricao}</Text>
                  <Text style={styles.itemDate}>Erro: Data inválida</Text>
                </View>
              );
            }
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  itemCadeira: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 14,
    color: '#333',
  },
  itemDate: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
});
