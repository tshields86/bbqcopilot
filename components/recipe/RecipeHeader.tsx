import { View, Text } from 'react-native';
import { Clock, Users, Flame } from 'lucide-react-native';
import { Card, Badge } from '@/components/ui';
import type { RecipeData } from '@/lib/types';

interface RecipeHeaderProps {
  recipe: RecipeData;
}

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="elevated" className="mb-4">
      <Text className="font-display text-2xl text-ash-white mb-2">
        {recipe.title}
      </Text>
      <Text className="font-body text-smoke-gray mb-4">
        {recipe.description}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {/* Time */}
        <View className="flex-row items-center gap-1.5 bg-char-black/50 px-3 py-1.5 rounded-full">
          <Clock size={14} color="#B87333" />
          <Text className="font-body-medium text-sm text-ash-white">
            {formatTime(recipe.totalTimeMinutes)}
          </Text>
        </View>

        {/* Servings */}
        <View className="flex-row items-center gap-1.5 bg-char-black/50 px-3 py-1.5 rounded-full">
          <Users size={14} color="#B87333" />
          <Text className="font-body-medium text-sm text-ash-white">
            {recipe.servings} servings
          </Text>
        </View>

        {/* Difficulty */}
        <Badge variant={getDifficultyColor(recipe.difficulty)} size="sm">
          {recipe.difficulty}
        </Badge>
      </View>

      {/* Proteins */}
      {recipe.proteins && recipe.proteins.length > 0 && (
        <View className="mt-4 pt-4 border-t border-smoke-gray/20">
          <Text className="font-body-medium text-sm text-smoke-gray mb-2">Proteins</Text>
          <View className="flex-row flex-wrap gap-2">
            {recipe.proteins.map((protein, index) => (
              <View key={index} className="flex-row items-center gap-1.5 bg-ember-red/10 px-3 py-1.5 rounded-full">
                <Flame size={12} color="#C41E3A" />
                <Text className="font-body-medium text-sm text-ash-white">
                  {protein.name} ({protein.weight})
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Card>
  );
}
