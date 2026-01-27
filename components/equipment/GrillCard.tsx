import { View, Text, Pressable } from 'react-native';
import { Star, ChevronRight, Wrench } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GrillIcon, getGrillTypeName } from './GrillIcon';
import type { Grill } from '@/lib/types';

interface GrillCardProps {
  grill: Grill;
  onPress?: () => void;
  showAccessories?: boolean;
}

export function GrillCard({ grill, onPress, showAccessories = true }: GrillCardProps) {
  const accessoryCount = grill.accessories?.length ?? 0;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          variant="elevated"
          className={`${pressed ? 'opacity-80 scale-[0.98]' : ''}`}
        >
          <View className="flex-row items-center">
            {/* Icon */}
            <View className="w-14 h-14 rounded-xl bg-mesquite-brown/20 items-center justify-center mr-4">
              <GrillIcon type={grill.grill_type} size={28} color="#B87333" />
            </View>

            {/* Content */}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-body-semibold text-base text-ash-white">
                  {grill.name}
                </Text>
                {grill.is_primary && (
                  <Star size={14} color="#B87333" fill="#B87333" />
                )}
              </View>

              <Text className="font-body text-sm text-smoke-gray mt-0.5">
                {getGrillTypeName(grill.grill_type)}
                {grill.brand && ` - ${grill.brand}`}
                {grill.model && ` ${grill.model}`}
              </Text>

              {showAccessories && accessoryCount > 0 && (
                <View className="flex-row items-center mt-2 gap-1">
                  <Wrench size={12} color="#4A4A4A" />
                  <Text className="font-body text-xs text-smoke-gray">
                    {accessoryCount} accessor{accessoryCount === 1 ? 'y' : 'ies'}
                  </Text>
                </View>
              )}
            </View>

            {/* Arrow */}
            {onPress && (
              <ChevronRight size={20} color="#4A4A4A" />
            )}
          </View>
        </Card>
      )}
    </Pressable>
  );
}
