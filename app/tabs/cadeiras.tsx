import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { CadeiraPicker, ICadeira } from '../components/CadeiraPicker';
import { API_CADEIRAS, API_DESCRICOES } from '../_config/config';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export interface IAnotacao {
  id?: number;
  cadeira: string;
  descricao: string;
  dataHora: string;
  tipo: string;
  user_id: number;
}

const usuarioLogado = { id: 1, curso_id: 1 };

export default function CadeirasScreen() {
  const [cadeiras, setCadeiras] = useState<ICadeira[]>([]);
  const [selectedCadeira, setSelectedCadeira] = useState<ICadeira | null>(null);
  const [descricao, setDescricao] = useState('');
  const [historico, setHistorico] = useState<IAnotacao[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingDescricao, setLoadingDescricao] = useState(false);

  useEffect(() => {
    fetch(`${API_CADEIRAS}?curso_id=${usuarioLogado.curso_id}`)
      .then((res) => res.json())
      .then((data: ICadeira[]) => setCadeiras(data))
      .catch((err) => {
        console.error('Erro ao buscar cadeiras:', err);
        Alert.alert('Erro', 'Erro ao buscar cadeiras');
      });
  }, []);

  async function fetchHistorico(cadeira: ICadeira) {
    try {
      const response = await fetch(
        `${API_DESCRICOES}?cadeira=${encodeURIComponent(cadeira.nome)}&tipo=cadeira&user_id=${usuarioLogado.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setHistorico(data);
      } else {
        throw new Error('Erro ao buscar descrições');
      }
    } catch (error) {
      console.error('Erro ao buscar descrições:', error);
    }
  }

  const salvarDescricao = async () => {
    if (!selectedCadeira || !descricao) {
      Alert.alert('Atenção', 'Selecione uma cadeira e digite uma descrição!');
      return;
    }

    const novaDescricao: IAnotacao = {
      cadeira: selectedCadeira.nome,
      descricao,
      dataHora: new Date().toISOString(),
      tipo: 'cadeira',
      user_id: usuarioLogado.id,
    };

    setLoadingDescricao(true);
    try {
      const response = await fetch(API_DESCRICOES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaDescricao),
      });
      if (!response.ok) throw new Error('Erro ao salvar a descrição.');
      Alert.alert('Sucesso', 'Descrição salva!');
      setDescricao('');
      setHistorico((prev) => [...prev, novaDescricao]);
    } catch (error) {
      console.error('Erro ao salvar descrição:', error);
      Alert.alert('Erro', 'Não foi possível salvar a descrição.');
    } finally {
      setLoadingDescricao(false);
    }
  };

  const handleSelectCadeira = (cadeira: ICadeira) => {
    setSelectedCadeira(cadeira);
    setModalVisible(false);
    fetchHistorico(cadeira);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f58529', '#dd2a7b', '#8134af']} style={styles.header}>
        <Text style={styles.title}>Conteúdo das Cadeiras</Text>
      </LinearGradient>

      <Text style={styles.label}>Selecione uma Cadeira:</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedOptionText}>
          {selectedCadeira ? selectedCadeira.nome : 'Selecione uma opção'}
        </Text>
      </TouchableOpacity>

      <CadeiraPicker
        visible={modalVisible}
        cadeiras={cadeiras}
        onSelect={handleSelectCadeira}
        onClose={() => setModalVisible(false)}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite uma descrição..."
        value={descricao}
        onChangeText={setDescricao}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={salvarDescricao}
        disabled={loadingDescricao}
      >
        <Feather name="save" size={20} color="#fff" />
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Histórico de Conteúdo:</Text>
      <FlatList
        data={historico}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.descricao}</Text>
            <Text style={styles.itemDate}>{item.dataHora}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: { fontSize: 24, fontWeight: '600', color: '#fff' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 10 },
  picker: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOptionText: { fontSize: 16, color: '#333' },
  input: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#ff4081',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 18, marginLeft: 10 },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  itemText: { fontSize: 16 },
  itemDate: { color: '#999', fontSize: 14, marginTop: 5 },
});
