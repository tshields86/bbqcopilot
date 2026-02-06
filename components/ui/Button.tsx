import { Pressable, Text, ActivityIndicator, View, Platform } from 'react-native';
import type { PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-ember-500 active:bg-ember-600',
    text: 'text-ash',
  },
  secondary: {
    container: 'bg-char-700 border border-char-500 active:bg-char-600',
    text: 'text-ash',
  },
  ghost: {
    container: 'bg-transparent active:bg-char-700',
    text: 'text-ash',
  },
  destructive: {
    container: 'bg-error active:bg-error/80',
    text: 'text-ash',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: 'px-3 py-2 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-3 rounded-button',
    text: 'text-base',
  },
  lg: {
    container: 'px-6 py-4 rounded-button',
    text: 'text-lg',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    triggerHaptic();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <AnimatedPressable
      {...props}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`
        flex-row items-center justify-center
        ${sizeStyle.container}
        ${variantStyle.container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' ? '#C41E3A' : '#F5F5F0'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === 'left' && icon}
          {LeftIcon && (
            <LeftIcon
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
              color={variant === 'ghost' ? '#F5F5F0' : '#F5F5F0'}
            />
          )}
          <Text className={`font-body-semibold ${sizeStyle.text} ${variantStyle.text}`}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && icon}
          {RightIcon && (
            <RightIcon
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
              color={variant === 'ghost' ? '#F5F5F0' : '#F5F5F0'}
            />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}
