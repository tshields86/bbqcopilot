import { View, Text, ScrollView } from 'react-native';
import { Flame } from 'lucide-react-native';
import { FlameLoader, Card } from '@/components/ui';
import Animated, { FadeIn } from 'react-native-reanimated';

interface GeneratingViewProps {
  streamedContent: string;
  isGenerating: boolean;
}

export function GeneratingView({ streamedContent, isGenerating }: GeneratingViewProps) {
  return (
    <View className="flex-1">
      {/* Header */}
      <View className="items-center py-8">
        {isGenerating ? (
          <>
            <FlameLoader size="lg" />
            <Text className="font-display text-xl text-ash-white mt-4">
              Crafting Your Recipe
            </Text>
            <Text className="font-body text-char-300 mt-1">
              This may take a moment...
            </Text>
          </>
        ) : (
          <>
            <View className="w-16 h-16 rounded-full bg-success/20 items-center justify-center">
              <Flame size={32} color="#2D5A27" />
            </View>
            <Text className="font-display text-xl text-ash-white mt-4">
              Recipe Ready!
            </Text>
          </>
        )}
      </View>

      {/* Streaming content preview */}
      {streamedContent && (
        <ScrollView className="flex-1 mx-4" contentContainerClassName="pb-8">
          <Card variant="outlined">
            <Animated.View entering={FadeIn}>
              <Text className="font-mono text-sm text-char-300 leading-5">
                {streamedContent}
              </Text>
              {isGenerating && (
                <View className="flex-row items-center mt-2">
                  <View className="w-2 h-4 bg-ember-red animate-pulse" />
                </View>
              )}
            </Animated.View>
          </Card>
        </ScrollView>
      )}
    </View>
  );
}
