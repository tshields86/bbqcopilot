import { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { H2, Body, Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <View className="items-center max-w-sm">
          <View className="bg-ember-500/20 p-4 rounded-full mb-6">
            <Mail size={48} color="#C41E3A" />
          </View>
          <H2 className="text-center mb-4">Check Your Email</H2>
          <Body className="text-center mb-8" color="muted">
            If an account exists for {email}, you'll receive a password reset link shortly.
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
            <H2 className="mb-2">Reset Password</H2>
            <Body color="muted">
              Enter your email address and we'll send you a link to reset your password.
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

            <Input
              label="Email"
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-2"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
            >
              Send Reset Link
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
