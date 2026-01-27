import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function EquipmentScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Equipment',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
        }}
      />
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <Text className="text-2xl font-display text-ash mb-4">Your Equipment</Text>
        <Text className="text-char-400 font-body text-center">
          Add your grills and accessories to get personalized recipes.
        </Text>
      </View>
    </>
  );
}
