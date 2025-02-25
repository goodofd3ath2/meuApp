import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, Modal, TouchableHighlight, Platform } from "react-native";

const API_URL = "http://192.168.95.190:5000/api/cadeiras"; // 🔹 Altere para o IP da sua máquina
const DESCRICOES_URL = "http://192.168.95.190:5000/api/descricoes"; // 🔹 Rota para buscar descrições salvas

const CadeirasScreen: React.FC = () => {
  const [cadeiras, setCadeiras] = useState<{ id: number; nome: string }[]>([]);
  const [selectedCadeira, setSelectedCadeira] = useState("");
  const [descricao, setDescricao] = useState("");
  const [historico, setHistorico] = useState<{ id?: number; cadeira: string; descricao: string; dataHora?: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // 🔹 Busca as cadeiras do banco
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("📥 Dados recebidos:", data); // Debugando os dados
        setCadeiras(data);
      })
      .catch((err) => {
        console.error("❌ Erro ao buscar cadeiras:", err);
        Alert.alert("Erro", "Erro ao buscar cadeiras");
      });
  }, []);

  // 🔹 Busca as descrições associadas à cadeira selecionada
  useEffect(() => {
    if (selectedCadeira) {
      fetch(`${DESCRICOES_URL}?cadeira=${selectedCadeira}`)
        .then((res) => res.json())
        .then((data) => setHistorico(data))
        .catch((err) => console.error("Erro ao buscar descrições:", err));
    }
  }, [selectedCadeira]);

  // 🔹 Salva a nova descrição no banco
  const [loadingDescricao, setLoadingDescricao] = useState(false);

  const salvarDescricao = async () => {
    console.log("Selected cadeira:", selectedCadeira); // Debugging
    console.log("Descricao:", descricao); // Debugging
    if (!selectedCadeira || !descricao) {
      Alert.alert("Atenção", "Selecione uma cadeira e digite uma descrição!");
      return;
    }

    const novaDescricao = {
      cadeira: selectedCadeira,
      descricao,
      dataHora: new Date().toISOString(),
    };

    setLoadingDescricao(true);

    try {
      const response = await fetch(DESCRICOES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaDescricao),
      });

      if (!response.ok) throw new Error("Erro ao salvar a descrição.");

      Alert.alert("Sucesso", "Descrição salva!");
      setDescricao("");
      setHistorico((prevHistorico) => [...prevHistorico, novaDescricao]); // Atualiza a lista localmente
    } catch (error) {
      console.error("Erro ao salvar descrição:", error);
      Alert.alert("Erro", "Não foi possível salvar a descrição.");
    } finally {
      setLoadingDescricao(false);
    }
  };

  // Abre o modal para seleção da cadeira
  const abrirModal = () => {
    setModalVisible(true);
  };

  // Fecha o modal
  const fecharModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Conteúdo</Text>

      <Text style={styles.label}>Selecione uma Cadeira:</Text>

      <TouchableOpacity style={styles.picker} onPress={abrirModal}>
        <Text style={styles.selectedOptionText}>{selectedCadeira || "Selecione uma opção"}</Text>
      </TouchableOpacity>

      {/* Modal para seleção de cadeira */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={fecharModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha uma Cadeira</Text>
            <FlatList
              data={cadeiras}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableHighlight
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCadeira(item.nome);
                    fecharModal();
                  }}
                >
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </TouchableHighlight>
              )}
            />
            <TouchableOpacity onPress={fecharModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.input}
        placeholder="Digite uma descrição..."
        value={descricao}
        onChangeText={setDescricao}
      />

      <TouchableOpacity style={styles.button} onPress={salvarDescricao}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Histórico de Conteúdo:</Text>
      <FlatList
        data={historico}
        keyExtractor={(item) => item.id ? item.id.toString() : item.descricao.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.descricao}</Text>
          </View>
        )}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", padding: 20, paddingTop: 40 },
  title: { fontSize: 24, color: "#333", marginBottom: 20, fontWeight: "600" },
  label: { fontSize: 16, fontWeight: "500", color: "#555", marginBottom: 10 },
  picker: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Platform.OS === "ios" ? "#007AFF" : "#000", // Azul claro no iOS
    justifyContent: "center",
    paddingLeft: 10,
    padding: 10,
  },
  selectedOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Background semi-transparente
  },

  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  input: {
    height: 120,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    textAlignVertical: "top",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },

  itemText: {
    color: "#333",
    fontSize: 16,
  },
});

export default CadeirasScreen;
