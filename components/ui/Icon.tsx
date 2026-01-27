import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'default' | 'muted' | 'ember' | 'copper' | 'success' | 'warning' | 'error';

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  color?: IconColor;
  filled?: boolean;
}

const sizeMap: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

const colorMap: Record<IconColor, string> = {
  default: '#F5F5F0',
  muted: '#818181',
  ember: '#C41E3A',
  copper: '#B87333',
  success: '#2D5A27',
  warning: '#D4A574',
  error: '#8B2635',
};

export function Icon({
  icon: IconComponent,
  size = 'md',
  color = 'default',
  filled = false,
}: IconProps) {
  const pixelSize = sizeMap[size];
  const colorValue = colorMap[color];

  return (
    <IconComponent
      size={pixelSize}
      color={colorValue}
      fill={filled ? colorValue : 'none'}
    />
  );
}

// Icon container with background
interface IconContainerProps extends IconProps {
  background?: 'default' | 'ember' | 'copper' | 'success' | 'warning' | 'error';
}

const bgMap: Record<NonNullable<IconContainerProps['background']>, string> = {
  default: 'bg-char-600',
  ember: 'bg-ember-500/20',
  copper: 'bg-copper/20',
  success: 'bg-success/20',
  warning: 'bg-warning/20',
  error: 'bg-error/20',
};

export function IconContainer({
  icon: IconComponent,
  size = 'md',
  color = 'default',
  filled = false,
  background = 'default',
}: IconContainerProps) {
  const pixelSize = sizeMap[size];
  const colorValue = colorMap[color];
  const containerSize = pixelSize * 2;

  return (
    <View
      className={`items-center justify-center rounded-full ${bgMap[background]}`}
      style={{ width: containerSize, height: containerSize }}
    >
      <IconComponent
        size={pixelSize}
        color={colorValue}
        fill={filled ? colorValue : 'none'}
      />
    </View>
  );
}
