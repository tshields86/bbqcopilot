import { usePostHog } from 'posthog-react-native';
import { useCallback } from 'react';

// Types for analytics events - internal use, will be filtered before sending
interface RecipeGeneratedMetadata {
  recipe_id?: string;
  protein: string;
  grill_type: string;
  grill_brand?: string | null;
  servings?: number;
  skill_level?: string | null;
  generation_time_ms?: number | null;
}

interface CookEventMetadata {
  recipe_id: string;
  protein?: string;
  grill_type?: string;
}

interface CookCompletedMetadata extends CookEventMetadata {
  rating?: number;
  duration_minutes?: number;
  notes_added?: boolean;
}

interface EquipmentAddedMetadata {
  equipment_type: 'grill' | 'accessory';
  grill_type?: string;
  grill_brand?: string;
  accessory_type?: string;
}

interface SignupMetadata {
  method: 'google' | 'email';
}

// Helper to filter out undefined values (PostHog's JsonType doesn't accept undefined)
function filterUndefined<T extends object>(obj: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]: Exclude<T[K], undefined>;
  };
}

/**
 * Custom hook for tracking analytics events throughout the app.
 *
 * Usage:
 * ```
 * const analytics = useAnalytics();
 * analytics.trackRecipeGenerated({ protein: 'brisket', grill_type: 'kamado' });
 * ```
 */
export function useAnalytics() {
  const posthog = usePostHog();

  const trackRecipeGenerated = useCallback(
    (metadata: RecipeGeneratedMetadata) => {
      posthog?.capture('recipe_generated', filterUndefined(metadata));
    },
    [posthog]
  );

  const trackCookStarted = useCallback(
    (metadata: CookEventMetadata) => {
      posthog?.capture('cook_started', filterUndefined(metadata));
    },
    [posthog]
  );

  const trackCookCompleted = useCallback(
    (metadata: CookCompletedMetadata) => {
      posthog?.capture('cook_completed', filterUndefined(metadata));
    },
    [posthog]
  );

  const trackEquipmentAdded = useCallback(
    (metadata: EquipmentAddedMetadata) => {
      posthog?.capture('equipment_added', filterUndefined(metadata));
    },
    [posthog]
  );

  const trackSignup = useCallback(
    (metadata: SignupMetadata) => {
      posthog?.capture('user_signed_up', filterUndefined(metadata));
    },
    [posthog]
  );

  const trackOnboardingStarted = useCallback(() => {
    posthog?.capture('onboarding_started');
  }, [posthog]);

  const trackOnboardingCompleted = useCallback(() => {
    posthog?.capture('onboarding_completed');
  }, [posthog]);

  const trackOnboardingStepCompleted = useCallback(
    (step: string) => {
      posthog?.capture('onboarding_step_completed', { step });
    },
    [posthog]
  );

  const trackRecipeSaved = useCallback(
    (recipeId: string) => {
      posthog?.capture('recipe_saved', { recipe_id: recipeId });
    },
    [posthog]
  );

  const trackRecipeFavorited = useCallback(
    (recipeId: string) => {
      posthog?.capture('recipe_favorited', { recipe_id: recipeId });
    },
    [posthog]
  );

  const trackError = useCallback(
    (errorType: string, errorMessage: string, context?: Record<string, unknown>) => {
      posthog?.capture('error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        ...context,
      });
    },
    [posthog]
  );

  return {
    trackRecipeGenerated,
    trackCookStarted,
    trackCookCompleted,
    trackEquipmentAdded,
    trackSignup,
    trackOnboardingStarted,
    trackOnboardingCompleted,
    trackOnboardingStepCompleted,
    trackRecipeSaved,
    trackRecipeFavorited,
    trackError,
  };
}
