import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/components/auth';

export default function OnboardingLayout() {
  return (
    <ProtectedRoute>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1A1A1A' },
        }}
      />
    </ProtectedRoute>
  );
}
