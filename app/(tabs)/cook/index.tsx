import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function CookScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Cook',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
        }}
      />
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <Text className="text-2xl font-display text-ash mb-4">Start a New Cook</Text>
        <Text className="text-char-400 font-body text-center">
          Tell us what you want to cook and we'll create a personalized recipe for your equipment.
        </Text>
      </View>
    </>
  );
}
