import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Flame } from 'lucide-react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-char-800 items-center justify-center p-6">
      {/* Logo */}
      <View className="items-center mb-12">
        <View className="bg-ember-500 p-4 rounded-full mb-4">
          <Flame size={48} color="#F5F5F0" />
        </View>
        <Text className="text-4xl font-display text-ash">BBQCopilot</Text>
        <Text className="text-char-400 font-body mt-2">Your AI-powered pitmaster</Text>
      </View>

      {/* Login Form Placeholder */}
      <View className="w-full max-w-sm">
        <Pressable className="bg-ember-500 rounded-button p-4 items-center mb-4 active:bg-ember-600">
          <Text className="text-ash font-body text-lg">Sign In</Text>
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable className="border border-char-500 rounded-button p-4 items-center active:bg-char-700">
            <Text className="text-ash font-body text-lg">Create Account</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
