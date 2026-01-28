import { type ReactNode } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { RecipeHeader } from './RecipeHeader';
import { RecipeIngredients } from './RecipeIngredients';
import { RecipePrepSteps } from './RecipePrepSteps';
import { RecipeTimeline } from './RecipeTimeline';
import { RecipeTips } from './RecipeTips';
import { Card } from '@/components/ui';
import type { RecipeData } from '@/lib/types';

interface RecipeViewProps {
  recipe: RecipeData;
  footer?: ReactNode;
}

export function RecipeView({ recipe, footer }: RecipeViewProps) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {/* Header with title, description, meta */}
      <RecipeHeader recipe={recipe} />

      {/* Equipment needed */}
      {recipe.equipmentNeeded && recipe.equipmentNeeded.length > 0 && (
        <Card variant="outlined" className="mb-4">
          <Text className="font-display text-lg text-ash-white mb-3">Equipment Needed</Text>
          <View className="flex-row flex-wrap gap-2">
            {recipe.equipmentNeeded.map((item, index) => (
              <View key={index} className="bg-mesquite-brown/20 px-3 py-1.5 rounded-full">
                <Text className="font-body text-sm text-ash-white">{item}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Ingredients */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <RecipeIngredients ingredients={recipe.ingredients} />
      )}

      {/* Prep Steps */}
      {recipe.prepInstructions && recipe.prepInstructions.length > 0 && (
        <RecipePrepSteps steps={recipe.prepInstructions} />
      )}

      {/* Cook Timeline - the main feature */}
      {recipe.cookTimeline && recipe.cookTimeline.length > 0 && (
        <RecipeTimeline timeline={recipe.cookTimeline} />
      )}

      {/* Tips and Serving Suggestions */}
      <RecipeTips
        tips={recipe.tips || []}
        servingSuggestions={recipe.servingSuggestions}
      />

      {/* Optional footer content */}
      {footer}
    </ScrollView>
  );
}
