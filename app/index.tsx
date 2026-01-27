import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  // TODO: Check auth state and redirect accordingly
  // For now, redirect to tabs as placeholder
  return (
    <View className="flex-1 items-center justify-center bg-char-800">
      <ActivityIndicator size="large" color="#C41E3A" />
      <Text className="mt-4 text-ash font-body">Loading BBQCopilot...</Text>
    </View>
  );
}
