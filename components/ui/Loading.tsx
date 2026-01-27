import { View, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Flame } from 'lucide-react-native';
import { Body } from './Typography';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeMap = {
  sm: 'small' as const,
  md: 'large' as const,
  lg: 'large' as const,
};

const sizePx = {
  sm: 20,
  md: 32,
  lg: 48,
};

export function LoadingSpinner({ size = 'md', color = '#C41E3A' }: LoadingSpinnerProps) {
  return (
    <ActivityIndicator size={sizeMap[size]} color={color} />
  );
}

// BBQ-themed flame loading indicator
export function FlameLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.7, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Flame size={sizePx[size]} color="#C41E3A" fill="#C41E3A" />
    </Animated.View>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <View className="absolute inset-0 bg-char-800/90 items-center justify-center z-50">
      <FlameLoader size="lg" />
      {message && (
        <Body color="muted" className="mt-4">
          {message}
        </Body>
      )}
    </View>
  );
}

// Inline loading state
export function LoadingState({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <FlameLoader size="md" />
      {message && (
        <Body color="muted" className="mt-4 text-center">
          {message}
        </Body>
      )}
    </View>
  );
}
