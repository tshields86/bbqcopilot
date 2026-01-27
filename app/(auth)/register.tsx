import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { H2, Body, BodySmall, Button, Input, PasswordInput } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return null;
  };

  const handleSignUp = async () => {
    // Validate inputs
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signUp(email.trim(), password);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      // Navigation will happen automatically via auth state change
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up with Google';
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <View className="bg-success/20 border border-success rounded-lg p-6 max-w-sm">
          <H2 className="text-center mb-4">Check Your Email</H2>
          <Body className="text-center mb-6">
            We've sent a confirmation link to {email}. Please check your inbox and click the link
            to verify your account.
          </Body>
          <Button variant="primary" fullWidth onPress={() => router.replace('/(auth)/login')}>
            Back to Sign In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-char-800"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 p-6">
          {/* Back Button */}
          <Pressable
            className="flex-row items-center mb-8 mt-12"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#F5F5F0" />
            <Body className="ml-2">Back</Body>
          </Pressable>

          {/* Header */}
          <View className="mb-8">
            <H2 className="mb-2">Create Account</H2>
            <Body color="muted">Join BBQCopilot to get personalized recipes</Body>
          </View>

          {/* Registration Form */}
          <View className="gap-4">
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
            />

            <PasswordInput
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              hint="Must be at least 8 characters"
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading || googleLoading}
            >
              Create Account
            </Button>

            {/* Divider */}
            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-char-600" />
              <Body color="muted" className="px-4">
                or
              </Body>
              <View className="flex-1 h-px bg-char-600" />
            </View>

            {/* Google Sign Up */}
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onPress={handleGoogleSignUp}
              loading={googleLoading}
              disabled={loading || googleLoading}
            >
              Continue with Google
            </Button>

            {/* Terms */}
            <BodySmall color="muted" className="text-center mt-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </BodySmall>

            {/* Sign In Link */}
            <View className="flex-row justify-center mt-4">
              <Body color="muted">Already have an account? </Body>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Body color="ember">Sign In</Body>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
