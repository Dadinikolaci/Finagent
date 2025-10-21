import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, ProgressBar, useTheme, ActivityIndicator, Text } from 'react-native-paper';
import { supabase, Budget } from '../lib/supabase';

interface BudgetWithSpent extends Budget {
  spent_amount: number;
}

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Title>Nema Budžeta</Title>
    <Text>Trenutno nema definisanih budžeta.</Text>
  </View>
);

const BudgetsScreen = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetsAndSpentAmounts();
  }, []);

  const fetchBudgetsAndSpentAmounts = async () => {
    setLoading(true);
    const { data: budgetsData, error: budgetsError } = await supabase.from('budgets').select('*');
    if (budgetsError) {
      Alert.alert('Greška', 'Nije moguće učitati budžete.');
      setLoading(false);
      return;
    }

    const { data: transactionsData, error: transactionsError } = await supabase.from('transactions').select('category, amount').eq('type', 'expense');
    if (transactionsError) {
      Alert.alert('Greška', 'Nije moguće izračunati potrošene iznose.');
      setLoading(false);
      return;
    }

    const spentByCategory: { [key: string]: number } = transactionsData.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});

    const budgetsWithSpent = budgetsData.map(budget => ({
      ...budget,
      spent_amount: spentByCategory[budget.category] || 0,
    }));

    setBudgets(budgetsWithSpent);
    setLoading(false);
  };

  const renderBudget = ({ item }: { item: BudgetWithSpent }) => {
    const progress = item.total_amount > 0 ? item.spent_amount / item.total_amount : 0;
    const remaining = item.total_amount - item.spent_amount;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.category}</Title>
          <Paragraph>
            Potrošeno: {item.spent_amount.toFixed(2)} € od {item.total_amount.toFixed(2)} €
          </Paragraph>
          <ProgressBar progress={progress} color={progress > 0.8 ? theme.colors.error : theme.colors.primary} style={styles.progressBar} />
          <Paragraph style={styles.remainingText}>
            Preostalo: {remaining.toFixed(2)} €
          </Paragraph>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={budgets}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderBudget}
        contentContainerStyle={budgets.length === 0 ? styles.emptyFlex : styles.listContent}
        onRefresh={fetchBudgetsAndSpentAmounts}
        refreshing={loading}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 10 },
  card: { marginVertical: 8 },
  progressBar: { height: 10, borderRadius: 5, marginTop: 10 },
  remainingText: { textAlign: 'right', marginTop: 5, fontSize: 12 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center' },
  emptyFlex: { flex: 1 },
});

export default BudgetsScreen;
