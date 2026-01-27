import { View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCreateGrill } from '@/hooks';
import { GrillForm } from '@/components/equipment';

export default function AddGrillScreen() {
  const router = useRouter();
  const createGrill = useCreateGrill();

  const handleSubmit = async (data: {
    name: string;
    grill_type: 'kamado' | 'gas' | 'charcoal' | 'pellet' | 'offset' | 'kettle' | 'electric' | 'other';
    brand: string;
    model: string;
    notes: string;
  }) => {
    try {
      await createGrill.mutateAsync({
        name: data.name,
        grill_type: data.grill_type,
        brand: data.brand || null,
        model: data.model || null,
        notes: data.notes || null,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create grill:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Grill',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
        }}
      />
      <View className="flex-1 bg-char-black">
        <GrillForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createGrill.isPending}
          submitLabel="Add Grill"
        />
      </View>
    </>
  );
}
