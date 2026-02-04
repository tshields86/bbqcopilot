import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Card } from '@/components/ui';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

interface RecipeSkeletonProps {
  stage: number;
}

function HeaderSkeleton() {
  return (
    <Card variant="elevated" className="mb-4">
      {/* Title */}
      <View className="mb-3">
        <Skeleton width="80%" height={24} />
      </View>
      {/* Description */}
      <SkeletonText lines={2} lastLineWidth="70%" />
      {/* Info chips row */}
      <View className="flex-row gap-2 mt-4">
        <Skeleton width={90} height={28} borderRadius={14} />
        <Skeleton width={80} height={28} borderRadius={14} />
        <Skeleton width={70} height={28} borderRadius={14} />
      </View>
      {/* Proteins section */}
      <View className="border-t border-char-500/20 mt-4 pt-4">
        <View className="flex-row gap-2 flex-wrap">
          <Skeleton width={120} height={32} borderRadius={16} />
          <Skeleton width={100} height={32} borderRadius={16} />
        </View>
      </View>
    </Card>
  );
}

function EquipmentSkeleton() {
  return (
    <Card variant="outlined" className="mb-4">
      <View className="mb-3">
        <Skeleton width="55%" height={20} />
      </View>
      <View className="flex-row gap-2 flex-wrap">
        <Skeleton width={100} height={30} borderRadius={15} />
        <Skeleton width={130} height={30} borderRadius={15} />
        <Skeleton width={90} height={30} borderRadius={15} />
        <Skeleton width={110} height={30} borderRadius={15} />
      </View>
    </Card>
  );
}

function IngredientsSkeleton() {
  return (
    <Card variant="outlined" className="mb-4">
      <View className="mb-4">
        <Skeleton width="40%" height={20} />
      </View>
      <View className="gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} className="flex-row items-center gap-3">
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton width={`${65 - i * 5}%` as `${number}%`} height={16} />
          </View>
        ))}
      </View>
    </Card>
  );
}

function PrepStepsSkeleton() {
  return (
    <Card variant="outlined" className="mb-4">
      <View className="mb-4">
        <Skeleton width="45%" height={20} />
      </View>
      <View className="gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} className="flex-row gap-3">
            <Skeleton width={28} height={28} borderRadius={14} />
            <View className="flex-1 gap-2">
              <Skeleton width="70%" height={16} />
              <Skeleton width="90%" height={14} />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

function TimelineSkeleton() {
  return (
    <Card variant="outlined" className="mb-4">
      {/* Eating time header */}
      <View className="rounded-lg bg-ember-red/10 p-3 mb-4">
        <View className="flex-row items-center gap-3">
          <Skeleton width={40} height={40} borderRadius={20} />
          <View className="flex-1 gap-2">
            <Skeleton width="50%" height={14} />
            <Skeleton width="30%" height={24} />
          </View>
        </View>
      </View>
      <View className="mb-4">
        <Skeleton width="50%" height={20} />
      </View>
      {/* Timeline steps */}
      <View className="gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} className="flex-row gap-3">
            {/* Timeline dot and line */}
            <View className="items-center" style={{ width: 20 }}>
              <Skeleton width={12} height={12} borderRadius={6} />
              {i < 3 && (
                <View className="w-0.5 flex-1 bg-char-500/30 mt-1" style={{ minHeight: 40 }} />
              )}
            </View>
            {/* Step content */}
            <View className="flex-1 pb-2 gap-1">
              <Skeleton width={60} height={14} />
              <Skeleton width="75%" height={16} />
              <Skeleton width="90%" height={14} />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

function TipsSkeleton() {
  return (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row items-center gap-2 mb-3">
        <Skeleton width={20} height={20} borderRadius={4} />
        <Skeleton width="35%" height={20} />
      </View>
      <View className="gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} className="flex-row items-start gap-2">
            <View className="mt-1.5">
              <Skeleton width={6} height={6} borderRadius={3} />
            </View>
            <Skeleton width={`${85 - i * 10}%` as `${number}%`} height={14} />
          </View>
        ))}
      </View>
    </Card>
  );
}

export function RecipeSkeleton({ stage }: RecipeSkeletonProps) {
  return (
    <View>
      {/* Stage 1+: Header */}
      <Animated.View entering={FadeIn.duration(400)}>
        <HeaderSkeleton />
      </Animated.View>

      {/* Stage 2+: Equipment & Ingredients */}
      {stage >= 2 && (
        <Animated.View entering={FadeIn.duration(400)}>
          <EquipmentSkeleton />
          <IngredientsSkeleton />
        </Animated.View>
      )}

      {/* Stage 3+: Prep Steps & Timeline */}
      {stage >= 3 && (
        <Animated.View entering={FadeIn.duration(400)}>
          <PrepStepsSkeleton />
          <TimelineSkeleton />
        </Animated.View>
      )}

      {/* Stage 4+: Tips */}
      {stage >= 4 && (
        <Animated.View entering={FadeIn.duration(400)}>
          <TipsSkeleton />
        </Animated.View>
      )}
    </View>
  );
}
