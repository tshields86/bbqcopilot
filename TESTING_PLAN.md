# Testing Strategy for BBQCopilot

## Scope
- Main Expo app only (lib/, hooks/, contexts/, components/)
- CI/CD via GitHub Actions
- All 5 phases targeting 75-80% coverage

## Framework & Libraries

**Jest with `jest-expo`** — the officially supported test runner for Expo. Handles all React Native module transforms out of the box.

```
jest-expo                          — Expo Jest preset
@testing-library/react-native     — Component/hook testing
@testing-library/jest-native       — Extended matchers (toBeVisible, toBeDisabled)
jest-fetch-mock                    — Fetch mocking for API tests
```

## Test File Convention

Mirror source structure under `__tests__/`:
```
__tests__/
  helpers/
    mockSupabase.ts          # Reusable Supabase mock factory
    testQueryWrapper.tsx     # QueryClientProvider wrapper
    testFixtures.ts          # Shared mock data (grills, recipes, timelines)
  lib/
    timeUtils.test.ts
    api.test.ts
  hooks/
    useGrills.test.ts
    useRecipes.test.ts
    useFavorites.test.ts
    useAccessories.test.ts
    useCookLogs.test.ts
    useProfile.test.ts
    useUsage.test.ts
  contexts/
    CookContext.test.tsx
    AuthContext.test.tsx
  components/
    equipment/
      GrillForm.test.tsx
    recipe/
      LogCookForm.test.tsx
      RecipeTimeline.test.tsx
    cook/
      ClarificationChat.test.tsx
    ui/
      ErrorBoundary.test.tsx
```

---

## Phase 1: Foundation + Pure Functions

### 1a. Install dependencies and configure Jest

**Files to create/modify:**
- `package.json` — add devDependencies + scripts (`test`, `test:watch`, `test:coverage`)
- `jest.config.ts` — preset `jest-expo`, path alias mapping (`@/*`, `@components/*`, etc.), `transformIgnorePatterns` for RN ecosystem packages, coverage collection config
- `jest.setup.ts` — global mocks for platform modules:
  - `expo-haptics`, `expo-secure-store`, `expo-linking`, `expo-web-browser`
  - `react-native-reanimated/mock`
  - `lucide-react-native` (stub icons)
  - `@/lib/supabase` (mock client)
  - `@/lib/posthog` (mock capture)
  - `posthog-react-native` (mock provider/hook)
  - `nativewind` (no-op CSS)

### 1b. Create test helpers

**`__tests__/helpers/mockSupabase.ts`** — Chainable mock factory for `supabase.from().select().eq()...` patterns
**`__tests__/helpers/testQueryWrapper.tsx`** — Wraps component in `QueryClientProvider` with `retry: false`
**`__tests__/helpers/testFixtures.ts`** — Mock data: grills, accessories, recipes, timelines, profiles, users

### 1c. Test pure utility functions

**`__tests__/lib/timeUtils.test.ts`** (~35 cases) — Source: `lib/timeUtils.ts`
- `parseTimeString` — AM/PM parsing, 24h format, midnight/noon edge cases, invalid input
- `formatTime12Hour` — midnight, noon, overflow wrapping, negative hours
- `timeToMinutes` / `minutesToTime` — round-trip, negative wrapping, >24h wrapping
- `calculateAbsoluteTime` — day boundary crossing, negative relative hours
- `recalculateTimeline` — full timeline recalc, invalid time passthrough
- `formatRelativeTime` — hours, minutes, fractional, zero (serving time), positive
- `getStartTime` — empty timeline, finds earliest step
- `getTimeUntilStart` — remaining time calculation
- `validateEatingTime` — format validation

**`__tests__/lib/api.test.ts`** (initial ~8 cases) — Source: `lib/api.ts`
- `isRateLimitError` — type guard: true for RateLimitError shape, false for Error/null/undefined
- `formatResetDate` — date string formatting

**`__tests__/hooks/useUsage.test.ts`** (initial ~6 cases) — Source: `hooks/useUsage.ts`
- `isApproachingLimit()` — threshold detection for free tier
- `hasHitLimit()` — zero remaining + limited tier

**`__tests__/hooks/useCookLogs.test.ts`** (initial ~4 cases) — Source: `hooks/useCookLogs.ts`
- `getAverageRating()` — empty array, null ratings, mixed values

