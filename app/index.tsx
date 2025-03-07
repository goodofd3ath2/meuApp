import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/authContext'; // ajuste o caminho conforme sua estrutura
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.95.190:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (response.ok) {
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        
        // Salva o user_id no AsyncStorage logo após login bem-sucedido
        // (Supondo que 'data.user' seja o objeto retornado com o ID do usuário)
        if (data.user && data.user.id) {
          await AsyncStorage.setItem('user_id', data.user.id.toString());
        }

        // Caso esteja usando um contexto de autenticação
        login(); 
        // Redireciona para a tela de anotações, cadeiras ou outra
        router.push('/tabs/cadeiras');
      } else {
        Alert.alert('Erro', data.message || 'Falha ao fazer login');
      }
    } catch (error) {
      console.error('Erro ao tentar login:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/226/226770.png' }} style={styles.image} />
      
      <TextInput 
        placeholder='Enter an email' 
        style={styles.input} 
        value={email} 
        onChangeText={setEmail} 
      />
      <TextInput 
        placeholder='Enter a password' 
        style={styles.input} 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      
      <TouchableOpacity style={styles.buttonPink} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Click Me</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  input: {
    width: 250,
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
  buttonPink: {
    backgroundColor: '#ff4081',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    color: '#0000EE',
    marginTop: 10,
    textDecorationLine: 'underline',
  }
});
