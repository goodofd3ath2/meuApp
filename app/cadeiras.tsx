import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function CadeirasScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Tela de Cadeiras</Text>
      {/* Aqui você pode fazer a lista de cadeiras ou outras informações */}
      <Button title="Voltar" onPress={() => router.back()} />
    </View>
  );
}
