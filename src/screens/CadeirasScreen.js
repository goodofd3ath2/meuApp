import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';  // Importando useRouter para navegação

const CadeirasScreen = () => {
  const [cadeiras, setCadeiras] = useState([]);
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);      
  const router = useRouter();  // Usando o hook para navegação

  useEffect(() => {
    console.log('Iniciando requisição...');
    axios.get('192.168.95.190:5000/cadeiras')
      .then((response) => {
        console.log('Dados recebidos:', response.data);
        setCadeiras(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar as cadeiras:', error);
        setError('Não foi possível carregar as cadeiras');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cadeiras</Text>
      <FlatList
        data={cadeiras}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nome}</Text>
          </View>
        )}
      />
      <Button title="Voltar" onPress={() => router.back()} />  {/* Botão de Voltar */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default CadeirasScreen;
