import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Modal, Portal, Text, Button, TextInput, RadioButton, useTheme } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { TransactionType, Transaction } from '../data/mockData';

interface AddTransactionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const categories = [
  'Stanovanje', 'Hrana', 'Prevoz', 'Zabava', 'Dugovi/Krediti', 'Ušteda', 'Zdravlje', 'Plata', 'Bonus'
].map(cat => ({ label: cat, value: cat }));

const AddTransactionModal = ({ visible, onDismiss, onAddTransaction }: AddTransactionModalProps) => {
  const theme = useTheme();
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<TransactionType>('expense');
  const [category, setCategory] = React.useState<string | null>(null);

  const handleAdd = () => {
    if (!amount || !category || !description) {
      Alert.alert("Greška", "Molimo popunite sva polja.");
      return;
    }

    const newTransaction = {
      amount: parseFloat(amount),
      category,
      description,
      type,
    };
    onAddTransaction(newTransaction);
    // Reset state and dismiss
    setAmount('');
    setDescription('');
    setCategory(null);
    setType('expense');
    onDismiss();
  };

  const pickerSelectStyles = StyleSheet.create({
      inputIOS: {
        fontSize: 16, paddingVertical: 12, paddingHorizontal: 10, borderWidth: 1,
        borderColor: theme.colors.placeholder, borderRadius: theme.roundness, color: theme.colors.text,
        paddingRight: 30, backgroundColor: theme.colors.background, marginBottom: 20,
      },
      inputAndroid: {
        fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1,
        borderColor: theme.colors.placeholder, borderRadius: theme.roundness, color: theme.colors.text,
        paddingRight: 30, backgroundColor: theme.colors.background, marginBottom: 20,
      },
  });

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.container, {backgroundColor: theme.colors.surface}]}>
        <Text style={styles.title}>Dodaj novu transakciju</Text>

        <RadioButton.Group onValueChange={newValue => setType(newValue as TransactionType)} value={type}>
          <View style={styles.radioContainer}>
            <View style={styles.radioItem}><Text>Rashod</Text><RadioButton value="expense" /></View>
            <View style={styles.radioItem}><Text>Prihod</Text><RadioButton value="income" /></View>
          </View>
        </RadioButton.Group>

        <TextInput label="Iznos" value={amount} onChangeText={setAmount} keyboardType="numeric" mode="outlined" style={styles.input} />

        <RNPickerSelect
            onValueChange={(value) => setCategory(value)}
            items={categories}
            placeholder={{ label: "Izaberi kategoriju...", value: null }}
            style={pickerSelectStyles}
        />

        <TextInput label="Opis" value={description} onChangeText={setDescription} mode="outlined" style={styles.input} />

        <Button mode="contained" onPress={handleAdd} style={styles.button}>Dodaj</Button>
        <Button onPress={onDismiss} style={styles.button}>Otkaži</Button>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, margin: 20, borderRadius: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 20 },
  button: { marginTop: 10 },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  radioItem: { flexDirection: 'row', alignItems: 'center' }
});

export default AddTransactionModal;
