import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { getOpenAIResponse, initializeOpenAI } from '../lib/openai';

interface Message { id: string; text: string; sender: 'user' | 'ai'; }

const AIAgentScreen = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useFocusEffect(useCallback(() => {
    const init = async () => {
      await initializeOpenAI();
      if (!isInitialized) {
        setMessages([{ id: '1', text: 'Zdravo! Ja sam FinAgent. Pitaj me nešto...', sender: 'ai' }]);
        setIsInitialized(true);
      }
    };
    init();
  }, [isInitialized]));

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
      const prompt = `Ti si stručni finansijski savetnik FinAgent... Transakcije: ${context} Zahtev korisnika: "${userMessage.text}"`;
      const aiText = await getOpenAIResponse(prompt);
      if (aiText) { setMessages(prev => [...prev, { id: Math.random().toString(), text: aiText, sender: 'ai' }]); }
    } catch (err) { Alert.alert('Greška', 'Nije moguće dobiti odgovor od AI Agenta.'); }
    finally { setLoading(false); }
  };

  const handleAnalysis = async () => {
    setLoading(true);
    setMessages(prev => [...prev, { id: Math.random().toString(), text: "Molim te, analiziraj moje finansije...", sender: 'user' }]);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: transactions, error } = await supabase.from('transactions').select('*').gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      if (error) throw error;
      if (transactions.length === 0) {
        setMessages(prev => [...prev, { id: Math.random().toString(), text: "Nema dovoljno podataka za analizu.", sender: 'ai' }]);
        return;
      }
      const context = JSON.stringify(transactions);
      const prompt = `Ti si proaktivni finansijski savetnik FinAgent... Transakcije: ${context}`;
      const aiText = await getOpenAIResponse(prompt);
      if (aiText) { setMessages(prev => [...prev, { id: Math.random().toString(), text: aiText, sender: 'ai' }]); }
    } catch (err) { Alert.alert('Greška', 'Nije moguće izvršiti analizu.'); }
    finally { setLoading(false); }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <Card style={[styles.messageCard, isUser ? styles.userMessage : styles.aiMessage, { backgroundColor: isUser ? theme.colors.primaryContainer : theme.colors.surfaceVariant }]} elevation={2}>
        <Card.Content><Markdown style={{ body: { color: isUser ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant } }}>{item.text}</Markdown></Card.Content>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <Button mode="elevated" onPress={handleAnalysis} disabled={loading} style={styles.analysisButton} icon="auto-fix">Brza Analiza</Button>
      <FlatList ref={flatListRef} data={messages} renderItem={renderMessage} keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} />
      <View style={[styles.inputContainer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
        <TextInput style={styles.input} value={inputText} onChangeText={setInputText} placeholder="Pitaj FinAgenta..." mode="outlined" multiline disabled={loading} />
        <Button icon="send-circle" mode="contained" onPress={handleSend} style={styles.sendButton} disabled={loading} contentStyle={styles.sendButtonContent}>
          {loading ? <ActivityIndicator size="small" color={theme.colors.onPrimary}/> : null}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  analysisButton: { marginHorizontal: 10, marginTop: 10 },
  messageList: { paddingHorizontal: 10, paddingBottom: 10 },
  messageCard: { maxWidth: '85%', marginVertical: 5, borderRadius: 20 },
  userMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  aiMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  input: { flex: 1, marginRight: 8, maxHeight: 120 },
  sendButton: { borderRadius: 50, justifyContent: 'center', height: 50, width: 50, paddingHorizontal: 0 },
  sendButtonContent: { height: '100%' }
});

export default AIAgentScreen;
