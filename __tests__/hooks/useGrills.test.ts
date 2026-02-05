import { renderHook, waitFor, act } from '@testing-library/react-native';
import {
  useGrills,
  useGrill,
  useCreateGrill,
  useUpdateGrill,
  useDeleteGrill,
  useSetPrimaryGrill,
  getPrimaryGrill,
} from '@/hooks/useGrills';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import { createTestQueryWrapper } from '../helpers/testQueryWrapper';
import { mockAuthUser, mockSupabaseFrom } from '../helpers/mockSupabase';
import { mockGrill, mockGrill2, mockUser } from '../helpers/testFixtures';

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthUser(mockUser);
});

// ─── Pure helper ─────────────────────────────────────────

describe('getPrimaryGrill', () => {
  it('returns undefined for undefined input', () => {
    expect(getPrimaryGrill(undefined)).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    expect(getPrimaryGrill([])).toBeUndefined();
  });

  it('returns the primary grill when found', () => {
    expect(getPrimaryGrill([mockGrill2, mockGrill])).toEqual(mockGrill);
  });

  it('falls back to first grill when no primary is set', () => {
    const noPrimary = [
      { ...mockGrill, is_primary: false },
      { ...mockGrill2, is_primary: false },
    ];
    expect(getPrimaryGrill(noPrimary)).toEqual(noPrimary[0]);
  });
});

// ─── Query hooks ─────────────────────────────────────────

describe('useGrills', () => {
  it('fetches grills with nested accessories', async () => {
    mockSupabaseFrom([mockGrill, mockGrill2]);

    const { result } = renderHook(() => useGrills(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabase.from).toHaveBeenCalledWith('grills');
    expect(result.current.data).toEqual([mockGrill, mockGrill2]);
  });

  it('throws when not authenticated', async () => {
    mockAuthUser(null);

    const { result } = renderHook(() => useGrills(), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Not authenticated');
  });
});

describe('useGrill', () => {
  it('fetches a single grill by ID', async () => {
    mockSupabaseFrom(mockGrill);

    const { result } = renderHook(() => useGrill('grill-1'), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockGrill);
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useGrill(undefined), {
      wrapper: createTestQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ─── Mutation hooks ──────────────────────────────────────

describe('useCreateGrill', () => {
  it('creates a grill and captures analytics', async () => {
    // Mock count check (for first grill detection)
    const builder = mockSupabaseFrom(mockGrill);
    // The count query uses select with { count: 'exact', head: true }
    // which resolves via the chain. We need the final resolved value.
    builder.then = jest.fn((resolve: (val: unknown) => void) =>
      resolve({ data: null, error: null, count: 0 })
    );

    const { result } = renderHook(() => useCreateGrill(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        name: 'Big Joe III',
        grill_type: 'kamado',
        brand: 'Kamado Joe',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(posthog.capture).toHaveBeenCalledWith('equipment_added', {
      equipment_type: 'grill',
      grill_type: 'kamado',
      grill_brand: 'Kamado Joe',
    });
  });
});

describe('useUpdateGrill', () => {
  it('updates a grill', async () => {
    mockSupabaseFrom({ ...mockGrill, name: 'Updated Name' });

    const { result } = renderHook(() => useUpdateGrill(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'grill-1', name: 'Updated Name' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDeleteGrill', () => {
  it('deletes a grill', async () => {
    mockSupabaseFrom(null);

    const { result } = renderHook(() => useDeleteGrill(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate('grill-1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useSetPrimaryGrill', () => {
  it('sets a grill as primary', async () => {
    mockSupabaseFrom({ ...mockGrill2, is_primary: true });

    const { result } = renderHook(() => useSetPrimaryGrill(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate('grill-2');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
