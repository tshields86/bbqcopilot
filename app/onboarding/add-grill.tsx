import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function AddGrillScreen() {
  return (
    <View className="flex-1 bg-char-800 p-6">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-display text-ash text-center mb-4">
          Add Your First Grill
        </Text>
        <Text className="text-char-400 font-body text-center mb-8">
          Tell us about your grill so we can create personalized recipes
        </Text>

        {/* Placeholder for grill selection */}
        <View className="bg-char-700 rounded-card p-6 mb-8">
          <Text className="text-ash font-body text-center">
            Grill selection form will go here
          </Text>
        </View>
      </View>

      <View className="mb-8">
        <Pressable
          className="bg-ember-500 rounded-button p-4 items-center mb-4 active:bg-ember-600"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-ash font-body text-lg">Continue</Text>
        </Pressable>
        <Pressable
          className="p-4 items-center"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-char-400 font-body">Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}
