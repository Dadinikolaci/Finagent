import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Title, Paragraph, ProgressBar, useTheme } from 'react-native-paper';
import { mockBudgets, Budget } from '../data/mockData';

const BudgetsScreen = () => {
  const theme = useTheme();

  const renderBudget = ({ item }: { item: Budget }) => {
    const progress = item.spentAmount / item.totalAmount;
    const remaining = item.totalAmount - item.spentAmount;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.category}</Title>
          <Paragraph>
            Potrošeno: {item.spentAmount.toFixed(2)} € od {item.totalAmount.toFixed(2)} €
          </Paragraph>
          <ProgressBar progress={progress} color={progress > 0.8 ? theme.colors.error : theme.colors.primary} style={styles.progressBar} />
          <Paragraph style={styles.remainingText}>
            Preostalo: {remaining.toFixed(2)} €
          </Paragraph>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={mockBudgets}
        keyExtractor={item => item.id}
        renderItem={renderBudget}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
  card: {
    marginVertical: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  remainingText: {
      textAlign: 'right',
      marginTop: 5,
      fontSize: 12,
  }
});

export default BudgetsScreen;
