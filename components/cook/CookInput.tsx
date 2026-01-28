import { View, Text, TextInput, Pressable } from 'react-native';
import { Flame, ArrowRight } from 'lucide-react-native';
import { Button, Card } from '@/components/ui';

interface CookInputProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const SUGGESTIONS = [
  'Brisket for 8 people',
  'Smoked ribs',
  'Pulled pork shoulder',
  'Beer can chicken',
  'Smoked salmon',
  'Tri-tip',
];

export function CookInput({ value, onChange, onSubmit, isLoading, disabled }: CookInputProps) {
  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <View>
      <Text className="font-body text-sm text-smoke-gray mb-2">
        What do you want to cook?
      </Text>

      {/* Input */}
      <Card variant="elevated" className="mb-4">
        <View className="flex-row items-start">
          <Flame size={20} color="#C41E3A" className="mt-1 mr-3" />
          <TextInput
            className="flex-1 font-body text-base text-ash-white min-h-[80px]"
            placeholder="e.g., I want to smoke a brisket for a party of 10..."
            placeholderTextColor="#4A4A4A"
            value={value}
            onChangeText={onChange}
            multiline
            textAlignVertical="top"
            editable={!disabled}
          />
        </View>
      </Card>

      {/* Suggestions */}
      {!value && (
        <View className="mb-6">
          <Text className="font-body text-xs text-smoke-gray mb-2">
            Or try one of these:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => onChange(suggestion)}
                className="bg-char-black/50 border border-smoke-gray/30 px-3 py-1.5 rounded-full"
              >
                <Text className="font-body text-sm text-smoke-gray">{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Submit */}
      <Button
        variant="primary"
        size="lg"
        onPress={onSubmit}
        disabled={!canSubmit}
        loading={isLoading}
        rightIcon={ArrowRight}
        fullWidth
      >
        Generate Recipe
      </Button>
    </View>
  );
}
