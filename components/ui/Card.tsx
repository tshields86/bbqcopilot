import { View, Pressable } from 'react-native';
import type { ViewProps, PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  children: React.ReactNode;
}

interface PressableCardProps extends Omit<PressableProps, 'children'> {
  variant?: CardVariant;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-char-700',
  elevated: 'bg-char-700 shadow-card',
  outlined: 'bg-transparent border border-char-500',
};

export function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <View
      {...props}
      className={`rounded-card p-4 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </View>
  );
}

export function PressableCard({
  variant = 'default',
  children,
  className = '',
  ...props
}: PressableCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`rounded-card p-4 ${variantStyles[variant]} active:bg-char-600 ${className}`}
    >
      {children}
    </AnimatedPressable>
  );
}

// Card subcomponents for composition
export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={`mb-3 ${className}`}>{children}</View>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={className}>{children}</View>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`mt-3 pt-3 border-t border-char-600 ${className}`}>
      {children}
    </View>
  );
}
