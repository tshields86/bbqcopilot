import { View } from 'react-native';
import { Link } from 'expo-router';
import { Flame } from 'lucide-react-native';
import { H1, Body, Button, Input, PasswordInput } from '@/components/ui';

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-char-800 items-center justify-center p-6">
      {/* Logo */}
      <View className="items-center mb-12">
        <View className="bg-ember-500 p-4 rounded-full mb-4">
          <Flame size={48} color="#F5F5F0" />
        </View>
        <H1>BBQCopilot</H1>
        <Body color="muted" className="mt-2">
          Your AI-powered pitmaster
        </Body>
      </View>

      {/* Login Form */}
      <View className="w-full max-w-sm gap-4">
        <Input
          label="Email"
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <PasswordInput label="Password" placeholder="Enter your password" />

        <Button variant="primary" size="lg" fullWidth className="mt-2">
          Sign In
        </Button>

        <Link href="/(auth)/register" asChild>
          <Button variant="secondary" size="lg" fullWidth>
            Create Account
          </Button>
        </Link>
      </View>
    </View>
  );
}
