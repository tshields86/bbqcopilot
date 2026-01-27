import { View } from 'react-native';
import type { DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#4A4A4A',
        },
        animatedStyle,
      ]}
      className={className}
    />
  );
}

// Common skeleton patterns
export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lastLineWidth?: DimensionValue;
}) {
  return (
    <View className="gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={16}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-char-700 rounded-card p-4">
      <View className="flex-row items-center mb-4">
        <Skeleton width={48} height={48} borderRadius={24} />
        <View className="ml-3 flex-1">
          <Skeleton width="70%" height={18} className="mb-2" />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      <SkeletonText lines={2} />
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View className="flex-row items-center py-3">
      <Skeleton width={40} height={40} borderRadius={8} />
      <View className="ml-3 flex-1">
        <Skeleton width="60%" height={16} className="mb-2" />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  );
}

export function SkeletonRecipeCard() {
  return (
    <View className="bg-char-700 rounded-card overflow-hidden">
      <Skeleton width="100%" height={160} borderRadius={0} />
      <View className="p-4">
        <Skeleton width="80%" height={20} className="mb-2" />
        <Skeleton width="50%" height={14} className="mb-4" />
        <View className="flex-row gap-2">
          <Skeleton width={60} height={24} borderRadius={12} />
          <Skeleton width={80} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}
