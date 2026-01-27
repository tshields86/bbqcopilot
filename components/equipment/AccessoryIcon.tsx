import { Disc, ThermometerSun, Square, Shield, MoreHorizontal, Snowflake, Layers, CircleDot, Umbrella } from 'lucide-react-native';
import type { AccessoryType } from '@/lib/types';

interface AccessoryIconProps {
  type: AccessoryType;
  size?: number;
  color?: string;
}

export function AccessoryIcon({ type, size = 24, color = '#B87333' }: AccessoryIconProps) {
  const iconProps = { size, color, strokeWidth: 1.5 };

  switch (type) {
    case 'rotisserie':
      return <Disc {...iconProps} />;
    case 'griddle':
      return <Square {...iconProps} />;
    case 'pizza_stone':
      return <CircleDot {...iconProps} />;
    case 'soapstone':
      return <Square {...iconProps} fill={color} fillOpacity={0.2} />;
    case 'smoking_stone':
      return <Layers {...iconProps} />;
    case 'grill_expander':
      return <Layers {...iconProps} />;
    case 'heat_deflector':
      return <Shield {...iconProps} />;
    case 'cold_smoker':
      return <Snowflake {...iconProps} />;
    case 'thermometer':
      return <ThermometerSun {...iconProps} />;
    case 'cover':
      return <Umbrella {...iconProps} />;
    default:
      return <MoreHorizontal {...iconProps} />;
  }
}

// Get display name for accessory type
export function getAccessoryTypeName(type: AccessoryType): string {
  const names: Record<AccessoryType, string> = {
    rotisserie: 'Rotisserie',
    griddle: 'Griddle',
    pizza_stone: 'Pizza Stone',
    soapstone: 'Soapstone',
    smoking_stone: 'Smoking Stone',
    grill_expander: 'Grill Expander',
    heat_deflector: 'Heat Deflector',
    cold_smoker: 'Cold Smoker',
    thermometer: 'Thermometer',
    cover: 'Cover',
    other: 'Other',
  };
  return names[type];
}
