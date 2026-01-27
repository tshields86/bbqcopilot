import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Flame, ChefHat, Clock } from 'lucide-react-native';

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-char-800 p-6">
      {/* Header */}
      <View className="flex-1 justify-center items-center">
        <View className="bg-ember-500 p-6 rounded-full mb-6">
          <Flame size={64} color="#F5F5F0" />
        </View>
        <Text className="text-4xl font-display text-ash text-center mb-4">
          Welcome to BBQCopilot
        </Text>
        <Text className="text-char-400 font-body text-center text-lg mb-8">
          Your AI-powered pitmaster assistant for perfect cooks every time
        </Text>

        {/* Features */}
        <View className="w-full max-w-sm space-y-4">
          <View className="flex-row items-center bg-char-700 p-4 rounded-card">
            <ChefHat size={24} color="#B87333" />
            <Text className="text-ash font-body ml-4">
              Personalized recipes for your equipment
            </Text>
          </View>
          <View className="flex-row items-center bg-char-700 p-4 rounded-card mt-4">
            <Clock size={24} color="#B87333" />
            <Text className="text-ash font-body ml-4">Detailed cook timelines</Text>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View className="mb-8">
        <Pressable
          className="bg-ember-500 rounded-button p-4 items-center active:bg-ember-600"
          onPress={() => router.push('/onboarding/add-grill')}
        >
          <Text className="text-ash font-body text-lg">Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}
