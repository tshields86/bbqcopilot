import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Body, FlameLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Once auth state is resolved, redirect to root which handles routing
      router.replace('/');
    }
  }, [loading, user]);

  return (
    <View className="flex-1 bg-char-800 items-center justify-center">
      <FlameLoader size="lg" />
      <Body color="muted" className="mt-4">Signing you in...</Body>
    </View>
  );
}
