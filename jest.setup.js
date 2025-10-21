import 'react-native-gesture-handler/jestSetup';

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

// Mock openai library to prevent actual API calls during tests
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Ovo je testni odgovor od AI Agenta.' } }],
            }),
          },
        },
      };
    });
});
