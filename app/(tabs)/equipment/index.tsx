import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGrills } from '@/hooks';
import { GrillList } from '@/components/equipment';
import type { Grill } from '@/lib/types';

export default function EquipmentScreen() {
  const router = useRouter();
  const { data: grills, isLoading, isRefetching, refetch } = useGrills();

  const handleGrillPress = (grill: Grill) => {
    router.push(`/equipment/${grill.id}`);
  };

  const handleAddPress = () => {
    router.push('/equipment/add');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Equipment',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
        }}
      />
      <View className="flex-1 bg-char-black">
        <GrillList
          grills={grills}
          isLoading={isLoading}
          isRefetching={isRefetching}
          onRefresh={refetch}
          onGrillPress={handleGrillPress}
          onAddPress={handleAddPress}
        />
      </View>
    </>
  );
}
