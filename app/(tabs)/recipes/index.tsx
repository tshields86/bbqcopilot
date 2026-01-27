import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function RecipesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Recipes',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
        }}
      />
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <Text className="text-2xl font-display text-ash mb-4">Your Recipes</Text>
        <Text className="text-char-400 font-body text-center">
          Saved recipes will appear here. Start a cook to generate your first recipe!
        </Text>
      </View>
    </>
  );
}
