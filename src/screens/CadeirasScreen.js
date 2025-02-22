import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Picker, StyleSheet } from "react-native";

const CadeirasScreen = () => {
  const [cadeiras, setCadeiras] = useState([]); // Lista de cadeiras do banco
  const [selectedCadeira, setSelectedCadeira] = useState(""); // Cadeira selecionada
  const [descricao, setDescricao] = useState(""); // Descrição digitada

  useEffect(() => {
    // Busca as cadeiras no backend
    fetch("http://localhost:5000/api/cadeiras")
      .then((res) => res.json())
      .then((data) => setCadeiras(data))
      .catch((err) => console.error("Erro ao buscar cadeiras:", err));
  }, []);

  const salvarCadeira = () => {
    const novaCadeira = {
      cadeira: selectedCadeira,
      descricao: descricao,
      dataHora: new Date().toISOString(),
    };

    fetch("http://localhost:5000/api/cadeiras", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(novaCadeira),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Cadeira salva com sucesso!");
        setDescricao(""); // Limpa o campo de descrição
      })
      .catch((err) => console.error("Erro ao salvar cadeira:", err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen 2</Text>
      <View style={styles.row}>
        <Text style={styles.androidIcon}>🤖</Text>
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
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter a value"
        value={descricao}
        onChangeText={setDescricao}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.pinkButton]} onPress={salvarCadeira}>
          <Text style={styles.buttonText}>Button</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.blueButton]}>
          <Text style={styles.buttonText}>Button</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.grayButton]}>
          <Text style={styles.buttonText}>Button</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#aaa",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  androidIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  input: {
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: 100,
    alignItems: "center",
  },
  pinkButton: {
    backgroundColor: "#ff4081",
  },
  blueButton: {
    backgroundColor: "#3f51b5",
  },
  grayButton: {
    backgroundColor: "#d6d6d6",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CadeirasScreen;
