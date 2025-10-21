import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Card, Paragraph, useTheme, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { getOpenAIResponse } from '../lib/openai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const AIAgentScreen = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Zdravo! Ja sam FinAgent. Možeš me pitati nešto o svojim finansijama, zatražiti analizu, ili mi reći da ti napravim plan štednje.', sender: 'ai' },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

      const prompt = `
        Ti si stručni finansijski savetnik FinAgent. Analiziraj sledeće transakcije i odgovori na zahtev korisnika.

        Tvoja dva glavna zadatka su:
        1.  **Odgovaranje na pitanja:** Ako korisnik postavi pitanje (npr. "Koliko sam potrošio na hranu?"), daj kratak i tačan odgovor na osnovu podataka.
        2.  **Generisanje planova:** Ako korisnik zatraži plan (npr. "Napravi mi budžet za sledeći mesec" ili "Kako da uštedim 100€?"), kreiraj jasan, strukturiran plan. Koristi Markdown za naslove i liste. Plan mora biti realan i zasnovan na istoriji prihoda i rashoda korisnika.

        Transakcije: ${context}

        Zahtev korisnika: "${userMessage.text}"
      `;

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
        const noDataMessage: Message = { id: Math.random().toString(), text: "Nema dovoljno podataka u poslednjih 30 dana za analizu.", sender: 'ai' };
        setMessages(prev => [...prev, noDataMessage]);
        return;
      }
      const context = JSON.stringify(transactions);
      const prompt = `Ti si proaktivni finansijski savetnik FinAgent. Analiziraj transakcije korisnika iz poslednjih 30 dana. Identifikuj ključne trendove, daj bar 2 konkretne sugestije za uštedu i ukaži na potencijalne probleme. Odgovor formatiraj sa Markdown naslovima. Transakcije: ${context}`;
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
        <Paragraph>{item.text}</Paragraph>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
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
  messageCard: { maxWidth: '80%', marginVertical: 5, padding: 5, borderRadius: 12 },
  userMessage: { alignSelf: 'flex-end' },
  aiMessage: { alignSelf: 'flex-start' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc' },
  input: { flex: 1, marginRight: 10 },
  sendButton: { justifyContent: 'center' },
});

export default AIAgentScreen;
