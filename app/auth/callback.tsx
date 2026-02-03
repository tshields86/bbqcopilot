import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { router } from 'expo-router';
import { Body, FlameLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  // Manually exchange the PKCE code or hash tokens on mount
  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    if (Platform.OS !== 'web') return;

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          // PKCE flow: exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error:', error);
            setError(error.message);
          }
        }
        // If no code, detectSessionInUrl may handle hash fragments automatically
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Failed to sign in. Please try again.');
      }
    };

    handleCallback();
  }, []);

  // Redirect once user is authenticated
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  // Redirect to login on error
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        router.replace('/(auth)/login');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <View className="flex-1 bg-char-800 items-center justify-center">
      <FlameLoader size="lg" />
      <Body color="muted" className="mt-4">
        {error || 'Signing you in...'}
      </Body>
    </View>
  );
}
