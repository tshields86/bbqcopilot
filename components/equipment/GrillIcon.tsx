import { View } from 'react-native';
import { Flame, Wind, Zap, Circle, Box, MoreHorizontal } from 'lucide-react-native';
import type { GrillType } from '@/lib/types';

interface GrillIconProps {
  type: GrillType;
  size?: number;
  color?: string;
}

export function GrillIcon({ type, size = 24, color = '#B87333' }: GrillIconProps) {
  const iconProps = { size, color, strokeWidth: 1.5 };

  switch (type) {
    case 'kamado':
      // Egg-shaped icon (circle for kamado)
      return <Circle {...iconProps} fill={color} fillOpacity={0.2} />;
    case 'gas':
      return <Flame {...iconProps} />;
    case 'charcoal':
      return <Flame {...iconProps} fill={color} fillOpacity={0.3} />;
    case 'pellet':
      return <Wind {...iconProps} />;
    case 'offset':
      return <Box {...iconProps} />;
    case 'kettle':
      return <Circle {...iconProps} />;
    case 'electric':
      return <Zap {...iconProps} />;
    default:
      return <MoreHorizontal {...iconProps} />;
  }
}

// Get display name for grill type
export function getGrillTypeName(type: GrillType): string {
  const names: Record<GrillType, string> = {
    kamado: 'Kamado',
    gas: 'Gas Grill',
    charcoal: 'Charcoal',
    pellet: 'Pellet Grill',
    offset: 'Offset Smoker',
    kettle: 'Kettle',
    electric: 'Electric',
    other: 'Other',
  };
  return names[type];
}
