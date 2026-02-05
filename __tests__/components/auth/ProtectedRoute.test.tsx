import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text testID="redirect">Redirecting to {href}</Text>;
  },
}));

// Mock FlameLoader
jest.mock('@/components/ui', () => ({
  FlameLoader: () => {
    const { Text } = require('react-native');
    return <Text testID="loader">Loading...</Text>;
  },
}));

const { useAuth } = require('@/contexts/AuthContext');

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <Text>Protected Content</Text>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loader')).toBeTruthy();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('redirects to login when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <Text>Protected Content</Text>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('redirect')).toBeTruthy();
    expect(screen.getByText('Redirecting to /(auth)/login')).toBeTruthy();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when user is authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      loading: false,
    });

    render(
      <ProtectedRoute>
        <Text>Protected Content</Text>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeTruthy();
    expect(screen.queryByTestId('redirect')).toBeNull();
    expect(screen.queryByTestId('loader')).toBeNull();
  });
});
