import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { History, Plus } from 'lucide-react-native';
import { useCookLogs } from '@/hooks';
import { CookLogCard } from '@/components/recipe';
import { Button, FlameLoader } from '@/components/ui';
import type { CookLog } from '@/lib/types';

export default function HistoryScreen() {
  const router = useRouter();
  const { data: logs, isLoading, isRefetching, refetch } = useCookLogs();

  const handleLogPress = (log: CookLog) => {
    router.push(`/history/${log.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cook History' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
          <Text className="font-body text-char-300 mt-4">Loading history...</Text>
        </View>
      </>
    );
  }

  // Empty state
  if (!logs || logs.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cook History' }} />
        <View className="flex-1 bg-char-black items-center justify-center p-6">
          <View className="w-16 h-16 rounded-full bg-copper-glow/20 items-center justify-center mb-4">
            <History size={32} color="#B87333" />
          </View>
          <Text className="font-display text-xl text-ash-white text-center mb-2">
            No Cooks Logged Yet
          </Text>
          <Text className="font-body text-char-300 text-center mb-6">
            Log your cooks to track what works and improve over time.
          </Text>
          <Button variant="primary" onPress={() => router.push('/(tabs)/cook')} leftIcon={Plus}>
            Start a New Cook
          </Button>
        </View>
      </>
    );
  }

  // Group logs by month
  const groupedLogs = logs.reduce(
    (acc, log) => {
      const date = new Date(log.cooked_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!acc[monthKey]) {
        acc[monthKey] = { label: monthLabel, logs: [] };
      }
      acc[monthKey].logs.push(log);
      return acc;
    },
    {} as Record<string, { label: string; logs: CookLog[] }>
  );

  const sections = Object.entries(groupedLogs)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, value]) => ({ key, ...value }));

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cook History',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
        }}
      />
      <View className="flex-1 bg-char-black">
        <FlatList
          data={sections}
          keyExtractor={(item) => item.key}
          contentContainerClassName="p-4"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#B87333" />
          }
          renderItem={({ item: section }) => (
            <View className="mb-6">
              <Text className="font-display text-lg text-ash-white mb-3">{section.label}</Text>
              <View className="gap-3">
                {section.logs.map((log) => (
                  <CookLogCard key={log.id} log={log} onPress={() => handleLogPress(log)} />
                ))}
              </View>
            </View>
          )}
        />
      </View>
    </>
  );
}
