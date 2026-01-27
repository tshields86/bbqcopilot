import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#F5F5F0',
        contentStyle: { backgroundColor: '#1A1A1A' },
      }}
    />
  );
}
