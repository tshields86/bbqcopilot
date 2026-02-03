import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks';
import { FlameLoader } from '@/components/ui';

export default function Index() {
  const { user, loading: authLoading, isRecovery } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-char-black">
        <FlameLoader size="lg" />
      </View>
    );
  }

  // Password recovery flow — redirect to reset-password screen
  if (isRecovery) {
    return <Redirect href="/auth/reset-password" />;
  }

  // Not authenticated, go to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Still loading profile
  if (profileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-char-black">
        <FlameLoader size="lg" />
      </View>
    );
  }

  // Check if onboarding is complete
  if (!profile?.onboarding_completed) {
    return <Redirect href="/onboarding/welcome" />;
  }

  // Authenticated and onboarded, go to main app
  return <Redirect href="/(tabs)" />;
}
