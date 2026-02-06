import { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCreateGrill, useCompleteOnboarding } from '@/hooks';
import { GrillForm } from '@/components/equipment';
import { Button, H2, Body, ConfirmDialog } from '@/components/ui';
import { useAnalytics } from '@/lib/analytics';

export default function AddGrillScreen() {
  const router = useRouter();
  const createGrill = useCreateGrill();
  const completeOnboarding = useCompleteOnboarding();
  const { trackOnboardingStepCompleted, trackOnboardingCompleted } = useAnalytics();
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    grill_type:
      | 'kamado'
      | 'gas'
      | 'charcoal'
      | 'pellet'
      | 'offset'
      | 'kettle'
      | 'electric'
      | 'other';
    brand: string;
    model: string;
    notes: string;
  }) => {
    try {
      const grill = await createGrill.mutateAsync({
        name: data.name,
        grill_type: data.grill_type,
        brand: data.brand || null,
        model: data.model || null,
        notes: data.notes || null,
      });
      // equipment_added event is tracked in useCreateGrill hook
      trackOnboardingStepCompleted('add_grill');
      // Navigate to add accessories for this grill
      router.push(
        `/onboarding/add-accessories?grillId=${grill.id}&grillName=${encodeURIComponent(grill.name)}`
      );
    } catch (error) {
      console.error('Failed to create grill:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding.mutateAsync();
      trackOnboardingCompleted();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Navigate anyway
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-char-black">
      <View className="flex-1">
        {/* Header */}
        <View className="p-6 pb-2">
          <H2 className="text-center mb-2">Add Your First Grill</H2>
          <Body className="text-char-300 text-center">
            Tell us about your grill so we can create personalized recipes
          </Body>
        </View>

        {/* Form */}
        <GrillForm
          onSubmit={handleSubmit}
          isLoading={createGrill.isPending}
          submitLabel="Continue"
          footer={
            <Button variant="ghost" onPress={() => setShowSkipConfirm(true)} fullWidth>
              Skip for now
            </Button>
          }
        />
      </View>

      {/* Skip Confirmation */}
      <ConfirmDialog
        visible={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        onConfirm={handleSkip}
        title="Skip Setup?"
        message="You can add your equipment later from the Equipment tab. Without equipment, recipes won't be personalized to your setup."
        confirmLabel="Skip"
        cancelLabel="Continue Setup"
        isLoading={completeOnboarding.isPending}
      />
    </SafeAreaView>
  );
}
