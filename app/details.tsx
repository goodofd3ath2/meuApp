import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function DetailsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Tela de Detalhes</Text>
      <Button title="Voltar" onPress={() => router.back()} />
    </View>
  );
}
