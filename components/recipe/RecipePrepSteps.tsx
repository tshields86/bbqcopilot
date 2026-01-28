import { View, Text } from 'react-native';
import { Clock } from 'lucide-react-native';
import { Card, H3 } from '@/components/ui';
import type { PrepStep } from '@/lib/types';

interface RecipePrepStepsProps {
  steps: PrepStep[];
}

export function RecipePrepSteps({ steps }: RecipePrepStepsProps) {
  return (
    <Card variant="outlined" className="mb-4">
      <H3 className="mb-4">Preparation</H3>
      <View className="gap-4">
        {steps.map((step, index) => (
          <View key={index} className="flex-row">
            {/* Step number */}
            <View className="w-8 h-8 rounded-full bg-ember-red/20 items-center justify-center mr-3">
              <Text className="font-mono-bold text-sm text-ember-red">
                {step.step}
              </Text>
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-body-semibold text-base text-ash-white">
                  {step.title}
                </Text>
                {step.timeMinutes > 0 && (
                  <View className="flex-row items-center gap-1">
                    <Clock size={12} color="#4A4A4A" />
                    <Text className="font-body text-xs text-char-300">
                      {step.timeMinutes} min
                    </Text>
                  </View>
                )}
              </View>
              <Text className="font-body text-sm text-char-300">
                {step.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
