import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function HistoryScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cook History',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
        }}
      />
      <View className="flex-1 bg-char-800 items-center justify-center p-6">
        <Text className="text-2xl font-display text-ash mb-4">Cook History</Text>
        <Text className="text-char-400 font-body text-center">
          Your past cooks will be logged here with notes and ratings.
        </Text>
      </View>
    </>
  );
}
