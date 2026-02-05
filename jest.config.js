/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@supabase/.*|@tanstack/.*|nativewind|react-native-css-interop|posthog-react-native|lucide-react-native|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-svg)',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
    '!lib/database.types.ts',
  ],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
};
