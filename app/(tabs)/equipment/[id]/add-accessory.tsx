import { View, Text } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useGrill, useCreateAccessory } from '@/hooks';
import { AccessoryForm } from '@/components/equipment';
import { FlameLoader } from '@/components/ui';

export default function AddAccessoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: grill, isLoading } = useGrill(id);
  const createAccessory = useCreateAccessory();

  if (isLoading || !grill) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
        </View>
      </>
    );
  }

  const handleSubmit = async (data: {
    name: string;
    accessory_type:
      | 'rotisserie'
      | 'griddle'
      | 'pizza_stone'
      | 'soapstone'
      | 'smoking_stone'
      | 'grill_expander'
      | 'heat_deflector'
      | 'cold_smoker'
      | 'thermometer'
      | 'cover'
      | 'other';
    brand: string;
    notes: string;
  }) => {
    try {
      await createAccessory.mutateAsync({
        grill_id: grill.id,
        name: data.name,
        accessory_type: data.accessory_type,
        brand: data.brand || null,
        notes: data.notes || null,
      });
      router.back();
    } catch (error) {
      console.error('Failed to create accessory:', error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Add Accessory to ${grill.name}`,
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
        }}
      />
      <View className="flex-1 bg-char-black">
        <AccessoryForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createAccessory.isPending}
          submitLabel="Add Accessory"
        />
      </View>
    </>
  );
}