**`__tests__/hooks/useGrills.test.ts`** (initial ~3 cases) — Source: `hooks/useGrills.ts`
- `getPrimaryGrill()` — undefined, empty, primary found, fallback to first

**Coverage target: ~15% global, 100% of `lib/timeUtils.ts`**

---

## Phase 2: API Client + React Query Hooks

### 2a. API client full tests

**`__tests__/lib/api.test.ts`** (extend to ~20 cases) — Source: `lib/api.ts`
- `generateRecipe()` — auth header inclusion, SSE stream parsing (data: lines), `[DONE]` signal, 429 rate limit detection → `RateLimitError`, non-rate-limit errors, missing auth
- `askClarification()` — correct POST payload, parsed response, auth failure, error response
- `getAuthHeader()` — extracts JWT from session, returns null when no session

### 2b. React Query hook tests

Mocking strategy: module-mock `@/lib/supabase`, wrap in `testQueryWrapper`, assert cache behavior.

**`__tests__/hooks/useGrills.test.ts`** (extend to ~20 cases)
- `useGrills()` — fetches with nested accessories, ordered by primary
- `useGrill(id)` — conditional fetch when id present
- `useCreateGrill()` — optimistic add with temp ID, rollback on error, invalidates cache, sets `is_primary` for first grill, PostHog capture
- `useUpdateGrill()` — optimistic update, rollback, invalidates single + list queries
- `useDeleteGrill()` — optimistic remove, rollback
- `useSetPrimaryGrill()` — unsets others, sets target

**`__tests__/hooks/useRecipes.test.ts`** (~12 cases)
- `useRecipes()` — fetch sorted by date
- `useRecipe(id)` — conditional fetch, includes grill join
- `useSaveRecipe()` — insert with correct shape, PostHog capture, invalidates cache
- `useDeleteRecipe()` — optimistic remove, rollback

**`__tests__/hooks/useFavorites.test.ts`** (~10 cases)
- `useFavorites()` — fetch with recipe join
- `useIsFavorite(id)` — boolean check
- `useToggleFavorite()` — adds when not favorited, removes when favorited, optimistic update, PostHog capture

**`__tests__/hooks/useAccessories.test.ts`** (~14 cases)
- `useAccessories(grillId)` — fetch for specific grill
- `useCreateAccessory()` — insert, invalidates both accessories and grills queries
- `useUpdateAccessory()` — finds parent grill dynamically, updates cache
- `useDeleteAccessory()` — optimistic remove, cascading invalidation

**`__tests__/hooks/useCookLogs.test.ts`** (extend to ~12 cases)
- Full CRUD query + mutation tests
- `useCookLogsForRecipe(id)` — filtered fetch

**`__tests__/hooks/useProfile.test.ts`** (~10 cases)
- `useProfile()` — user-scoped cache key
- `useUpdateProfile()` — optimistic update
- `useCompleteOnboarding()` — sets flag

**`__tests__/hooks/useUsage.test.ts`** (extend to ~10 cases)
- `useUsage()` — query with 1-min stale time, calculates remaining

