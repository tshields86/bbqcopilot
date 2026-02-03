import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Body, FlameLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackScreen() {
  const { user, loading } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // User is authenticated — redirect to root
    if (user) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      router.replace('/');
      return;
    }

    // If auth is done loading but still no user after detectSessionInUrl
    // should have processed the tokens, wait a bit then fall back to login
    if (!loading && !user) {
      timeoutRef.current = setTimeout(() => {
        router.replace('/(auth)/login');
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loading, user]);

  return (
    <View className="flex-1 bg-char-800 items-center justify-center">
      <FlameLoader size="lg" />
      <Body color="muted" className="mt-4">Signing you in...</Body>
    </View>
  );
}
