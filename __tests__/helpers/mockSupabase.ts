import { supabase } from '@/lib/supabase';

type MockedSupabase = jest.Mocked<typeof supabase>;

/**
 * Get the mocked supabase client for assertions
 */
export function getMockedSupabase(): MockedSupabase {
  return supabase as unknown as MockedSupabase;
}

/**
 * Chainable mock builder for Supabase query patterns.
 * Simulates supabase.from('table').select().eq().order()... chains.
 */
export function createMockQueryBuilder(resolvedData: unknown = null, error: unknown = null) {
  const builder: Record<string, jest.Mock> = {};

  const terminators = ['single', 'maybeSingle'];
  const chainMethods = ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'in', 'is', 'order', 'limit', 'range', 'match', 'filter'];

  // Chain methods return `this`
  for (const method of chainMethods) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }

  // Terminators resolve with { data, error }
  for (const method of terminators) {
    builder[method] = jest.fn().mockResolvedValue({ data: resolvedData, error });
  }

  // Non-terminal awaitable — when no .single() is called but the chain is awaited
  // Proxy the then/catch so that `await supabase.from('x').select().eq()` works
  const thenResult = { data: resolvedData, error };
  builder.then = jest.fn((resolve: (val: unknown) => void) => resolve(thenResult));

  return builder;
}

/**
 * Configure supabase.from() to return a specific mock query builder.
 * Optionally scope to a specific table name.
 */
export function mockSupabaseFrom(data: unknown = null, error: unknown = null, table?: string) {
  const mock = getMockedSupabase();
  const builder = createMockQueryBuilder(data, error);

  if (table) {
    (mock.from as jest.Mock).mockImplementation((t: string) => {
      if (t === table) return builder;
      return createMockQueryBuilder(null, null);
    });
  } else {
    (mock.from as jest.Mock).mockReturnValue(builder);
  }

  return builder;
}

/**
 * Configure supabase.auth.getUser() to return a mock user
 */
export function mockAuthUser(user: { id: string; email?: string } | null = null) {
  const mock = getMockedSupabase();
  (mock.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user },
    error: null,
  });
  return user;
}

/**
 * Configure supabase.auth.getSession() to return a mock session
 */
export function mockAuthSession(
  session: { access_token: string; user: { id: string; email?: string } } | null = null
) {
  const mock = getMockedSupabase();
  (mock.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session },
    error: null,
  });
  return session;
}

/**
 * Reset all supabase mocks to their default state
 */
export function resetSupabaseMocks() {
  const mock = getMockedSupabase();
  jest.clearAllMocks();

  (mock.auth.getSession as jest.Mock).mockResolvedValue({ data: { session: null }, error: null });
  (mock.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });

  (mock.from as jest.Mock).mockReturnValue(createMockQueryBuilder());
}
