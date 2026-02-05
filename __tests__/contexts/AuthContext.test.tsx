import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { mockSession, mockUser } from '../helpers/testFixtures';

// Mock dependencies
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `bbqcopilot://${path}`),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('posthog-react-native', () => ({
  usePostHog: jest.fn(() => ({
    capture: jest.fn(),
  })),
}));

// Get the mocked supabase from jest.setup.ts
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: no session
  (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: null },
    error: null,
  });
  // Default: mock onAuthStateChange
  (mockSupabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
    data: {
      subscription: {
        unsubscribe: jest.fn(),
      },
    },
  });
});

// ─── useAuth outside provider ─────────────────────────────

describe('useAuth outside provider', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');

    consoleSpy.mockRestore();
  });
});

// ─── Initialization ───────────────────────────────────────

describe('AuthContext initialization', () => {
  it('starts with loading=true', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    // Initially loading
    expect(result.current.loading).toBe(true);
  });

  it('calls getSession on mount and sets session', async () => {
    (mockSupabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user).toEqual(mockSession.user);
  });

  it('sets loading=false after getSession', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loading).toBe(false);
  });

  it('subscribes to onAuthStateChange', async () => {
    renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });

  it('sets isRecovery on PASSWORD_RECOVERY event', async () => {
    let authCallback: ((event: string, session: unknown) => void) | null = null;

    (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Simulate PASSWORD_RECOVERY event
    act(() => {
      authCallback?.('PASSWORD_RECOVERY', mockSession);
    });

    expect(result.current.isRecovery).toBe(true);
  });
});

// ─── signIn ───────────────────────────────────────────────

describe('signIn', () => {
  it('calls signInWithPassword with email and password', async () => {
    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('throws on error', async () => {
    const authError = { message: 'Invalid credentials', status: 401 };
    (mockSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: authError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.signIn('test@example.com', 'wrongpassword');
      })
    ).rejects.toEqual(authError);
  });
});

// ─── signUp ───────────────────────────────────────────────

describe('signUp', () => {
  it('calls signUp with email and password', async () => {
    (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('new@example.com', 'password123');
    });

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
    });
  });

  it('captures PostHog event on signup', async () => {
    const { usePostHog } = require('posthog-react-native');
    const mockCapture = jest.fn();
    (usePostHog as jest.Mock).mockReturnValue({ capture: mockCapture });

    (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('new@example.com', 'password123');
    });

    expect(mockCapture).toHaveBeenCalledWith('user_signed_up', { method: 'email' });
  });

  it('does not double-track signup', async () => {
    const { usePostHog } = require('posthog-react-native');
    const mockCapture = jest.fn();
    (usePostHog as jest.Mock).mockReturnValue({ capture: mockCapture });

    (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call signup twice
    await act(async () => {
      await result.current.signUp('new@example.com', 'password123');
    });
    await act(async () => {
      await result.current.signUp('new2@example.com', 'password456');
    });

    // Should only track once due to ref guard
    const signupCalls = mockCapture.mock.calls.filter(
      (call) => call[0] === 'user_signed_up'
    );
    expect(signupCalls).toHaveLength(1);
  });

  it('throws on error', async () => {
    const authError = { message: 'Email already exists', status: 400 };
    (mockSupabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: authError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.signUp('existing@example.com', 'password123');
      })
    ).rejects.toEqual(authError);
  });
});

// ─── signInWithGoogle ─────────────────────────────────────

describe('signInWithGoogle', () => {
  it('calls signInWithOAuth with Google provider', async () => {
    (mockSupabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
      data: { url: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining('auth/callback'),
      }),
    });
  });

  it('opens browser on native platform', async () => {
    // Mock Platform.OS as native
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true });

    const mockUrl = 'https://supabase.io/auth/google';
    (mockSupabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
      data: { url: mockUrl },
      error: null,
    });

    (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
      type: 'cancel',
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
      mockUrl,
      expect.stringContaining('auth/callback')
    );

    // Restore Platform.OS
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
  });

  it('throws on OAuth error', async () => {
    const authError = { message: 'OAuth failed', status: 500 };
    (mockSupabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
      data: { url: null },
      error: authError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.signInWithGoogle();
      })
    ).rejects.toEqual(authError);
  });
});

// ─── signOut ──────────────────────────────────────────────

describe('signOut', () => {
  it('calls supabase signOut', async () => {
    (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('throws on error', async () => {
    const authError = { message: 'Signout failed', status: 500 };
    (mockSupabase.auth.signOut as jest.Mock).mockResolvedValue({ error: authError });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.signOut();
      })
    ).rejects.toEqual(authError);
  });
});

// ─── resetPassword ────────────────────────────────────────

describe('resetPassword', () => {
  it('calls resetPasswordForEmail with redirect URL', async () => {
    (mockSupabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: expect.stringContaining('auth/reset-password') }
    );
  });

  it('throws on error', async () => {
    const authError = { message: 'User not found', status: 404 };
    (mockSupabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: null,
      error: authError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.resetPassword('nonexistent@example.com');
      })
    ).rejects.toEqual(authError);
  });
});

// ─── updatePassword ───────────────────────────────────────

describe('updatePassword', () => {
  it('calls updateUser with new password', async () => {
    (mockSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updatePassword('newpassword123');
    });

    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'newpassword123',
    });
  });

  it('throws on error', async () => {
    const authError = { message: 'Password too weak', status: 400 };
    (mockSupabase.auth.updateUser as jest.Mock).mockResolvedValue({
      data: null,
      error: authError,
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.updatePassword('weak');
      })
    ).rejects.toEqual(authError);
  });
});

// ─── clearRecovery ────────────────────────────────────────

describe('clearRecovery', () => {
  it('sets isRecovery to false', async () => {
    let authCallback: ((event: string, session: unknown) => void) | null = null;

    (mockSupabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      };
    });

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Set isRecovery to true
    act(() => {
      authCallback?.('PASSWORD_RECOVERY', mockSession);
    });

    expect(result.current.isRecovery).toBe(true);

    // Clear recovery
    act(() => {
      result.current.clearRecovery();
    });

    expect(result.current.isRecovery).toBe(false);
  });
});
