import { View, Text, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { AccessoryIcon, getAccessoryTypeName } from './AccessoryIcon';
import type { Accessory } from '@/lib/types';

interface AccessoryCardProps {
  accessory: Accessory;
  onDelete?: () => void;
}

export function AccessoryCard({ accessory, onDelete }: AccessoryCardProps) {
  return (
    <View className="flex-row items-center p-3 bg-char-black/50 rounded-xl border border-char-500/20">
      {/* Icon */}
      <View className="w-10 h-10 rounded-lg bg-mesquite-brown/20 items-center justify-center mr-3">
        <AccessoryIcon type={accessory.accessory_type} size={20} color="#B87333" />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="font-body-medium text-sm text-ash-white">{accessory.name}</Text>
        <Text className="font-body text-xs text-char-300">
          {getAccessoryTypeName(accessory.accessory_type)}
          {accessory.brand && ` - ${accessory.brand}`}
        </Text>
      </View>

      {/* Delete */}
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={8} className="p-2">
          <Trash2 size={18} color="#8B2635" />
        </Pressable>
      )}
    </View>
  );
}
