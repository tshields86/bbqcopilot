import type { GrillType, AccessoryType } from './types';

// Grill types with display names and icons
export const GRILL_TYPES: Record<GrillType, { label: string; description: string }> = {
  kamado: {
    label: 'Kamado',
    description: 'Ceramic cooker (Kamado Joe, Big Green Egg)',
  },
  gas: {
    label: 'Gas',
    description: 'Propane or natural gas grill',
  },
  charcoal: {
    label: 'Charcoal',
    description: 'Traditional charcoal grill',
  },
  pellet: {
    label: 'Pellet',
    description: 'Wood pellet smoker (Traeger, etc.)',
  },
  offset: {
    label: 'Offset Smoker',
    description: 'Traditional offset smoker',
  },
  kettle: {
    label: 'Kettle',
    description: 'Weber-style kettle grill',
  },
  electric: {
    label: 'Electric',
    description: 'Electric smoker or grill',
  },
  other: {
    label: 'Other',
    description: 'Other grill type',
  },
};

// Accessory types with display names
export const ACCESSORY_TYPES: Record<AccessoryType, { label: string; description: string }> = {
  rotisserie: {
    label: 'Rotisserie',
    description: 'Rotating spit for even cooking',
  },
  griddle: {
    label: 'Griddle',
    description: 'Flat cooking surface',
  },
  pizza_stone: {
    label: 'Pizza Stone',
    description: 'For making pizzas',
  },
  soapstone: {
    label: 'Soapstone',
    description: 'Heat-retaining stone surface',
  },
  smoking_stone: {
    label: 'Smoking Stone',
    description: 'For indirect smoking',
  },
  grill_expander: {
    label: 'Grill Expander',
    description: 'Additional cooking space',
  },
  heat_deflector: {
    label: 'Heat Deflector',
    description: 'For indirect cooking',
  },
  cold_smoker: {
    label: 'Cold Smoker',
    description: 'For cold smoking foods',
  },
  thermometer: {
    label: 'Thermometer',
    description: 'Temperature monitoring device',
  },
  cover: {
    label: 'Cover',
    description: 'Protective cover',
  },
  other: {
    label: 'Other',
    description: 'Other accessory',
  },
};

// Popular grill brands for suggestions
export const POPULAR_GRILL_BRANDS = [
  'Kamado Joe',
  'Big Green Egg',
  'Weber',
  'Traeger',
  'Rec Tec',
  'Pit Boss',
  'Oklahoma Joes',
  'Char-Broil',
  'Napoleon',
  'Yoder',
  'Lang',
  'Franklin',
];

// Usage limits
export const USAGE_LIMITS = {
  free: {
    monthlyRecipes: 15,
    dailyRecipes: 3,
  },
  pro: {
    monthlyRecipes: 500,
    dailyRecipes: 20,
  },
  unlimited: {
    monthlyRecipes: Infinity,
    dailyRecipes: Infinity,
  },
};

// Design system colors (matching tailwind.config.js)
export const COLORS = {
  ember: {
    500: '#C41E3A',
    600: '#b91c36',
  },
  char: {
    400: '#818181',
    500: '#4A4A4A',
    700: '#2d2d2d',
    800: '#1A1A1A',
  },
  ash: '#F5F5F0',
  copper: '#B87333',
  mesquite: '#5D3A1A',
  success: '#2D5A27',
  warning: '#D4A574',
  error: '#8B2635',
};
