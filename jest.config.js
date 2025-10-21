module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)',
  ],
  setupFiles: [
    './node_modules/react-native-url-polyfill/auto',
    './jest.setup.js'
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  moduleNameMapper: {
    '^@env$': '<rootDir>/.env.test',
  },
};
