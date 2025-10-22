import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { List, Text, FAB, useTheme, ActivityIndicator, Title, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { supabase, Transaction } from '../lib/supabase';
import AddTransactionModal from '../components/AddTransactionModal';

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    'Plata': 'cash-multiple', 'Bonus': 'cash-plus', 'Stanovanje': 'home-city', 'Hrana': 'food-fork-drink', 'Prevoz': 'train-car',
    'Zabava': 'popcorn', 'Dugovi/Krediti': 'bank', 'Ušteda': 'piggy-bank', 'Zdravlje': 'hospital-box', 'Default': 'help-circle',
  };
  return icons[category] || icons['Default'];
};
const EmptyState = () => ( <View style={styles.loader}><Title>Nema Transakcija</Title><Text>Dodajte svoju prvu transakciju klikom na '+' dugme.</Text></View> );

const TransactionsScreen = () => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) { Alert.alert('Greška', 'Nije moguće učitati transakcije.'); }
    else { setTransactions(data); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchTransactions(); }, []));

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('transactions').insert([newTransaction]);
    if (error) { Alert.alert('Greška', 'Nije moguće dodati transakciju.'); }
    else { fetchTransactions(); }
    setModalVisible(false);
  };

  const openModal = () => {
    try { setModalVisible(true); }
    catch (error) { Alert.alert("Greška", "Nije moguće otvoriti prozor za dodavanje transakcije."); }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isExpense = item.type === 'expense';
    const amountColor = isExpense ? theme.colors.error : theme.colors.success;
    return (
      <List.Item title={item.category} description={item.description} titleStyle={styles.titleStyle}
        left={props => <List.Icon {...props} icon={getCategoryIcon(item.category)} />}
        right={() => (
          <View style={styles.amountContainer}>
            <Text variant="bodyLarge" style={{ color: amountColor, fontWeight: 'bold' }}>{isExpense ? '-' : '+'}{item.amount.toFixed(2)} €</Text>
            <Text variant="bodySmall" style={styles.dateText}>{item.date}</Text>
          </View>
        )}
        style={styles.listItem}
      />
    );
  };

  if (loading) { return <ActivityIndicator animating={true} style={styles.loader} />; }

  return (
    <View style={styles.container}>
      <FlatList data={transactions} keyExtractor={item => item.id!.toString()} renderItem={renderTransaction} ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={<EmptyState />} contentContainerStyle={transactions.length === 0 ? styles.emptyFlex : null} />
      <FAB style={styles.fab} icon="plus" onPress={openModal} />
      {modalVisible && (
        <AddTransactionModal visible={modalVisible} onDismiss={() => setModalVisible(false)} onAddTransaction={handleAddTransaction} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  amountContainer: { justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10 },
  dateText: { color: 'grey' },
  emptyFlex: { flex: 1, justifyContent: 'center' },
  listItem: { paddingVertical: 10 },
  titleStyle: { fontWeight: 'bold' },
});

export default TransactionsScreen;
