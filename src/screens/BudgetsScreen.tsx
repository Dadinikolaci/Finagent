import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, ProgressBar, useTheme, ActivityIndicator, Text, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { supabase, Budget } from '../lib/supabase';

interface BudgetWithSpent extends Budget {
  spent_amount: number;
}

const EmptyState = () => ( <View style={styles.loader}><Title>Nema Budžeta</Title><Text>Trenutno nema definisanih budžeta.</Text></View> );

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <View style={styles.loader}>
        <Title style={{textAlign: 'center'}}>Greška pri učitavanju</Title>
        <Paragraph style={styles.errorText}>Nije moguće učitati budžete. Proverite vašu internet konekciju.</Paragraph>
        <Paragraph style={styles.errorText}>Takođe, proverite da li su Row Level Security (RLS) polise u vašoj Supabase bazi ispravno podešene za 'budgets' i 'transactions' tabele.</Paragraph>
        <Button mode="contained" onPress={onRetry} style={styles.retryButton}>Pokušaj ponovo</Button>
    </View>
);

const BudgetsScreen = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetsAndSpentAmounts = async () => {
    setLoading(true);
    setError(null);
    const { data: budgetsData, error: budgetsError } = await supabase.from('budgets').select('*');
    if (budgetsError) {
      console.error(budgetsError);
      setError(budgetsError.message);
      setLoading(false);
      return;
    }

    const { data: transactionsData, error: transactionsError } = await supabase.from('transactions').select('category, amount').eq('type', 'expense');
    if (transactionsError) {
      console.error(transactionsError);
      setError(transactionsError.message);
      setLoading(false);
      return;
    }

    const spentByCategory = transactionsData.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});

    const budgetsWithSpent = budgetsData.map(budget => ({ ...budget, spent_amount: spentByCategory[budget.category] || 0 }));
    setBudgets(budgetsWithSpent);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchBudgetsAndSpentAmounts(); }, []));

  const renderBudget = ({ item }: { item: BudgetWithSpent }) => {
    const progress = item.total_amount > 0 ? item.spent_amount / item.total_amount : 0;
    const remaining = item.total_amount - item.spent_amount;
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.category}</Title>
          <Paragraph>Potrošeno: {item.spent_amount.toFixed(2)} € od {item.total_amount.toFixed(2)} €</Paragraph>
          <ProgressBar progress={progress} color={progress > 0.8 ? theme.colors.error : theme.colors.primary} style={styles.progressBar} />
          <Paragraph style={styles.remainingText}>Preostalo: {remaining.toFixed(2)} €</Paragraph>
        </Card.Content>
      </Card>
    );
  };

  if (loading) { return <ActivityIndicator animating={true} style={styles.loader} />; }
  if (error) { return <ErrorState onRetry={fetchBudgetsAndSpentAmounts} />; }

  return (
    <View style={styles.container}>
      <FlatList data={budgets} keyExtractor={item => item.id!.toString()} renderItem={renderBudget}
        contentContainerStyle={budgets.length === 0 ? styles.emptyFlex : styles.listContent}
        ListEmptyComponent={<EmptyState />} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContent: { padding: 10 },
  card: { marginVertical: 8 },
  progressBar: { height: 10, borderRadius: 5, marginTop: 10 },
  remainingText: { textAlign: 'right', marginTop: 5, fontSize: 12 },
  emptyFlex: { flex: 1 },
  errorText: { textAlign: 'center', marginVertical: 10, paddingHorizontal: 20 },
  retryButton: { marginTop: 20 },
});

export default BudgetsScreen;
