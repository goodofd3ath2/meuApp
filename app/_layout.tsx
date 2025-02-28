import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../authContext'; // Exemplo de contexto

export default function RootLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      // se não logado, manda para /index
      router.replace('/');
    } else {
      // se logado, manda para / (tabs)
      router.replace('/tabs/anotacoes');
    }
  }, [isAuthenticated]);

  return <Slot />;
}
