// App.tsx ou app/_layout.tsx (dependendo da sua estrutura)
import React from 'react';
import { AuthProvider } from '../src/AuthContext'; // ajuste o caminho conforme sua estrutura
import { Slot } from 'expo-router';

export default function App() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
