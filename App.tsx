import React from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { lightTheme, darkTheme } from './src/theme/theme'; // Import custom themes
import AppNavigator from './src/navigation/AppNavigator';

declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      success: string;
    }
  }
}

const App = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

export default App;
