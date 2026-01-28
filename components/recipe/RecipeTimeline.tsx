import { View, Text } from 'react-native';
import { Clock, Thermometer, AlertCircle } from 'lucide-react-native';
import { Card, H3 } from '@/components/ui';
import type { TimelineStep } from '@/lib/types';

interface RecipeTimelineProps {
  timeline: TimelineStep[];
}

export function RecipeTimeline({ timeline }: RecipeTimelineProps) {
  return (
    <Card variant="outlined" className="mb-4">
      <H3 className="mb-4">Cook Timeline</H3>
      <View className="gap-0">
        {timeline.map((step, index) => (
          <View key={index} className="flex-row">
            {/* Timeline line */}
            <View className="items-center mr-4">
              {/* Dot */}
              <View className="w-4 h-4 rounded-full bg-copper-glow items-center justify-center">
                <View className="w-2 h-2 rounded-full bg-ash-white" />
              </View>
              {/* Line */}
              {index < timeline.length - 1 && (
                <View className="w-0.5 flex-1 bg-smoke-gray/30 min-h-[60px]" />
              )}
            </View>

            {/* Content */}
            <View className="flex-1 pb-6">
              {/* Time */}
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="font-mono text-sm text-copper-glow">
                  {step.time}
                </Text>
                {step.duration && (
                  <View className="flex-row items-center gap-1 bg-char-black/50 px-2 py-0.5 rounded">
                    <Clock size={10} color="#4A4A4A" />
                    <Text className="font-mono text-xs text-smoke-gray">
                      {step.duration}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action */}
              <Text className="font-body-semibold text-base text-ash-white mb-1">
                {step.action}
              </Text>

              {/* Details */}
              <Text className="font-body text-sm text-smoke-gray mb-2">
                {step.details}
              </Text>

              {/* Temperature */}
              {step.temperature && (
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Thermometer size={14} color="#C41E3A" />
                  <Text className="font-mono-bold text-sm text-ember-red">
                    {step.temperature}
                  </Text>
                </View>
              )}

              {/* Checkpoints */}
              {step.checkpoints && step.checkpoints.length > 0 && (
                <View className="bg-warning/10 rounded-lg p-3 gap-1.5">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <AlertCircle size={12} color="#D4A574" />
                    <Text className="font-body-semibold text-xs text-warning">
                      What to look for:
                    </Text>
                  </View>
                  {step.checkpoints.map((checkpoint, cpIndex) => (
                    <Text key={cpIndex} className="font-body text-xs text-smoke-gray pl-4">
                      • {checkpoint}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
