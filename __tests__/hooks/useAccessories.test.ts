import { renderHook, waitFor, act } from '@testing-library/react-native';
import {
  useAccessories,
  useCreateAccessory,
  useUpdateAccessory,
  useDeleteAccessory,
} from '@/hooks/useAccessories';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import { createTestQueryWrapper } from '../helpers/testQueryWrapper';
import { mockSupabaseFrom } from '../helpers/mockSupabase';
import { mockAccessory, mockAccessory2, mockGrill } from '../helpers/testFixtures';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAccessories', () => {
  it('fetches accessories for a specific grill', async () => {
    mockSupabaseFrom([mockAccessory, mockAccessory2]);

    const { result } = renderHook(() => useAccessories('grill-1'), {
      wrapper: createTestQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabase.from).toHaveBeenCalledWith('accessories');
    expect(result.current.data).toEqual([mockAccessory, mockAccessory2]);
  });

  it('does not fetch when grillId is undefined', () => {
    const { result } = renderHook(() => useAccessories(undefined), {
      wrapper: createTestQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateAccessory', () => {
  it('creates an accessory and captures analytics', async () => {
    mockSupabaseFrom(mockAccessory);

    const { result } = renderHook(() => useCreateAccessory(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        grill_id: 'grill-1',
        name: 'Joetisserie',
        accessory_type: 'rotisserie',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(posthog.capture).toHaveBeenCalledWith('equipment_added', {
      equipment_type: 'accessory',
      accessory_type: 'rotisserie',
    });
  });

  it('handles creation errors', async () => {
    mockSupabaseFrom(null, { message: 'Insert failed', code: 'ERROR' });

    const { result } = renderHook(() => useCreateAccessory(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        grill_id: 'grill-1',
        name: 'Test',
        accessory_type: 'other',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useDeleteAccessory', () => {
  it('deletes an accessory', async () => {
    mockSupabaseFrom(null);

    const { result } = renderHook(() => useDeleteAccessory(), {
      wrapper: createTestQueryWrapper(),
    });

    await act(async () => {
      result.current.mutate({ id: 'acc-1', grillId: 'grill-1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
