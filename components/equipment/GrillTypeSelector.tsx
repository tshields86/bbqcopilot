import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { GrillIcon, getGrillTypeName } from './GrillIcon';
import { GRILL_TYPES } from '@/hooks/useGrills';
import type { GrillType } from '@/lib/types';

interface GrillTypeSelectorProps {
  value: GrillType | null;
  onChange: (type: GrillType) => void;
  label?: string;
}

export function GrillTypeSelector({ value, onChange, label }: GrillTypeSelectorProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="font-body-medium text-sm text-ash mb-3">{label}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 pb-2"
      >
        {GRILL_TYPES.map((type) => {
          const isSelected = value === type.value;
          return (
            <Pressable
              key={type.value}
              onPress={() => onChange(type.value)}
              className={`
                w-24 p-3 rounded-xl border-2
                ${isSelected
                  ? 'border-ember-500 bg-ember-500/10'
                  : 'border-char-500 bg-char-700'
                }
              `}
            >
              <View className="items-center">
                <View className="relative">
                  <GrillIcon
                    type={type.value}
                    size={32}
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
                    ${isSelected ? 'text-ash' : 'text-char-300'}
                  `}
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
