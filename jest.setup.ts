import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `bbqcopilot://${path}`),
  openURL: jest.fn(),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        if (prop === '__esModule') return true;
        // Return a simple View stub for any icon
        const IconStub = (props: Record<string, unknown>) => View(props);
        IconStub.displayName = prop;
        return IconStub;
      },
    }
  );
});

// Mock @/lib/supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Mock @/lib/posthog
jest.mock('@/lib/posthog', () => ({
  posthog: {
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  },
}));

// Mock posthog-react-native
jest.mock('posthog-react-native', () => ({
  usePostHog: jest.fn(() => ({
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  })),
  PostHogProvider: ({ children }: { children: React.ReactNode }) => children,
  __esModule: true,
  default: jest.fn(() => ({
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  })),
}));

// Mock nativewind
jest.mock('nativewind', () => ({
  styled: (component: unknown) => component,
  useColorScheme: jest.fn(() => ({ colorScheme: 'dark' })),
  cssInterop: jest.fn(),
}));

// Silence known RN/testing-library console noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('Warning: An update to') ||
    msg.includes('act(...)') ||
    msg.includes('Not implemented')
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('NativeWind') || msg.includes('Reanimated')) {
    return;
  }
  originalConsoleWarn(...args);
};
