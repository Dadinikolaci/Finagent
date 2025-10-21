import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Card, Title, Paragraph, useTheme, Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { mockTransactions } from '../data/mockData';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
    const theme = useTheme();

    // Calculate totals
    const totalIncome = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = totalIncome - totalExpense;

    // Prepare data for PieChart
    const expenseByCategory = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
            const { category, amount } = transaction;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
            return acc;
        }, {} as { [key: string]: number });

    const chartData = Object.keys(expenseByCategory).map((key, index) => ({
        name: key,
        amount: expenseByCategory[key],
        color: `hsl(${(index * 60) % 360}, 70%, 50%)`, // Generate distinct colors
        legendFontColor: theme.colors.text,
        legendFontSize: 12,
    }));

    const chartConfig = {
        backgroundGradientFrom: theme.colors.background,
        backgroundGradientTo: theme.colors.background,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Not really used for PieChart but required
    };


    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Pregled Stanja</Title>
                    <Paragraph>Ukupni prihodi: <Text style={styles.incomeText}>{totalIncome.toFixed(2)} €</Text></Paragraph>
                    <Paragraph>Ukupni rashodi: <Text style={styles.expenseText}>{totalExpense.toFixed(2)} €</Text></Paragraph>
                    <Title style={styles.balanceText}>Trenutno stanje: {currentBalance.toFixed(2)} €</Title>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title>Raspodela Troškova</Title>
                    <PieChart
                        data={chartData}
                        width={screenWidth - 40} // card padding
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"amount"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    card: {
        marginVertical: 8,
    },
    incomeText: {
        color: 'green',
        fontWeight: 'bold',
    },
    expenseText: {
        color: 'red',
        fontWeight: 'bold',
    },
    balanceText: {
        marginTop: 10,
        fontWeight: 'bold',
    }
});

export default DashboardScreen;
