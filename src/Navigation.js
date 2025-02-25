import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import Index from './app/index';  // Tela de login
import Register from './app/Register';  // Tela de registro
import Cadeiras from './app/Cadeiras';  // Tela de cadeiras
import Anotacoes from './app/Anotacoes';  // Tela de anotações

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Função para configurar as abas
function TopTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Cadeiras"
      screenOptions={{
        tabBarStyle: { backgroundColor: '#f7f7f7' },  // Estilo de fundo das abas
        tabBarIndicatorStyle: { backgroundColor: '#007AFF' },  // Cor do indicador
        tabBarLabelStyle: { fontWeight: 'bold' },  // Texto das abas em negrito
      }}
    >
      <Tab.Screen name="Cadeiras" component={Cadeiras} />
      <Tab.Screen name="Anotacoes" component={Anotacoes} />
    </Tab.Navigator>
  );
}

// Função principal de navegação
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={Index} />
        <Stack.Screen name="Cadastro" component={Register} />
        
        {/* Após o login, vai para o TopTabNavigator */}
        <Stack.Screen name="Home" component={TopTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
