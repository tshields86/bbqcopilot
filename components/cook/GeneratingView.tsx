import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Flame } from 'lucide-react-native';
import { FlameLoader } from '@/components/ui';
import Animated, { FadeIn } from 'react-native-reanimated';
import { RecipeSkeleton } from './RecipeSkeleton';

interface GeneratingViewProps {
  isGenerating: boolean;
}

const stageMessages: Record<number, string> = {
  1: 'Analyzing your equipment...',
  2: 'Selecting the perfect technique...',
  3: 'Building your cook timeline...',
  4: 'Adding finishing touches...',
  5: 'Almost there...',
};

export function GeneratingView({ isGenerating }: GeneratingViewProps) {
  const [stage, setStage] = useState(1);

  // Reset stage when generation starts
  useEffect(() => {
    if (isGenerating) setStage(1);
  }, [isGenerating]);

  // Advance through stages on timers
  useEffect(() => {
    if (!isGenerating) return;

    const timers = [
      setTimeout(() => setStage(2), 3000),
      setTimeout(() => setStage(3), 8000),
      setTimeout(() => setStage(4), 15000),
      setTimeout(() => setStage(5), 25000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="items-center py-8">
        {isGenerating ? (
          <>
            <FlameLoader size="lg" />
            <Text className="font-display text-xl text-ash-white mt-4">Crafting Your Recipe</Text>
            <Animated.View key={stage} entering={FadeIn.duration(300)}>
              <Text className="font-body text-char-200 mt-1">{stageMessages[stage]}</Text>
            </Animated.View>
          </>
        ) : (
          <>
            <View className="w-16 h-16 rounded-full bg-success/20 items-center justify-center">
              <Flame size={32} color="#2D5A27" />
            </View>
            <Text className="font-display text-xl text-ash-white mt-4">Recipe Ready!</Text>
          </>
        )}
      </View>

      {/* Skeleton preview */}
      {isGenerating && (
        <ScrollView className="flex-1 mx-4" contentContainerClassName="pb-8">
          <RecipeSkeleton stage={stage} />
        </ScrollView>
      )}
    </View>
  );
}
