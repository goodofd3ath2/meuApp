import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

const API_BASE = "http://192.168.95.190:5000";
const usuarioLogado = { id: 1, curso_id: 3 };

export default function AnotacoesScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [selectedCadeira, setSelectedCadeira] = useState<string>('Selecione uma cadeira');
  const [cadeiras, setCadeiras] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [editingAnnotation, setEditingAnnotation] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchCadeiras();
  }, []);

  const fetchCadeiras = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cadeiras?curso_id=${usuarioLogado.curso_id}`);
      if (response.ok) {
        const data = await response.json();
        setCadeiras(data);
      }
    } catch (error) {
      console.error('Erro ao buscar cadeiras:', error);
    }
  };

  const fetchAnnotations = async (date: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/descricoes?data=${date}&tipo=anotacao&user_id=${usuarioLogado.id}`);
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

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    fetchAnnotations(day.dateString);
  };

  const saveAnnotation = async () => {
    if (!selectedDate || selectedCadeira === 'Selecione uma cadeira' || !text) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }
    const payload = {
      cadeira: selectedCadeira,
      descricao: text,
      dataHora: selectedDate,
      tipo: "anotacao",
      user_id: usuarioLogado.id
    };

    try {
      let response;
      if (editingAnnotation) {
        response = await fetch(`${API_BASE}/api/descricoes/${editingAnnotation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/api/descricoes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (response.ok) {
        Alert.alert('Sucesso', 'Anotação salva.');
        fetchAnnotations(selectedDate);
        setText('');
        setEditingAnnotation(null);
      } else {
        Alert.alert('Erro', 'Erro ao salvar a anotação.');
      }
    } catch (error) {
      console.error('Erro ao salvar a anotação:', error);
      Alert.alert('Erro', 'Erro ao salvar a anotação.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.container}>
            <Text style={styles.title}>Anotações</Text>
            <Calendar
              minDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={{ [selectedDate]: { selected: true, selectedColor: '#007AFF' } }}
              style={styles.calendar}
            />
            <TextInput
              placeholder="Digite sua anotação..."
              value={text}
              onChangeText={setText}
              style={styles.input}
              multiline
            />
            
            {/* SELEÇÃO DE CADEIRA - MODAL */}
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.cadeiraSelector}>
              <Text style={styles.cadeiraText}>{selectedCadeira}</Text>
            </TouchableOpacity>

            <Button title="Salvar" onPress={saveAnnotation} color="#007AFF" />
            <Text style={styles.label}>Histórico do Dia</Text>
          </View>
        }
        data={annotations}
        keyExtractor={(item) => item.id?.toString() ?? ''}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemTitle}>{item.descricao}</Text>
            <Text style={styles.itemInfo}>{item.dataHora}</Text>
          </TouchableOpacity>
        )}
      />

      {/* MODAL PARA SELEÇÃO DE CADEIRAS */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione uma cadeira</Text>
            <FlatList
              data={cadeiras}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCadeira(item.nome);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Fechar" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#f7f7f7", padding: 20, paddingTop: 40 },
  title: { fontSize: 24, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  calendar: { marginBottom: 20 },
  input: { backgroundColor: "#fff", borderRadius: 10, padding: 15, height: 120, marginBottom: 15 },
  label: { fontSize: 16, fontWeight: "500", marginBottom: 10 },
  
  // ESTILOS DA SELEÇÃO DE CADEIRA
  cadeiraSelector: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center"
  },
  cadeiraText: { fontSize: 16, color: "#333" },

  item: { backgroundColor: "#fff", padding: 10, marginVertical: 5, borderRadius: 10 },
  itemTitle: { fontWeight: "600", fontSize: 16 },
  itemInfo: { fontSize: 14, color: "#666" },

  // ESTILOS DO MODAL
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  modalItemText: { fontSize: 16 },
});

