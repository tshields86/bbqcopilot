import { renderHook, waitFor } from '@testing-library/react-native';
import { useUsage, isApproachingLimit, hasHitLimit } from '@/hooks/useUsage';
import { supabase } from '@/lib/supabase';
import { createTestQueryWrapper } from '../helpers/testQueryWrapper';
import { mockAuthUser, mockSupabaseFrom, createMockQueryBuilder } from '../helpers/mockSupabase';
import {
  mockUsageStatus,
  mockUsageApproachingLimit,
  mockUsageAtLimit,
  mockUsageUnlimited,
  mockUser,
} from '../helpers/testFixtures';

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthUser(mockUser);
});

// ─── Pure helpers ────────────────────────────────────────

describe('isApproachingLimit', () => {
  it('returns false when not near limit', () => {
    expect(isApproachingLimit(mockUsageStatus)).toBe(false);
  });

  it('returns true when remaining <= 3 and > 0', () => {
    expect(isApproachingLimit(mockUsageApproachingLimit)).toBe(true);
  });

  it('returns false when at limit (remaining = 0)', () => {
    expect(isApproachingLimit(mockUsageAtLimit)).toBe(false);
  });

  it('returns false for unlimited tier', () => {
    expect(isApproachingLimit(mockUsageUnlimited)).toBe(false);
  });
});

describe('hasHitLimit', () => {
  it('returns false when not at limit', () => {
    expect(hasHitLimit(mockUsageStatus)).toBe(false);
  });

  it('returns true when remaining is 0 and limited', () => {
    expect(hasHitLimit(mockUsageAtLimit)).toBe(true);
  });

  it('returns false for unlimited tier', () => {
    expect(hasHitLimit(mockUsageUnlimited)).toBe(false);
  });
});

// ─── Query hook ──────────────────────────────────────────

describe('useUsage', () => {
  it('fetches usage status and calculates remaining', async () => {
    // Mock subscriptions query
    const subsBuilder = createMockQueryBuilder({ tier: 'free', monthly_recipe_limit: 15 });
    // Mock user_usage query
    const usageBuilder = createMockQueryBuilder({ recipes_generated: 5 });

    let callCount = 0;
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'subscriptions') return subsBuilder;
      if (table === 'user_usage') return usageBuilder;
      return createMockQueryBuilder();
    });

    const { result } = renderHook(() => useUsage(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      used: 5,
      limit: 15,
      remaining: 10,
      tier: 'free',
      isLimited: true,
    });
  });

  it('defaults to free tier when no subscription found', async () => {
    const subsBuilder = createMockQueryBuilder(null);
    const usageBuilder = createMockQueryBuilder(null);

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'subscriptions') return subsBuilder;
      if (table === 'user_usage') return usageBuilder;
      return createMockQueryBuilder();
    });

    const { result } = renderHook(() => useUsage(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      used: 0,
      limit: 15,
      remaining: 15,
      tier: 'free',
    });
  });

  it('throws when not authenticated', async () => {
    mockAuthUser(null);

    const { result } = renderHook(() => useUsage(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
