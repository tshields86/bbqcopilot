import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a fresh QueryClient configured for testing.
 * Disables retries and caching for predictable test behavior.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Test wrapper component that provides QueryClientProvider.
 * Use with @testing-library/react-native's `wrapper` option.
 *
 * Usage:
 * ```
 * const { result } = renderHook(() => useMyHook(), {
 *   wrapper: createTestQueryWrapper(),
 * });
 * ```
 */
export function createTestQueryWrapper() {
  const queryClient = createTestQueryClient();

  return function TestQueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
