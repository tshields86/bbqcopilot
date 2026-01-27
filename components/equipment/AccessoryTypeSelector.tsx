import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { AccessoryIcon } from './AccessoryIcon';
import { ACCESSORY_TYPES } from '@/hooks/useAccessories';
import type { AccessoryType } from '@/lib/types';

interface AccessoryTypeSelectorProps {
  value: AccessoryType | null;
  onChange: (type: AccessoryType) => void;
  label?: string;
}

export function AccessoryTypeSelector({ value, onChange, label }: AccessoryTypeSelectorProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="font-body text-sm text-smoke-gray mb-2">{label}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 pb-2"
      >
        {ACCESSORY_TYPES.map((type) => {
          const isSelected = value === type.value;
          return (
            <Pressable
              key={type.value}
              onPress={() => onChange(type.value)}
              className={`
                w-24 p-3 rounded-xl border-2
                ${isSelected
                  ? 'border-ember-red bg-ember-red/10'
                  : 'border-smoke-gray/30 bg-char-black/50'
                }
              `}
            >
              <View className="items-center">
                <View className="relative">
                  <AccessoryIcon
                    type={type.value}
                    size={28}
                    color={isSelected ? '#C41E3A' : '#B87333'}
                  />
                  {isSelected && (
                    <View className="absolute -top-1 -right-1 bg-ember-red rounded-full p-0.5">
                      <Check size={10} color="#F5F5F0" strokeWidth={3} />
                    </View>
                  )}
                </View>
                <Text
                  className={`
                    font-body-medium text-xs mt-2 text-center
                    ${isSelected ? 'text-ash-white' : 'text-smoke-gray'}
                  `}
                  numberOfLines={2}
                >
                  {type.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
