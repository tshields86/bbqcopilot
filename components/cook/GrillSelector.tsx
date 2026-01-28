import { View, Text, Pressable, ScrollView } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Card } from '@/components/ui';
import { GrillIcon, getGrillTypeName } from '@/components/equipment';
import type { Grill } from '@/lib/types';

interface GrillSelectorProps {
  grills: Grill[];
  selectedGrill: Grill | null;
  onSelect: (grill: Grill) => void;
}

export function GrillSelector({ grills, selectedGrill, onSelect }: GrillSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (grills.length === 0) {
    return (
      <Card variant="outlined" className="mb-4">
        <Text className="font-body text-smoke-gray text-center">
          No grills added yet. Add a grill in the Equipment tab.
        </Text>
      </Card>
    );
  }

  if (grills.length === 1) {
    const grill = grills[0];
    return (
      <Card variant="elevated" className="mb-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl bg-mesquite-brown/20 items-center justify-center mr-3">
            <GrillIcon type={grill.grill_type} size={24} color="#B87333" />
          </View>
          <View className="flex-1">
            <Text className="font-body-semibold text-ash-white">{grill.name}</Text>
            <Text className="font-body text-sm text-smoke-gray">
              {getGrillTypeName(grill.grill_type)}
            </Text>
          </View>
          <View className="bg-success/20 px-2 py-1 rounded">
            <Text className="font-body text-xs text-success">Selected</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <View className="mb-4">
      <Text className="font-body text-sm text-smoke-gray mb-2">Select Grill</Text>

      {/* Selected grill or prompt */}
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <Card variant="elevated">
          <View className="flex-row items-center">
            {selectedGrill ? (
              <>
                <View className="w-12 h-12 rounded-xl bg-mesquite-brown/20 items-center justify-center mr-3">
                  <GrillIcon type={selectedGrill.grill_type} size={24} color="#B87333" />
                </View>
                <View className="flex-1">
                  <Text className="font-body-semibold text-ash-white">{selectedGrill.name}</Text>
                  <Text className="font-body text-sm text-smoke-gray">
                    {getGrillTypeName(selectedGrill.grill_type)}
                  </Text>
                </View>
              </>
            ) : (
              <View className="flex-1">
                <Text className="font-body text-smoke-gray">Choose a grill...</Text>
              </View>
            )}
            <ChevronDown
              size={20}
              color="#4A4A4A"
              style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
            />
          </View>
        </Card>
      </Pressable>

      {/* Dropdown */}
      {isExpanded && (
        <Card variant="outlined" className="mt-2">
          <ScrollView style={{ maxHeight: 200 }}>
            {grills.map((grill) => {
              const isSelected = selectedGrill?.id === grill.id;
              return (
                <Pressable
                  key={grill.id}
                  onPress={() => {
                    onSelect(grill);
                    setIsExpanded(false);
                  }}
                  className={`flex-row items-center p-3 rounded-lg ${isSelected ? 'bg-ember-red/10' : ''}`}
                >
                  <View className="w-10 h-10 rounded-lg bg-mesquite-brown/20 items-center justify-center mr-3">
                    <GrillIcon type={grill.grill_type} size={20} color="#B87333" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-body-semibold text-sm text-ash-white">{grill.name}</Text>
                    <Text className="font-body text-xs text-smoke-gray">
                      {getGrillTypeName(grill.grill_type)}
                    </Text>
                  </View>
                  {isSelected && <Check size={18} color="#C41E3A" />}
                </Pressable>
              );
            })}
          </ScrollView>
        </Card>
      )}
    </View>
  );
}
