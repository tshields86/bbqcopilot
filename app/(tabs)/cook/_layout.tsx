import { Stack } from 'expo-router';
import { CookProvider } from '@/contexts/CookContext';

export default function CookLayout() {
  return (
    <CookProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
          contentStyle: { backgroundColor: '#1A1A1A' },
        }}
      />
    </CookProvider>
  );
}
