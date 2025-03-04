// app/tabs/details.tsx
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, Button } from 'react-native';
import { useAuth } from '../../src/authContext'; // ajuste o caminho
import { useRouter } from 'expo-router';

export default function DetailsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/'); // Redireciona para a tela de login após logout
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Perfil do Usuário</Text>
        <Text style={styles.info}>Bem-vindo, Fulano de Tal!</Text>
        <Button title="Sair" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20, color: '#333' },
  info: { fontSize: 16, color: '#666' },
});
