import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getOpenAIResponse, initializeOpenAI } from '../lib/openai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const AIAgentScreen = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        await initializeOpenAI();
        if (!isInitialized) {
          setMessages([
            { id: '1', text: 'Zdravo! Ja sam FinAgent. Možeš me pitati nešto o svojim finansijama, zatražiti analizu, ili mi reći da ti napravim plan štednje.', sender: 'ai' },
          ]);
          setIsInitialized(true);
        }
      };
      init();
    }, [isInitialized])
  );

  const handleSend = async () => {
    if (inputText.trim().length === 0 || loading) return;
    setLoading(true);
    const userMessage: Message = { id: Math.random().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const { data: transactions, error } = await supabase.from('transactions').select('*');
      if (error) throw error;
      const context = JSON.stringify(transactions);

      const prompt = `Ti si stručni finansijski savetnik FinAgent... Transakcije: ${context} Zahtev korisnika: "${userMessage.text}"`; // Detailed prompt
      const aiText = await getOpenAIResponse(prompt);

      if (aiText) {
        const aiMessage: Message = { id: Math.random().toString(), text: aiText, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      Alert.alert('Greška', 'Nije moguće dobiti odgovor od AI Agenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async () => {
    setLoading(true);
    const analysisRequestMessage: Message = { id: Math.random().toString(), text: "Molim te, analiziraj moje finansije iz poslednjih 30 dana.", sender: 'user' };
    setMessages(prev => [...prev, analysisRequestMessage]);

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: transactions, error } = await supabase.from('transactions').select('*').gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      if (error) throw error;
      if (transactions.length === 0) {
        setMessages(prev => [...prev, { id: Math.random().toString(), text: "Nema dovoljno podataka...", sender: 'ai' }]);
        return;
      }
      const context = JSON.stringify(transactions);
      const prompt = `Ti si proaktivni finansijski savetnik FinAgent... Transakcije: ${context}`; // Detailed prompt
      const aiText = await getOpenAIResponse(prompt);

      if (aiText) {
        const aiMessage: Message = { id: Math.random().toString(), text: aiText, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      Alert.alert('Greška', 'Nije moguće izvršiti analizu.');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <Card style={[styles.messageCard, isUser ? styles.userMessage : styles.aiMessage, { backgroundColor: isUser ? theme.colors.primaryContainer : theme.colors.surfaceVariant }]}>
        <Card.Content>
          <Markdown style={{ body: { color: theme.colors.onSurfaceVariant } }}>
            {item.text}
          </Markdown>
        </Card.Content>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={110}>
      <Button mode="outlined" onPress={handleAnalysis} disabled={loading} style={styles.analysisButton}>
        Analiziraj moje finansije
      </Button>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={inputText} onChangeText={setInputText} placeholder="Postavi pitanje ili zatraži plan..." mode="outlined" multiline disabled={loading} />
        <Button icon="send" mode="contained" onPress={handleSend} style={styles.sendButton} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={theme.colors.onPrimary}/> : "Pošalji"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  analysisButton: { marginHorizontal: 10, marginTop: 10 },
  messageList: { padding: 10 },
  messageCard: { maxWidth: '85%', marginVertical: 5, padding: 2, borderRadius: 15 },
  userMessage: { alignSelf: 'flex-end' },
  aiMessage: { alignSelf: 'flex-start' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, backgroundColor: '#f0f0f0' },
  input: { flex: 1, marginRight: 10, maxHeight: 100 },
  sendButton: { justifyContent: 'center', height: 50 },
});

export default AIAgentScreen;
