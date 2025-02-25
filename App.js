import React from 'react';
import Navigation from './Navigation';  // Certifique-se de que o caminho está correto (dependendo da pasta)
import { SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation />
    </SafeAreaView>
  );
}