**Coverage target: ~40% global, 80%+ of hooks/ and lib/**

---

## Phase 3: Context Providers

### 3a. CookContext

**`__tests__/contexts/CookContext.test.tsx`** (~25 cases) — Source: `contexts/CookContext.tsx`

Mock: `@/lib/api` (generateRecipe, askClarification), `@/hooks` (useProfile), posthog

- **Initial state** — step='input', nulls, empty arrays
- **setSelectedGrill / setUserInput** — simple state updates
- **startClarification** — error on missing grill/input, calls askClarification with equipment profile, handles ready=true (skip to generating), handles ready=false (populates questions), pre-populates skill_level from profile, error step on API failure
- **answerQuestion** — adds new answer, updates existing by id
- **submitAnswers** — sends answers, appends new questions or marks ready
- **generateRecipeFromAnswers** — double-call guard (ref), sets isGenerating, accumulates streamed content, parses JSON (handles ```json blocks), sets recipe + step='complete', PostHog event with timing, rate limit error handling, general error handling
- **reset** — restores initial state
- **useCook outside provider** — throws

### 3b. AuthContext

**`__tests__/contexts/AuthContext.test.tsx`** (~18 cases) — Source: `contexts/AuthContext.tsx`

Mock: `@/lib/supabase`, `@tanstack/react-query`, expo-linking, expo-web-browser, Platform

- **Initialization** — calls getSession, sets session/user, sets loading=false, subscribes to onAuthStateChange, PASSWORD_RECOVERY event sets isRecovery
- **signIn** — calls signInWithPassword, throws on failure
- **signUp** — calls signUp, PostHog capture, no double-track
- **signInWithGoogle** — OAuth with redirect, platform-specific browser handling
- **signOut** — calls signOut, clears QueryClient cache
- **resetPassword / updatePassword / clearRecovery** — correct Supabase calls
- **useAuth outside provider** — throws
- **Deep link handling** — token extraction from URL hash

**Coverage target: ~55% global, 80%+ of contexts/**

---

## Phase 4: Component Tests

Focus on components with meaningful logic (forms, interactions, conditional rendering). Skip purely presentational components.

### Tier A — High Value

**`__tests__/components/equipment/GrillForm.test.tsx`** (~10 cases)
- Renders all fields, brand suggestions, validation errors on empty submit, calls onSubmit with trimmed data, loading/disabled states, pre-populates from initialData

**`__tests__/components/recipe/LogCookForm.test.tsx`** (~10 cases)
- Rating flame interaction, label text per rating, onSubmit data shape, time conversion (hours to minutes), empty optional fields as null, loading state

**`__tests__/components/cook/ClarificationChat.test.tsx`** (~8 cases)
- Renders questions with options, answer selection, submit state, multiple question flow

**`__tests__/components/recipe/RecipeTimeline.test.tsx`** (~10 cases)
- Time display per step, eating time picker, timeline recalculation on time change, step grouping

**`__tests__/components/ui/ErrorBoundary.test.tsx`** (~6 cases)
- Renders children normally, catches thrown error, shows fallback, retry resets error state

**Coverage target: ~65% global**

---

## Phase 5: Integration Tests + Remaining Coverage

### 5a. Additional component tests (Tier B)

- `AccessoryForm.test.tsx` (~6 cases) — validation, submit
- `GrillList.test.tsx` (~5 cases) — list rendering, empty state
- `RecipeCard.test.tsx` (~5 cases) — conditional rendering, press handler
- `RecipeView.test.tsx` (~6 cases) — sub-component integration
- `CookInput.test.tsx` (~5 cases) — input handling, submit
- `GrillSelector.test.tsx` (~4 cases) — selection
- `ProtectedRoute.test.tsx` (~4 cases) — auth guard behavior
- `ConfirmDialog.test.tsx` (~4 cases) — confirm/cancel callbacks
- `Button.test.tsx` (~5 cases) — variants, loading, disabled, haptics
- `Input.test.tsx` (~5 cases) — error/success states, password toggle

### 5b. Cook flow integration test

Test the full flow: select grill → enter input → receive questions → answer → generate → view recipe. Uses CookProvider with mocked API.

### 5c. Ratchet up coverage thresholds

Final `jest.config.ts` thresholds:
```
global:     { branches: 50, functions: 60, lines: 60, statements: 60 }
lib/:       { branches: 80, functions: 90, lines: 90, statements: 90 }
hooks/:     { branches: 70, functions: 80, lines: 75, statements: 75 }
contexts/:  { branches: 60, functions: 70, lines: 70, statements: 70 }
```

**Coverage target: ~75-80% global**

---

## Phase 6: CI/CD Pipeline

**`.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup node 20 with npm cache
      - npm ci
      - npm run lint
      - npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - checkout
      - setup node 20 with npm cache
      - npm ci
      - npm test -- --coverage --ci
        (env vars: dummy SUPABASE_URL, ANON_KEY, POSTHOG_KEY)
      - upload coverage artifact
```

This runs on every push to main and every PR. Lint + typecheck gate before tests.

---

## Execution Summary

| Phase | New Test Files | Approx Cases | Cumulative Coverage |
|-------|---------------|-------------|-------------------|
| 1: Foundation + Pure Functions | 5 + 3 helpers + config | ~56 | ~15% |
| 2: API + Hooks | 3 new + 5 extended | ~92 | ~40% |
| 3: Contexts | 2 | ~43 | ~55% |
| 4: Components (Tier A) | 5 | ~44 | ~65% |
| 5: Integration + Tier B | 10+ | ~50+ | ~75-80% |
| 6: CI/CD | 1 workflow | — | — |
| **Total** | **~28-30 test files** | **~285+** | **75-80%** |
