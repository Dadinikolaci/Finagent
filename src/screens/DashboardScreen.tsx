import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [chartData, setChartData] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        const { data: transactions, error } = await supabase.from('transactions').select('*');

        if (error) {
            Alert.alert("Greška", "Nije moguće učitati podatke za dashboard.");
            console.error(error);
            setLoading(false);
            return;
        }

        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        setTotalIncome(income);
        setTotalExpense(expense);

        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                if (!acc[t.category]) acc[t.category] = 0;
                acc[t.category] += t.amount;
                return acc;
            }, {});

        const pieData = Object.keys(expenseByCategory).map((key, index) => ({
            name: key,
            amount: expenseByCategory[key],
            color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            legendFontColor: theme.colors.text,
            legendFontSize: 12,
        }));
        setChartData(pieData);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const chartConfig = {
        backgroundGradientFrom: theme.colors.background,
        backgroundGradientTo: theme.colors.background,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    if (loading) {
        return <ActivityIndicator animating={true} style={styles.loader} />;
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Pregled Stanja</Title>
                    <Paragraph>Ukupni prihodi: <Text style={styles.incomeText}>{totalIncome.toFixed(2)} €</Text></Paragraph>
                    <Paragraph>Ukupni rashodi: <Text style={styles.expenseText}>{totalExpense.toFixed(2)} €</Text></Paragraph>
                    <Title style={styles.balanceText}>Trenutno stanje: {(totalIncome - totalExpense).toFixed(2)} €</Title>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Raspodela Troškova</Title>
                    {chartData.length > 0 ? (
                        <PieChart
                            data={chartData}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={chartConfig}
                            accessor={"amount"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            absolute
                        />
                    ) : (
                        <Text>Nema troškova za prikaz.</Text>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { marginVertical: 8 },
    incomeText: { color: 'green', fontWeight: 'bold' },
    expenseText: { color: 'red', fontWeight: 'bold' },
    balanceText: { marginTop: 10, fontWeight: 'bold' },
});

export default DashboardScreen;
