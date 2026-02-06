import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, Check, ArrowRight } from 'lucide-react-native';
import {
  useAccessories,
  useCreateAccessory,
  useCompleteOnboarding,
  useDeleteAccessory,
} from '@/hooks';
import { AccessoryForm, AccessoryCard } from '@/components/equipment';
import { Button, H2, Body, Card, FlameLoader } from '@/components/ui';
import { useAnalytics } from '@/lib/analytics';

export default function AddAccessoriesScreen() {
  const router = useRouter();
  const { grillId, grillName } = useLocalSearchParams<{ grillId: string; grillName: string }>();
  const { data: accessories, isLoading } = useAccessories(grillId);
  const createAccessory = useCreateAccessory();
  const deleteAccessory = useDeleteAccessory();
  const completeOnboarding = useCompleteOnboarding();
  const { trackOnboardingStepCompleted, trackOnboardingCompleted } = useAnalytics();
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddAccessory = async (data: {
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
        grill_id: grillId!,
        name: data.name,
        accessory_type: data.accessory_type,
        brand: data.brand || null,
        notes: data.notes || null,
      });
      // equipment_added event is tracked in useCreateAccessory hook
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create accessory:', error);
    }
  };

  const handleDeleteAccessory = async (accessoryId: string) => {
    try {
      await deleteAccessory.mutateAsync({ id: accessoryId, grillId: grillId! });
    } catch (error) {
      console.error('Failed to delete accessory:', error);
    }
  };

  const handleFinish = async () => {
    try {
      await completeOnboarding.mutateAsync();
      trackOnboardingStepCompleted('add_accessories');
      trackOnboardingCompleted();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      router.replace('/(tabs)');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-char-black items-center justify-center">
        <FlameLoader size="lg" />
      </SafeAreaView>
    );
  }

  if (showAddForm) {
    return (
      <SafeAreaView className="flex-1 bg-char-black">
        <View className="p-6 pb-2">
          <H2 className="text-center mb-2">Add Accessory</H2>
          <Body className="text-char-300 text-center">
            for {decodeURIComponent(grillName || '')}
          </Body>
        </View>
        <AccessoryForm
          onSubmit={handleAddAccessory}
          onCancel={() => setShowAddForm(false)}
          isLoading={createAccessory.isPending}
          submitLabel="Add Accessory"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-char-black">
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        {/* Header */}
        <H2 className="text-center mb-2">Add Accessories</H2>
        <Body className="text-char-300 text-center mb-6">
          Add any accessories for {decodeURIComponent(grillName || '')} (optional)
        </Body>

        {/* Accessory List */}
        {accessories && accessories.length > 0 ? (
          <View className="gap-3 mb-6">
            {accessories.map((accessory) => (
              <AccessoryCard
                key={accessory.id}
                accessory={accessory}
                onDelete={() => handleDeleteAccessory(accessory.id)}
              />
            ))}
          </View>
        ) : (
          <Card variant="outlined" className="items-center py-8 mb-6">
            <Text className="font-body text-char-300 text-center">No accessories added yet.</Text>
            <Text className="font-body text-sm text-char-300/70 text-center mt-1">
              Accessories help us tailor recipes to your setup.
            </Text>
          </Card>
        )}

        {/* Add Button */}
        <Button variant="secondary" onPress={() => setShowAddForm(true)} leftIcon={Plus} fullWidth>
          Add Accessory
        </Button>
      </ScrollView>

      {/* Footer */}
      <View className="p-6 pt-4 border-t border-char-500/10">
        <Button
          variant="primary"
          size="lg"
          onPress={handleFinish}
          loading={completeOnboarding.isPending}
          rightIcon={ArrowRight}
          fullWidth
        >
          {accessories && accessories.length > 0 ? 'Finish Setup' : 'Skip & Finish'}
        </Button>
      </View>
    </SafeAreaView>
  );
}
