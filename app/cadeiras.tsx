import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker"; 

const API_URL = "http://192.168.95.190:5000/api/cadeiras"; // 🔹 Altere para o IP da sua máquina
const DESCRICOES_URL = "http://192.168.95.190:5000/api/descricoes"; // 🔹 Rota para buscar descrições salvas

const CadeirasScreen: React.FC = () => {
  const [cadeiras, setCadeiras] = useState<{ id: number; nome: string }[]>([]);
  const [selectedCadeira, setSelectedCadeira] = useState("");
  const [descricao, setDescricao] = useState("");
  const [historico, setHistorico] = useState<{ id?: number; cadeira: string; descricao: string; dataHora?: string }[]>([]);

  // 🔹 Busca as cadeiras do banco
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Dados recebidos:", data); // 🔍 Verifica os dados
        setCadeiras(data); // ✅ Atualiza o estado corretamente
      })
      .catch((err) => {
        console.error("Erro ao buscar cadeiras:", err);
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
  const salvarDescricao = async () => {
    if (!selectedCadeira || !descricao) {
      Alert.alert("Atenção", "Selecione uma cadeira e digite uma descrição!");
      return;
    }

    const novaDescricao = {
      cadeira: selectedCadeira,
      descricao,
      dataHora: new Date().toISOString(),
    };

    try {
      const response = await fetch(DESCRICOES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaDescricao),
      });

      if (!response.ok) throw new Error("Erro ao salvar a descrição.");

      Alert.alert("Sucesso", "Descrição salva!");
      setDescricao("");
      setHistorico([...historico, novaDescricao]); // Atualiza a lista localmente
    } catch (error) {
      console.error("Erro ao salvar descrição:", error);
      Alert.alert("Erro", "Não foi possível salvar a descrição.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Conteúdo</Text>

      <Text style={styles.label}>Selecione uma Cadeira:</Text>
      <Picker
        selectedValue={selectedCadeira}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCadeira(itemValue)}
      >
        <Picker.Item label="Selecione uma opção" value="" />
        {cadeiras.map((item) => (
          <Picker.Item key={item.id} label={item.nome} value={item.nome} />
        ))}
      </Picker>

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
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
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
  container: { flex: 1, backgroundColor: "#f4f4f4", padding: 20 },
  title: { fontSize: 22, color: "#333", marginBottom: 15, fontWeight: "bold" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  picker: { height: 50, backgroundColor: "#fff", borderRadius: 5, marginBottom: 10 },
  input: { height: 100, backgroundColor: "#fff", borderRadius: 5, padding: 10, textAlignVertical: "top", marginBottom: 10 },
  button: { backgroundColor: "#3f51b5", padding: 12, borderRadius: 5, alignItems: "center", marginBottom: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  item: { padding: 10, backgroundColor: "#fff", borderRadius: 5, marginVertical: 5 },
  itemText: { color: "#333" },
});

export default CadeirasScreen;
