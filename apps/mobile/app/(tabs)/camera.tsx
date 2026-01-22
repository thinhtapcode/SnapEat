import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function Camera() {
  const handleTakePhoto = () => {
    Alert.alert('Camera', 'Camera functionality will be implemented with expo-camera');
  };

  const handlePickImage = () => {
    Alert.alert('Gallery', 'Image picker functionality will be implemented');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Food</Text>
      <Text style={styles.subtitle}>Take a photo or select from gallery</Text>

      <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handlePickImage}>
        <Text style={styles.buttonText}>Choose from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
