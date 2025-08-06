module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\.tsx?$': 'ts-jest',
    '^.+\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],

  collectCoverageFrom: [
    'services/**/*.{ts,tsx}',
    '!services/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transformIgnorePatterns: [
    'node_modules/(?!(expo-|@expo/|react-native|@react-native|@react-navigation|laravel-echo|pusher-js)/)'
  ],
  moduleNameMapper: {
    '^expo-notifications$': '<rootDir>/__tests__/setup.ts',
    '^expo-device$': '<rootDir>/__tests__/setup.ts',
    '^expo-constants$': '<rootDir>/__tests__/setup.ts',
    '^laravel-echo$': '<rootDir>/__tests__/setup.ts',
    '^pusher-js$': '<rootDir>/__tests__/setup.ts',
  },
};