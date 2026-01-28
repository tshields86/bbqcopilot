import { View, Text } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useRecipe, useCreateCookLog } from '@/hooks';
import { LogCookForm } from '@/components/recipe';
import { FlameLoader } from '@/components/ui';

export default function LogCookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading } = useRecipe(id);
  const createCookLog = useCreateCookLog();

  const handleSubmit = async (data: {
    rating: number | null;
    notes: string;
    whatWorked: string;
    whatToImprove: string;
    actualTimeMinutes: number | null;
  }) => {
    try {
      await createCookLog.mutateAsync({
        recipeId: id,
        rating: data.rating || undefined,
        notes: data.notes || undefined,
        whatWorked: data.whatWorked || undefined,
        whatToImprove: data.whatToImprove || undefined,
        actualTimeMinutes: data.actualTimeMinutes || undefined,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create cook log:', error);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Log Cook' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Log Cook',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
        }}
      />
      <View className="flex-1 bg-char-black">
        <LogCookForm
          recipeName={recipe?.title}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createCookLog.isPending}
        />
      </View>
    </>
  );
}
