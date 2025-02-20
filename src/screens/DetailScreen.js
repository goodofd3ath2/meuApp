import React from 'react';
import { View, Text, Button } from 'react-native';

const DetailsScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Detalhes da cadeira</Text>
      <Button
        title="Ir para Cadeiras"
        onPress={() => navigation.navigate('Cadeiras')} // Navega para a tela de Cadeiras
      />
    </View>
  );
};

export default DetailsScreen;
