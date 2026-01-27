import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { FlameLoader } from '@/components/ui';

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-char-800">
        <FlameLoader size="lg" />
      </View>
    );
  }

  // Redirect based on auth state
  if (user) {
    // TODO: Check if onboarding is complete
    // For now, go directly to tabs
    return <Redirect href="/(tabs)" />;
  }

  // Not authenticated, go to login
  return <Redirect href="/(auth)/login" />;
}
