import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  FlatList 
} from 'react-native';

// Dependências do calendário e notificações
import { Calendar, DateData } from 'react-native-calendars';
import { requestNotificationPermissions, scheduleNotification } from '../_config/notifications';

// Se você já tiver um componente de picker, importe aqui. Exemplo:
import { CadeiraPicker, ICadeira } from '../components/CadeiraPicker';

// URLs (ajuste conforme seu projeto)
import { API_CADEIRAS, API_DESCRICOES } from '../_config/config';

interface IAnotacao {
  id?: number;
  cadeira: string; 
  descricao: string;
  dataHora: string;
  tipo: string;
  user_id: number;
}

// Simulação de usuário logado
const usuarioLogado = { id: 2, curso_id: 1 };

export default function AnotacoesScreen() {
  const [cadeiras, setCadeiras] = useState<ICadeira[]>([]);
  const [selectedCadeira, setSelectedCadeira] = useState<ICadeira | null>(null);

  // Data selecionada no calendário (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Texto da anotação
  const [descricao, setDescricao] = useState('');

  // Histórico de anotações filtradas
  const [historico, setHistorico] = useState<IAnotacao[]>([]);

  // Controle do modal de cadeiras
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Pede permissão de notificações ao montar a tela
    requestNotificationPermissions()
      .catch(() => {
        Alert.alert('Notificações', 'As notificações foram bloqueadas ou não permitidas.');
      });
  }, []);

  useEffect(() => {
    // Carrega as cadeiras do curso do usuário
    fetch(`${API_CADEIRAS}?curso_id=${usuarioLogado.curso_id}`)
      .then(res => res.json())
      .then((data: ICadeira[]) => setCadeiras(data))
      .catch(err => {
        console.error('Erro ao buscar cadeiras:', err);
        Alert.alert('Erro', 'Erro ao buscar cadeiras');
      });
  }, []);

  // Função para buscar as anotações filtradas pela data e user_id
  async function fetchHistorico(date: string) {
    if (!date) return;
    try {
      // Exemplo: backend filtra por data (YYYY-MM-DD) e user_id
      const response = await fetch(`${API_DESCRICOES}?data=${date}&user_id=${usuarioLogado.id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar anotações');
      }
      const data: IAnotacao[] = await response.json();
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao buscar anotações:', error);
    }
  }

  // Quando o usuário seleciona uma data no calendário, armazenamos e filtramos
  function handleDayPress(day: DateData) {
    setSelectedDate(day.dateString); 
    // Ex: "2025-03-10"
    fetchHistorico(day.dateString);
  }

  // Quando o usuário seleciona a cadeira no modal
  function handleSelectCadeira(cadeira: ICadeira) {
    setSelectedCadeira(cadeira);
    setModalVisible(false);
  }

  // Salvar nova anotação
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

    // Monta o objeto para envio ao back-end
    const novaAnotacao: IAnotacao = {
      cadeira: selectedCadeira.nome, 
      descricao,
      dataHora: new Date(selectedDate).toISOString(), 
      tipo: 'anotacao', // ou "cadeira", dependendo da lógica
      user_id: usuarioLogado.id,
    };

    try {
      const response = await fetch(API_DESCRICOES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaAnotacao),
      });
      if (!response.ok) {
        throw new Error('Erro ao salvar a anotação');
      }

      // Sucesso no salvamento
      Alert.alert('Sucesso', 'Anotação salva com sucesso!');
      // Limpa o campo de texto
      setDescricao('');

      // Atualiza o histórico local sem precisar chamar o back-end novamente
      setHistorico((prev) => [...prev, novaAnotacao]);

      // Agenda uma notificação para o dia selecionado (às 09:00 no exemplo)
      await scheduleNotification(selectedDate, `Lembrete: ${descricao}`);

    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a anotação.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anotações</Text>

      {/* CALENDÁRIO */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#007AFF' }
        }}
        // Exemplo de props extras:
        // minDate={new Date().toISOString().split('T')[0]} // para não permitir datas passadas
      />

      {/* CAMPO DE TEXTO PARA ANOTAÇÃO */}
      <TextInput
        style={styles.input}
        placeholder="Digite sua anotação..."
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      {/* SELEÇÃO DE CADEIRA */}
      <Text style={styles.label}>Selecione a cadeira:</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setModalVisible(true)}>
        <Text style={styles.selectedOptionText}>
          {selectedCadeira ? selectedCadeira.nome : 'Clique para escolher'}
        </Text>
      </TouchableOpacity>

      {/* MODAL DE CADEIRAS */}
      <CadeiraPicker
        visible={modalVisible}
        cadeiras={cadeiras}
        onSelect={handleSelectCadeira}
        onClose={() => setModalVisible(false)}
      />

      {/* BOTÃO PARA SALVAR A ANOTAÇÃO */}
      <TouchableOpacity style={styles.button} onPress={salvarAnotacao}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

      {/* LISTA DE ANOTAÇÕES (FILTRADAS PELA DATA ESCOLHIDA) */}
      <Text style={styles.label}>Anotações do dia {selectedDate || '...'}</Text>
      <FlatList
        data={historico}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemCadeira}>{item.cadeira}</Text>
            <Text style={styles.itemDesc}>{item.descricao}</Text>
          </View>
        )}
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7f7', 
    padding: 20, 
    paddingTop: 40 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '600', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  input: {
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  picker: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#333'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 18 
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  itemCadeira: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  itemDesc: {
    fontSize: 14,
    color: '#333'
  }
});
