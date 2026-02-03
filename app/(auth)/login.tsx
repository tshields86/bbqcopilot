import { useState } from 'react';
import { View, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter, Href } from 'expo-router';
import { Body, BodySmall, Button, Input, PasswordInput, Logo, LogoIcon } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      // Explicitly navigate to root, which will redirect based on auth/onboarding state
      router.replace('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      // On web, signInWithOAuth triggers a full-page redirect to Google,
      // so we don't navigate here — the browser will leave this page.
      // On native, the session is set in signInWithGoogle, so navigate to root.
      if (Platform.OS !== 'web') {
        router.replace('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(message);
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-char-800"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center p-6">
          {/* Logo */}
          <View className="items-center mb-10">
            <View className="mb-4">
              <LogoIcon size="xl" />
            </View>
            <Logo size="xl" />
            <Body color="muted" className="mt-2">
              Your AI-powered pitmaster
            </Body>
          </View>

          {/* Login Form */}
          <View className="w-full max-w-sm gap-4">
            {error && (
              <View className="bg-error/20 border border-error rounded-lg p-3">
                <Body color="error" className="text-center">
                  {error}
                </Body>
              </View>
            )}

            <Input
              label="Email"
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              state={error ? 'error' : 'default'}
            />

            <View>
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                state={error ? 'error' : 'default'}
              />
              <Link href={'/(auth)/forgot-password' as Href} asChild>
                <Pressable className="mt-2 self-end">
                  <BodySmall color="ember">Forgot password?</BodySmall>
                </Pressable>
              </Link>
            </View>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading || googleLoading}
            >
              Sign In
            </Button>

            {/* Divider */}
            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-char-600" />
              <Body color="muted" className="px-4">
                or
              </Body>
              <View className="flex-1 h-px bg-char-600" />
            </View>

            {/* Google Sign In */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleGoogleSignIn}
              loading={googleLoading}
              disabled={loading || googleLoading}
            >
              Continue with Google
            </Button>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-4">
              <Body color="muted">Don't have an account? </Body>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Body color="ember">Sign Up</Body>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
