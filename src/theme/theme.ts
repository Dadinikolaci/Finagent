import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7c4dff', // Vivid purple
    primaryContainer: '#ede7f6',
    secondary: '#00bcd4', // Cyan
    secondaryContainer: '#e0f7fa',
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceVariant: '#eeeeee',
    onSurfaceVariant: '#424242',
    error: '#f44336', // Red for expenses
    success: '#4caf50', // Green for income
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#7c4dff', // Vivid purple
    primaryContainer: '#3e2723',
    secondary: '#00bcd4', // Cyan
    secondaryContainer: '#006064',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#303030',
    onSurfaceVariant: '#e0e0e0',
    error: '#ef5350', // Lighter red for expenses
    success: '#66bb6a', // Lighter green for income
  },
};
