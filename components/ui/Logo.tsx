import { View, Text, Pressable } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  variant?: 'dark' | 'light';
  onPress?: () => void;
  linkToHome?: boolean;
}

const sizeStyles = {
  sm: {
    text: 'text-lg',
    iconSize: 16,
    iconPadding: 'p-1.5',
    gap: 'gap-1.5',
  },
  md: {
    text: 'text-2xl',
    iconSize: 20,
    iconPadding: 'p-2',
    gap: 'gap-2',
  },
  lg: {
    text: 'text-3xl',
    iconSize: 28,
    iconPadding: 'p-2.5',
    gap: 'gap-2.5',
  },
  xl: {
    text: 'text-4xl',
    iconSize: 36,
    iconPadding: 'p-3',
    gap: 'gap-3',
  },
};

export function Logo({
  size = 'md',
  showIcon = false,
  variant = 'dark',
  onPress,
  linkToHome = false,
}: LogoProps) {
  const router = useRouter();
  const styles = sizeStyles[size];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (linkToHome) {
      router.push('/');
    }
  };

  const content = (
    <View className={`flex-row items-center ${styles.gap}`}>
      {showIcon && (
        <View className={`bg-ember-500 ${styles.iconPadding} rounded-full`}>
          <Flame size={styles.iconSize} color="#F5F5F0" />
        </View>
      )}
      <View className="flex-row">
        <Text
          className={`${styles.text} font-display-bold text-ember-500`}
        >
          BBQ
        </Text>
        <Text
          className={`${styles.text} font-display-bold ${
            variant === 'dark' ? 'text-ash' : 'text-char-800'
          }`}
        >
          Copilot
        </Text>
      </View>
    </View>
  );

  if (onPress || linkToHome) {
    return (
      <Pressable
        onPress={handlePress}
        className="active:opacity-80"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

export function LogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const styles = sizeStyles[size];

  return (
    <View className={`bg-ember-500 ${styles.iconPadding} rounded-full`}>
      <Flame size={styles.iconSize} color="#F5F5F0" />
    </View>
  );
}
