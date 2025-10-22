import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import AIAgentScreen from '../screens/AIAgentScreen';
import SettingsScreen from '../screens/SettingsScreen'; // Import the new screen

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            } else if (route.name === 'Transakcije') {
              iconName = focused ? 'swap-horizontal-bold' : 'swap-horizontal';
            } else if (route.name === 'Budžeti') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'AI Agent') {
              iconName = focused ? 'robot-happy' : 'robot-happy-outline';
            } else if (route.name === 'Podešavanja') {
              iconName = focused ? 'cog' : 'cog-outline';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Transakcije" component={TransactionsScreen} />
        <Tab.Screen name="Budžeti" component={BudgetsScreen} />
        <Tab.Screen name="AI Agent" component={AIAgentScreen} />
        <Tab.Screen name="Podešavanja" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
