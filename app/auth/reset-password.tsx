import { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Lock, CheckCircle } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { H2, Body, Button, PasswordInput, FlameLoader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const { user, loading: authLoading, updatePassword, clearRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Handle the recovery token from the URL
  useEffect(() => {
    if (Platform.OS === 'web') {
      // On web, Supabase's detectSessionInUrl (configured in lib/supabase.ts)
      // automatically extracts and processes recovery tokens from the URL.
      // We just need to wait for auth loading to finish, then check for a session.
      if (!authLoading) {
        if (user) {
          setInitializing(false);
        } else {
          // detectSessionInUrl may still be exchanging the PKCE code.
          // Wait briefly, then check again before showing an error.
          const timeout = setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              setSessionError('Invalid or expired reset link. Please request a new one.');
            }
            setInitializing(false);
          }, 2000);
          return () => clearTimeout(timeout);
        }
      }
    } else {
      // On native, manually extract tokens from the deep link URL hash
      handleNativeRecoveryToken();
    }
  }, [authLoading, user]);

  const handleNativeRecoveryToken = async () => {
    try {
      const url = await Linking.getInitialURL();

      if (!url) {
        setSessionError('Invalid reset link. Please request a new password reset.');
        setInitializing(false);
        return;
      }

      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) {
        setSessionError('Invalid reset link. Please request a new password reset.');
        setInitializing(false);
        return;
      }

      const hash = url.substring(hashIndex + 1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setSessionError('Invalid or expired reset link. Please request a new one.');
        }
      } else {
        setSessionError('Invalid reset link. Please request a new password reset.');
      }
    } catch (err) {
      console.error('Error handling recovery token:', err);
      setSessionError('Something went wrong. Please try again.');
    } finally {
      setInitializing(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError(null);

    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    clearRecovery();
    router.replace('/(auth)/login');
  };

  // Loading state while checking token
  if (initializing) {
    return (
      <View className="flex-1 bg-char-800 items-center justify-center">
        <FlameLoader size="lg" />
        <Body color="muted" className="mt-4">Verifying reset link...</Body>
      </View>
    );
  }

  // Session error (invalid/expired token)
  if (sessionError) {
    return (
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <View className="items-center max-w-sm">
          <View className="bg-error/20 p-4 rounded-full mb-6">
            <Lock size={48} color="#8B2635" />
          </View>
          <H2 className="text-center mb-4">Link Expired</H2>
          <Body className="text-center mb-8" color="muted">
            {sessionError}
          </Body>
          <Button
            variant="primary"
            fullWidth
            onPress={() => {
              clearRecovery();
              router.replace('/(auth)/forgot-password');
            }}
          >
            Request New Link
          </Button>
          <Button
            variant="ghost"
            fullWidth
            className="mt-3"
            onPress={handleGoToLogin}
          >
            Back to Sign In
          </Button>
        </View>
      </View>
    );
  }

  // Success state
  if (success) {
    return (
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <View className="items-center max-w-sm">
          <View className="bg-success/20 p-4 rounded-full mb-6">
            <CheckCircle size={48} color="#2D5A27" />
          </View>
          <H2 className="text-center mb-4">Password Updated!</H2>
          <Body className="text-center mb-8" color="muted">
            Your password has been successfully updated. You can now sign in with your new password.
          </Body>
          <Button variant="primary" fullWidth onPress={handleGoToLogin}>
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  // Password reset form
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-char-800"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 p-6 justify-center">
          {/* Header */}
          <View className="mb-8">
            <View className="bg-ember-500/20 p-4 rounded-full mb-6 self-start">
              <Lock size={32} color="#C41E3A" />
            </View>
            <H2 className="mb-2">Create New Password</H2>
            <Body color="muted">
              Enter your new password below. Make sure it's at least 6 characters.
            </Body>
          </View>

          {/* Form */}
          <View className="gap-4">
            {error && (
              <View className="bg-error/20 border border-error rounded-lg p-3">
                <Body color="error" className="text-center">
                  {error}
                </Body>
              </View>
            )}

            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={setPassword}
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoComplete="new-password"
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2"
              onPress={handleUpdatePassword}
              loading={loading}
              disabled={loading}
            >
              Update Password
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
