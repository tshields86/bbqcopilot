import { View, Text, Pressable } from 'react-native';
import { Clock, Users, Heart, ChevronRight } from 'lucide-react-native';
import { Card, Badge } from '@/components/ui';
import type { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function RecipeCard({ recipe, onPress, isFavorite, onToggleFavorite }: RecipeCardProps) {
  const formatTime = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyVariant = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return 'success';
      case 'medium':
      case 'intermediate':
        return 'warning';
      case 'hard':
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string | null): string => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return 'Easy';
      case 'medium':
      case 'intermediate':
        return 'Medium';
      case 'hard':
      case 'advanced':
        return 'Hard';
      default:
        return difficulty || '';
    }
  };

  const proteinNames = recipe.proteins?.map((p) => p.name).join(', ') || '';

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          variant="elevated"
          className={`${pressed ? 'opacity-80 scale-[0.98]' : ''}`}
        >
          <View className="flex-row items-start">
            {/* Content */}
            <View className="flex-1">
              <Text className="font-body-semibold text-base text-ash-white mb-1">
                {recipe.title}
              </Text>

              {proteinNames && (
                <Text className="font-body text-sm text-copper-glow mb-2">
                  {proteinNames}
                </Text>
              )}

              {recipe.description && (
                <Text
                  className="font-body text-sm text-char-300 mb-3"
                  numberOfLines={2}
                >
                  {recipe.description}
                </Text>
              )}

              {/* Meta */}
              <View className="flex-row flex-wrap items-center gap-3">
                {recipe.total_time_minutes && (
                  <View className="flex-row items-center gap-1">
                    <Clock size={12} color="#4A4A4A" />
                    <Text className="font-body text-xs text-char-300">
                      {formatTime(recipe.total_time_minutes)}
                    </Text>
                  </View>
                )}

                {recipe.servings && (
                  <View className="flex-row items-center gap-1">
                    <Users size={12} color="#4A4A4A" />
                    <Text className="font-body text-xs text-char-300">
                      {recipe.servings}
                    </Text>
                  </View>
                )}

                {recipe.difficulty && (
                  <Badge variant={getDifficultyVariant(recipe.difficulty)} size="sm">
                    {getDifficultyLabel(recipe.difficulty)}
                  </Badge>
                )}
              </View>
            </View>

            {/* Actions */}
            <View className="flex-col items-center gap-2 ml-3">
              {onToggleFavorite && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  hitSlop={8}
                  className="p-1"
                >
                  <Heart
                    size={20}
                    color={isFavorite ? '#C41E3A' : '#4A4A4A'}
                    fill={isFavorite ? '#C41E3A' : 'transparent'}
                  />
                </Pressable>
              )}
              {onPress && <ChevronRight size={20} color="#4A4A4A" />}
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}
