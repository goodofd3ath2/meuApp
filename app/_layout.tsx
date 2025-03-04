// app/_layout.tsx
import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../src/authContext'; // ajuste o caminho conforme sua estrutura

export default function RootLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/tabs/anotacoes'); // Se autenticado, vai para as abas
    }
    // Se não estiver autenticado, não faz redirecionamento
    // Assim, a tela padrão (index.tsx, login) é exibida
  }, [isAuthenticated]);

  return <Slot />;
}
