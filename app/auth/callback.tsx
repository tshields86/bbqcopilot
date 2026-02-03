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

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    if (Platform.OS !== 'web') return;

    const handleCallback = async () => {
      try {
        // Check for PKCE code in query params
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error:', error);
            setError(error.message);
            return;
          }
        }

        // Check for tokens in hash fragment (implicit flow)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) {
              console.error('Session set error:', error);
              setError(error.message);
              return;
            }
          }
        }

        // If no code or hash tokens, detectSessionInUrl may have already handled it.
        // Poll getSession to check.
        if (!code && !window.location.hash) {
          let attempts = 0;
          const maxAttempts = 10;
          const poll = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              router.replace('/');
              return;
            }
            attempts++;
            if (attempts >= maxAttempts) {
              console.error('Auth callback: no session found after polling');
              setError('Failed to sign in. Please try again.');
            } else {
              setTimeout(poll, 500);
            }
          };
          poll();
        }
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
