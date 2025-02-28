import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [curso, setCurso] = useState('');
  const [cursos, setCursos] = useState<Array<{ id: number; nome: string }>>([]);

  useEffect(() => {
    async function fetchCursos() {
      try {
        const response = await fetch('http://192.168.95.190:5000/api/cursos');
        if (response.ok) {
          const data = await response.json();
          setCursos(data);
          if (data.length > 0) setCurso(data[0].nome);
        } else {
          console.error('Erro ao buscar cursos');
        }
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
      }
    }
    fetchCursos();
  }, []);

  const handleRegister = async () => {
    if (!email || !password || !curso) {
      Alert.alert('Atenção', 'Preencha email, senha e selecione um curso!');
      return;
    }
    try {
      const response = await fetch('http://192.168.95.190:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, curso })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
        router.push('/'); // redireciona para a tela de login
      } else {
        Alert.alert('Erro', data.message || 'Falha ao criar conta');
      }
    } catch (error) {
      console.error('Erro ao tentar registrar:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput 
        placeholder='Digite seu email' 
        style={styles.input} 
        value={email} 
        onChangeText={setEmail} 
      />
      <TextInput 
        placeholder='Digite sua senha' 
        style={styles.input} 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      <Text style={styles.label}>Selecione seu Curso:</Text>
      <Picker
        selectedValue={curso}
        onValueChange={(itemValue) => setCurso(itemValue)}
        style={styles.picker}
      >
        {cursos.map((item) => (
          <Picker.Item key={item.id} label={item.nome} value={item.nome} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    width: 250,
    height: 40,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
