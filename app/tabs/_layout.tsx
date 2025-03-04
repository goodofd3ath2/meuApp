// _layout.tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="anotacoes" options={{ title: 'Anotações' }} />
      <Tabs.Screen name="cadeiras" options={{ title: 'Cadeiras' }} />
      <Tabs.Screen name="details" options={{ title: 'Detalhes' }} />
    </Tabs>
  );
}
