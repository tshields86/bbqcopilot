import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Body, FlameLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // detectSessionInUrl (configured in lib/supabase.ts) automatically processes
    // the tokens from the URL hash and fires onAuthStateChange.
    // Once auth resolves with a user, redirect to root.
    if (!loading && user) {
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
