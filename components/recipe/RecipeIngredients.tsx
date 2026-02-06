import { View, Text } from 'react-native';
import { Check } from 'lucide-react-native';
import { Card, H3 } from '@/components/ui';
import type { Ingredient } from '@/lib/types';

interface RecipeIngredientsProps {
  ingredients: Ingredient[];
}

export function RecipeIngredients({ ingredients }: RecipeIngredientsProps) {
  return (
    <Card variant="outlined" className="mb-4">
      <H3 className="mb-4">Ingredients</H3>
      <View className="gap-2">
        {ingredients.map((ingredient, index) => (
          <View key={index} className="flex-row items-start">
            <View className="w-5 h-5 rounded-full border border-char-500/30 items-center justify-center mr-3 mt-0.5">
              <Check size={12} color="#4A4A4A" />
            </View>
            <View className="flex-1">
              <Text className="font-body text-ash-white">
                <Text className="font-body-semibold">{ingredient.amount}</Text> {ingredient.item}
              </Text>
              {ingredient.notes && (
                <Text className="font-body text-sm text-char-300">{ingredient.notes}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
