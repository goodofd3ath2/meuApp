import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Tela Inicial</Text>
      <Button title="Ir para Detalhes" onPress={() => router.push('/details')} />
      <Button title="Ir para Cadeiras" onPress={() => router.push('/cadeiras')} />

    </View>
  );
}
