import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  return (
    <View className="flex-1 bg-char-800 p-6">
      {/* Back Button */}
      <Pressable
        className="flex-row items-center mb-8 mt-12"
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#F5F5F0" />
        <Text className="text-ash font-body ml-2">Back</Text>
      </Pressable>

      {/* Header */}
      <View className="mb-8">
        <Text className="text-3xl font-display text-ash mb-2">Create Account</Text>
        <Text className="text-char-400 font-body">
          Join BBQCopilot to get personalized recipes
        </Text>
      </View>

      {/* Registration Form Placeholder */}
      <View className="flex-1">
        <Pressable className="bg-ember-500 rounded-button p-4 items-center mb-4 active:bg-ember-600">
          <Text className="text-ash font-body text-lg">Sign Up</Text>
        </Pressable>

        <View className="flex-row justify-center mt-4">
          <Text className="text-char-400 font-body">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-ember-500 font-body">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}
