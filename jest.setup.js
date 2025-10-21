import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.Alert = { alert: jest.fn() };
  return rn;
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useFocusEffect: jest.fn(),
  };
});
