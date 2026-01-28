import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Heart, Trash2, ClipboardList } from 'lucide-react-native';
import { useRecipe, useDeleteRecipe, useIsFavorite, useToggleFavorite } from '@/hooks';
import { RecipeView } from '@/components/recipe';
import { Button, FlameLoader, ConfirmDialog } from '@/components/ui';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading } = useRecipe(id);
  const { data: isFavorite } = useIsFavorite(id);
  const toggleFavorite = useToggleFavorite();
  const deleteRecipe = useDeleteRecipe();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleFavorite = () => {
    if (!id) return;
    toggleFavorite.mutate({
      recipeId: id,
      isFavorite: !!isFavorite,
    });
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteRecipe.mutateAsync(id);
      router.back();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    }
  };

  const handleLogCook = () => {
    router.push(`/recipes/${id}/log`);
  };

  if (isLoading || !recipe) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
        </View>
      </>
    );
  }

  // Parse recipe_data if it's a string
  const recipeData = typeof recipe.recipe_data === 'string'
    ? JSON.parse(recipe.recipe_data)
    : recipe.recipe_data;

  return (
    <>
      <Stack.Screen
        options={{
          title: recipe.title,
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
          headerRight: () => (
            <View className="flex-row gap-4 mr-2">
              <Pressable onPress={handleToggleFavorite} hitSlop={8}>
                <Heart
                  size={22}
                  color={isFavorite ? '#C41E3A' : '#F5F5F0'}
                  fill={isFavorite ? '#C41E3A' : 'transparent'}
                />
              </Pressable>
              <Pressable onPress={() => setShowDeleteConfirm(true)} hitSlop={8}>
                <Trash2 size={22} color="#8B2635" />
              </Pressable>
            </View>
          ),
        }}
      />
      <View className="flex-1 bg-char-black">
        <RecipeView recipe={recipeData} />

        {/* Log Cook Button */}
        <View className="p-4 pt-0 border-t border-char-600">
          <Button
            variant="primary"
            onPress={handleLogCook}
            leftIcon={ClipboardList}
            fullWidth
          >
            Log This Cook
          </Button>
        </View>
      </View>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Recipe?"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteRecipe.isPending}
      />
    </>
  );
}
