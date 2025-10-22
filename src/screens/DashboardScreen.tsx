import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme, Text, ActivityIndicator, Button, Avatar } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <View style={styles.loader}>
        <Title style={{textAlign: 'center'}}>Greška pri učitavanju</Title>
        <Paragraph style={styles.errorText}>Nije moguće učitati podatke. Proverite vašu internet konekciju i RLS polise u Supabase-u.</Paragraph>
        <Button mode="contained" onPress={onRetry} style={styles.retryButton}>Pokušaj ponovo</Button>
    </View>
);

const DashboardScreen = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [chartData, setChartData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const { data: transactions, error: dbError } = await supabase.from('transactions').select('*');

        if (dbError) { setError(dbError.message); setLoading(false); return; }

        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        setTotalIncome(income);
        setTotalExpense(expense);

        const expenseByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
            if (!acc[t.category]) acc[t.category] = 0;
            acc[t.category] += t.amount;
            return acc;
        }, {});

        const chartColors = ['#7c4dff', '#00bcd4', '#ffeb3b', '#ff9800', '#e91e63', '#4caf50'];
        const pieData = Object.keys(expenseByCategory).map((key, index) => ({
            name: key, amount: expenseByCategory[key], color: chartColors[index % chartColors.length],
            legendFontColor: theme.colors.text, legendFontSize: 12,
        }));
        setChartData(pieData);
        setLoading(false);
    };

    useFocusEffect(useCallback(() => { fetchData(); }, []));

    if (loading) { return <ActivityIndicator animating={true} style={styles.loader} />; }
    if (error) { return <ErrorState onRetry={fetchData} />; }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 20}}>
            <Card style={styles.card} elevation={4}>
                <Card.Content>
                    <View style={styles.summaryItem}><Avatar.Icon icon="arrow-up-bold-circle" size={40} color={theme.colors.success} style={styles.avatar}/><View><Paragraph>Ukupni prihodi</Paragraph><Title style={{color: theme.colors.success}}>{totalIncome.toFixed(2)} €</Title></View></View>
                    <View style={styles.summaryItem}><Avatar.Icon icon="arrow-down-bold-circle" size={40} color={theme.colors.error} style={styles.avatar}/><View><Paragraph>Ukupni rashodi</Paragraph><Title style={{color: theme.colors.error}}>{totalExpense.toFixed(2)} €</Title></View></View>
                    <View style={styles.summaryItem}><Avatar.Icon icon="scale-balance" size={40} color={theme.colors.primary} style={styles.avatar}/><View><Paragraph>Trenutno stanje</Paragraph><Title style={{color: theme.colors.primary}}>{(totalIncome - totalExpense).toFixed(2)} €</Title></View></View>
                </Card.Content>
            </Card>

            <Card style={styles.card} elevation={4}>
                <Card.Content>
                    <Title>Raspodela Troškova</Title>
                    {chartData.length > 0 ? (
                        <PieChart data={chartData} width={screenWidth - 40} height={220} chartConfig={{color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`}}
                            accessor={"amount"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
                    ) : ( <Text>Nema troškova za prikaz.</Text> )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { marginVertical: 8, borderRadius: 12 },
    summaryItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    avatar: { backgroundColor: 'transparent', marginRight: 15 },
    errorText: { textAlign: 'center', marginVertical: 10, paddingHorizontal: 20 },
    retryButton: { marginTop: 20 },
});

export default DashboardScreen;
