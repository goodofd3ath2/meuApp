import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      {/* Ícone do Android */}
      <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Android_logo_2019.png' }} 
        style={styles.logo} 
      />

      {/* Campos de Entrada */}
      <TextInput style={styles.input} placeholder="Enter an email" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Enter a number" keyboardType="numeric" />

      {/* Botões */}
      <TouchableOpacity style={[styles.button, { backgroundColor: 'pink' }]}>
        <Text style={styles.buttonText}>Button</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.link}>Click Me</Text>
      </TouchableOpacity>

      {/* Botões na parte inferior */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={[styles.smallButton, { backgroundColor: 'gold' }]}>
          <Text style={styles.buttonText}>Click Me</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.smallButton, { backgroundColor: 'orange' }]}>
          <Text style={styles.buttonText}>Click Me</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.smallButton, { backgroundColor: 'skyblue' }]}>
          <Text style={styles.buttonText}>Click Me</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder para Imagem */}
      <View style={styles.imagePlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    width: '80%',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    color: 'black',
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  smallButton: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;
