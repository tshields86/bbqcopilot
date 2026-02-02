import PostHog from 'posthog-react-native';

// Shared PostHog instance for use outside of React components (e.g., in hooks)
// This instance is initialized with the same config as PostHogProvider in _layout.tsx
export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
  host: process.env.EXPO_PUBLIC_POSTHOG_HOST,
});
