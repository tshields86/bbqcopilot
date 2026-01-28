import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Button, FlameLoader } from '@/components/ui';
import { GrillCard } from './GrillCard';
import type { Grill } from '@/lib/types';

interface GrillListProps {
  grills: Grill[] | undefined;
  isLoading: boolean;
  isRefetching: boolean;
  onRefresh: () => void;
  onGrillPress: (grill: Grill) => void;
  onAddPress: () => void;
}

export function GrillList({
  grills,
  isLoading,
  isRefetching,
  onRefresh,
  onGrillPress,
  onAddPress,
}: GrillListProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <FlameLoader size="lg" />
        <Text className="font-body text-char-300 mt-4">Loading your grills...</Text>
      </View>
    );
  }

  if (!grills?.length) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="font-display text-2xl text-ash-white text-center mb-2">
          No Grills Yet
        </Text>
        <Text className="font-body text-char-300 text-center mb-6">
          Add your first grill to get personalized recipes tailored to your equipment.
        </Text>
        <Button variant="primary" onPress={onAddPress} leftIcon={Plus}>
          Add Your First Grill
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      data={grills}
      keyExtractor={(item) => item.id}
      contentContainerClassName="p-4 gap-3"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={onRefresh}
          tintColor="#B87333"
        />
      }
      renderItem={({ item }) => (
        <GrillCard
          grill={item}
          onPress={() => onGrillPress(item)}
        />
      )}
      ListFooterComponent={
        <Button
          variant="secondary"
          onPress={onAddPress}
          leftIcon={Plus}
          className="mt-4"
        >
          Add Another Grill
        </Button>
      }
    />
  );
}
