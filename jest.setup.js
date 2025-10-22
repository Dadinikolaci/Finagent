import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Native modules
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Alert = { alert: jest.fn() };
  return rn;
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useFocusEffect: jest.fn(),
  };
});

// Mock openai library
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'Test response.' } }] }) } }
    }));
});
