import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { List, Text, FAB, useTheme, ActivityIndicator } from 'react-native-paper';
import { supabase, Transaction } from '../lib/supabase'; // Using supabase client
import AddTransactionModal from '../components/AddTransactionModal';

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    'Plata': 'cash-multiple', 'Bonus': 'cash-plus', 'Stanovanje': 'home-city', 'Hrana': 'food-fork-drink',
    'Prevoz': 'train-car', 'Zabava': 'popcorn', 'Dugovi/Krediti': 'bank', 'Ušteda': 'piggy-bank',
    'Zdravlje': 'hospital-box', 'Default': 'help-circle',
  };
  return icons[category] || icons['Default'];
};

const TransactionsScreen = () => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      Alert.alert('Greška', 'Nije moguće učitati transakcije.');
      console.error(error);
    } else {
      setTransactions(data);
    }
    setLoading(false);
  };

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('transactions').insert([newTransaction]);
    if (error) {
      Alert.alert('Greška', 'Nije moguće dodati transakciju.');
      console.error(error);
    } else {
      Alert.alert('Uspeh', 'Transakcija je uspešno dodata.');
      fetchTransactions(); // Refresh the list
    }
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

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id!.toString()}
        renderItem={renderTransaction}
        refreshing={loading}
        onRefresh={fetchTransactions}
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
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  amountContainer: { justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10 },
  dateText: { fontSize: 12, color: 'grey' },
});

export default TransactionsScreen;
