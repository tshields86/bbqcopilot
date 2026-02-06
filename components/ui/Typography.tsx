import { Text } from 'react-native';
import type { TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  color?: 'default' | 'muted' | 'ember' | 'copper' | 'success' | 'warning' | 'error';
}

const colorStyles: Record<NonNullable<TypographyProps['color']>, string> = {
  default: 'text-ash',
  muted: 'text-char-400',
  ember: 'text-ember-500',
  copper: 'text-copper',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

// Display/Header typography (Playfair Display)
export function H1({ children, color = 'default', className = '', ...props }: TypographyProps) {
  return (
    <Text {...props} className={`text-4xl font-display-bold ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}

export function H2({ children, color = 'default', className = '', ...props }: TypographyProps) {
  return (
    <Text
      {...props}
      className={`text-3xl font-display-semibold ${colorStyles[color]} ${className}`}
    >
      {children}
    </Text>
  );
}

export function H3({ children, color = 'default', className = '', ...props }: TypographyProps) {
  return (
    <Text
      {...props}
      className={`text-2xl font-display-semibold ${colorStyles[color]} ${className}`}
    >
      {children}
    </Text>
  );
}

export function H4({ children, color = 'default', className = '', ...props }: TypographyProps) {
  return (
    <Text {...props} className={`text-xl font-display-medium ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}

// Body typography (Source Sans 3)
export function Body({ children, color = 'default', className = '', ...props }: TypographyProps) {
  return (
    <Text {...props} className={`text-base font-body ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}

export function BodyBold({
  children,
  color = 'default',
  className = '',
  ...props
}: TypographyProps) {
  return (
    <Text {...props} className={`text-base font-body-semibold ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}

export function BodySmall({
  children,
  color = 'default',
  className = '',
  ...props
}: TypographyProps) {
  return (
    <Text {...props} className={`text-sm font-body ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}

export function Caption({ children, color = 'muted', className = '', ...props }: TypographyProps) {
  return (
    <Text {...props} className={`text-xs font-body ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}

// Monospace typography (JetBrains Mono) - for temps, timers, etc.
export function Mono({ children, color = 'default', className = '', ...props }: TypographyProps) {
  return (
    <Text {...props} className={`text-base font-mono ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}

export function MonoLarge({
  children,
  color = 'default',
  className = '',
  ...props
}: TypographyProps) {
  return (
    <Text {...props} className={`text-2xl font-mono-bold ${colorStyles[color]} ${className}`}>
      {children}
    </Text>
  );
}
