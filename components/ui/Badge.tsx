import { View, Text } from 'react-native';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'ember' | 'copper';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: 'bg-char-600',
    text: 'text-ash',
  },
  success: {
    container: 'bg-success/20',
    text: 'text-success',
  },
  warning: {
    container: 'bg-warning/20',
    text: 'text-warning',
  },
  error: {
    container: 'bg-error/20',
    text: 'text-error',
  },
  ember: {
    container: 'bg-ember-500/20',
    text: 'text-ember-500',
  },
  copper: {
    container: 'bg-copper/20',
    text: 'text-copper',
  },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string }> = {
  sm: {
    container: 'px-2 py-0.5 rounded',
    text: 'text-xs',
  },
  md: {
    container: 'px-3 py-1 rounded-lg',
    text: 'text-sm',
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
}: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      className={`
        flex-row items-center
        ${sizeStyle.container}
        ${variantStyle.container}
      `}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={`font-body-medium ${sizeStyle.text} ${variantStyle.text}`}>
        {children}
      </Text>
    </View>
  );
}

// Convenience badges for common statuses
export function SuccessBadge({ children }: { children: React.ReactNode }) {
  return <Badge variant="success">{children}</Badge>;
}

export function WarningBadge({ children }: { children: React.ReactNode }) {
  return <Badge variant="warning">{children}</Badge>;
}

export function ErrorBadge({ children }: { children: React.ReactNode }) {
  return <Badge variant="error">{children}</Badge>;
}
