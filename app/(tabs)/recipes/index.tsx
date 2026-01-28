import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, TextInput, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, X, Heart, BookOpen, Plus } from 'lucide-react-native';
import { useRecipes, useFavorites, useToggleFavorite, useIsFavorite } from '@/hooks';
import { RecipeCard } from '@/components/recipe';
import { Button, FlameLoader, Card } from '@/components/ui';
import type { Recipe } from '@/lib/types';

type FilterType = 'all' | 'favorites';

export default function RecipesScreen() {
  const router = useRouter();
  const { data: recipes, isLoading, isRefetching, refetch } = useRecipes();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create a Set of favorite recipe IDs for quick lookup
  const favoriteIds = useMemo(() => {
    return new Set(favorites?.map((r) => r.id) || []);
  }, [favorites]);

  // Filter and search recipes
  const filteredRecipes = useMemo(() => {
    let result = recipes || [];

    // Filter by favorites
    if (filter === 'favorites') {
      result = result.filter((r) => favoriteIds.has(r.id));
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.proteins?.some((p) => p.name.toLowerCase().includes(query))
      );
    }

    return result;
  }, [recipes, filter, searchQuery, favoriteIds]);

  const handleRecipePress = (recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}`);
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    toggleFavorite.mutate({
      recipeId: recipe.id,
      isFavorite: favoriteIds.has(recipe.id),
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'My Recipes' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
          <Text className="font-body text-char-300 mt-4">Loading recipes...</Text>
        </View>
      </>
    );
  }

  // Empty state
  if (!recipes || recipes.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'My Recipes' }} />
        <View className="flex-1 bg-char-black items-center justify-center p-6">
          <View className="w-16 h-16 rounded-full bg-copper-glow/20 items-center justify-center mb-4">
            <BookOpen size={32} color="#B87333" />
          </View>
          <Text className="font-display text-xl text-ash-white text-center mb-2">
            No Recipes Yet
          </Text>
          <Text className="font-body text-char-300 text-center mb-6">
            Generate your first recipe to see it here.
          </Text>
          <Button
            variant="primary"
            onPress={() => router.push('/(tabs)/cook')}
            leftIcon={Plus}
          >
            Start a New Cook
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Recipes',
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
        }}
      />
      <View className="flex-1 bg-char-black">
        {/* Search and Filter */}
        <View className="p-4 pb-2">
          {/* Search */}
          <View className="flex-row items-center bg-char-black/50 border border-char-500 rounded-xl px-3 mb-3">
            <Search size={18} color="#4A4A4A" />
            <TextInput
              className="flex-1 font-body text-base text-ash-white py-3 px-2"
              placeholder="Search recipes..."
              placeholderTextColor="#4A4A4A"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={18} color="#4A4A4A" />
              </Pressable>
            )}
          </View>

          {/* Filter tabs */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setFilter('all')}
              className={`
                flex-row items-center px-4 py-2 rounded-full
                ${filter === 'all' ? 'bg-ember-red' : 'bg-char-black/50 border border-char-500'}
              `}
            >
              <BookOpen size={16} color={filter === 'all' ? '#F5F5F0' : '#4A4A4A'} />
              <Text
                className={`font-body-medium text-sm ml-2 ${filter === 'all' ? 'text-ash-white' : 'text-char-300'}`}
              >
                All ({recipes.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilter('favorites')}
              className={`
                flex-row items-center px-4 py-2 rounded-full
                ${filter === 'favorites' ? 'bg-ember-red' : 'bg-char-black/50 border border-char-500'}
              `}
            >
              <Heart size={16} color={filter === 'favorites' ? '#F5F5F0' : '#4A4A4A'} />
              <Text
                className={`font-body-medium text-sm ml-2 ${filter === 'favorites' ? 'text-ash-white' : 'text-char-300'}`}
              >
                Favorites ({favoriteIds.size})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recipe List */}
        {filteredRecipes.length === 0 ? (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="font-body text-char-300 text-center">
              {searchQuery
                ? 'No recipes match your search.'
                : filter === 'favorites'
                  ? 'No favorite recipes yet. Tap the heart icon to add favorites.'
                  : 'No recipes found.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4 pt-2 gap-3"
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#B87333"
              />
            }
            renderItem={({ item }) => (
              <RecipeCard
                recipe={item}
                onPress={() => handleRecipePress(item)}
                isFavorite={favoriteIds.has(item.id)}
                onToggleFavorite={() => handleToggleFavorite(item)}
              />
            )}
          />
        )}
      </View>
    </>
  );
}
