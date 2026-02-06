import { View, Text } from 'react-native';
import { Lightbulb, UtensilsCrossed } from 'lucide-react-native';
import { Card, H3 } from '@/components/ui';

interface RecipeTipsProps {
  tips: string[];
  servingSuggestions?: string[];
}

export function RecipeTips({ tips, servingSuggestions }: RecipeTipsProps) {
  return (
    <>
      {/* Pro Tips */}
      {tips && tips.length > 0 && (
        <Card variant="outlined" className="mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Lightbulb size={20} color="#B87333" />
            <H3>Pro Tips</H3>
          </View>
          <View className="gap-3">
            {tips.map((tip, index) => (
              <View key={index} className="flex-row">
                <Text className="font-body-semibold text-copper-glow mr-2">•</Text>
                <Text className="font-body text-sm text-char-300 flex-1">{tip}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Serving Suggestions */}
      {servingSuggestions && servingSuggestions.length > 0 && (
        <Card variant="outlined" className="mb-4">
          <View className="flex-row items-center gap-2 mb-4">
            <UtensilsCrossed size={20} color="#B87333" />
            <H3>Serving Suggestions</H3>
          </View>
          <View className="gap-2">
            {servingSuggestions.map((suggestion, index) => (
              <View key={index} className="flex-row">
                <Text className="font-body-semibold text-copper-glow mr-2">•</Text>
                <Text className="font-body text-sm text-char-300 flex-1">{suggestion}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}
    </>
  );
}
