import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Text, FAB, useTheme } from 'react-native-paper';
import { mockTransactions, Transaction } from '../data/mockData';
import AddTransactionModal from '../components/AddTransactionModal';

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    'Plata': 'cash-multiple', 'Bonus': 'cash-plus', 'Stanovanje': 'home-city',
    'Hrana': 'food-fork-drink', 'Prevoz': 'train-car', 'Zabava': 'popcorn',
    'Dugovi/Krediti': 'bank', 'Ušteda': 'piggy-bank', 'Zdravlje': 'hospital-box',
    'Default': 'help-circle',
  };
  return icons[category] || icons['Default'];
};

const TransactionsScreen = () => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [transactions, setTransactions] = React.useState<Transaction[]>(mockTransactions);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    const transactionToAdd: Transaction = {
      ...newTransaction,
      id: Math.random().toString(), // Not a great ID, but fine for mock data
      date: new Date().toISOString().split('T')[0], // Use current date
    };
    setTransactions(prevTransactions => [transactionToAdd, ...prevTransactions]);
    setModalVisible(false);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isExpense = item.type === 'expense';
    const amountColor = isExpense ? theme.colors.error : 'green';

    return (
      <List.Item
        title={item.category}
        description={item.description}
        left={props => <List.Icon {...props} icon={getCategoryIcon(item.category)} />}
        right={() => (
          <View style={styles.amountContainer}>
            <Text style={{ color: amountColor, fontWeight: 'bold' }}>
              {isExpense ? '-' : '+'}{item.amount.toFixed(2)} €
            </Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setModalVisible(true)}
      />
      <AddTransactionModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onAddTransaction={handleAddTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  amountContainer: { justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10 },
  dateText: { fontSize: 12, color: 'grey' },
});

export default TransactionsScreen;
