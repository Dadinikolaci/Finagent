export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO 8601 format: 'YYYY-MM-DD'
  description: string;
}

export interface Budget {
  id: string;
  category: string;
  totalAmount: number;
  spentAmount: number;
}

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 2000, category: 'Plata', date: '2024-07-01', description: 'Mesečna plata' },
  { id: '2', type: 'expense', amount: 80, category: 'Stanovanje', date: '2024-07-05', description: 'Račun za struju' },
  { id: '3', type: 'expense', amount: 50, category: 'Hrana', date: '2024-07-06', description: 'Nabavka u supermarketu' },
  { id: '4', type: 'expense', amount: 30, category: 'Prevoz', date: '2024-07-07', description: 'Mesečna karta' },
  { id: '5', type: 'expense', amount: 120, category: 'Dugovi/Krediti', date: '2024-07-10', description: 'Rata za kredit' },
  { id: '6', type: 'expense', amount: 40, category: 'Zabava', date: '2024-07-12', description: 'Bioskop' },
  { id: '7', type: 'expense', amount: 60, category: 'Hrana', date: '2024-07-15', description: 'Večera sa prijateljima' },
  { id: '8', type: 'income', amount: 300, category: 'Bonus', date: '2024-07-16', description: 'Bonus na poslu' },
  { id: '9', type: 'expense', amount: 25, category: 'Zdravlje', date: '2024-07-18', description: 'Lekovi' },
  { id: '10', type: 'expense', amount: 150, category: 'Ušteda', date: '2024-07-20', description: 'Prebacivanje na štedni račun' },
];

export const mockBudgets: Budget[] = [
  { id: '1', category: 'Hrana', totalAmount: 400, spentAmount: 110 },
  { id: '2', category: 'Prevoz', totalAmount: 100, spentAmount: 30 },
  { id: '3', category: 'Zabava', totalAmount: 150, spentAmount: 40 },
  { id: '4', category: 'Stanovanje', totalAmount: 100, spentAmount: 80 },
];
