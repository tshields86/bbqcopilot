import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useProfile, useUpdateProfile, useCompleteOnboarding } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { createTestQueryWrapper } from '../helpers/testQueryWrapper';
import { mockAuthUser, mockSupabaseFrom } from '../helpers/mockSupabase';
import { mockProfile, mockUser } from '../helpers/testFixtures';

// Mock AuthContext — useProfile depends on useAuth for user-scoped cache key
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-123', email: 'test@bbqcopilot.com' },
    session: null,
    loading: false,
  })),
}));

const { useAuth } = require('@/contexts/AuthContext');

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthUser(mockUser);
  (useAuth as jest.Mock).mockReturnValue({
    user: mockUser,
    session: null,
    loading: false,
  });
});

describe('useProfile', () => {
  it('fetches the current user profile', async () => {
    mockSupabaseFrom(mockProfile);

    const { result } = renderHook(() => useProfile(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(result.current.data).toEqual(mockProfile);
  });

  it('returns null when no profile exists (PGRST116)', async () => {
    const builder = mockSupabaseFrom(null);
    builder.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No rows found' },
    });

    const { result } = renderHook(() => useProfile(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      session: null,
      loading: false,
    });

    const { result } = renderHook(() => useProfile(), {
      wrapper: createTestQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useUpdateProfile', () => {
  it('updates the profile', async () => {
    mockSupabaseFrom({ ...mockProfile, display_name: 'Updated Name' });

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ display_name: 'Updated Name' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('throws when not authenticated', async () => {
    mockAuthUser(null);

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ display_name: 'Test' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCompleteOnboarding', () => {
  it('marks onboarding as completed', async () => {
    mockSupabaseFrom({ ...mockProfile, onboarding_completed: true });

    const { result } = renderHook(() => useCompleteOnboarding(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
