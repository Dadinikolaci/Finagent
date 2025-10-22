import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = '@openai_api_key';

const SettingsScreen = () => {
  const [apiKey, setApiKey] = useState('');
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
    setCurrentKey(storedKey);
  };

  const saveApiKey = async () => {
    if (apiKey.trim().length === 0) {
      Alert.alert('Greška', 'API ključ ne može biti prazan.');
      return;
    }
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    Alert.alert('Uspeh', 'API ključ je sačuvan.');
    loadApiKey(); // Refresh the displayed key
    setApiKey('');
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Podešavanja AI Agenta</Title>
      <Paragraph>
        Trenutno korišćeni API ključ: {currentKey ? `...${currentKey.slice(-4)}` : 'Nije podešen'}
      </Paragraph>
      <Paragraph style={styles.paragraph}>
        Ovde možete uneti svoj OpenAI API ključ. Ako je polje prazno, aplikacija će pokušati da koristi ključ iz konfiguracije.
      </Paragraph>
      <TextInput
        label="Novi OpenAI API ključ"
        value={apiKey}
        onChangeText={setApiKey}
        placeholder="Unesite svoj API ključ ovde"
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" onPress={saveApiKey}>
        Sačuvaj Ključ
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
});

export default SettingsScreen;
