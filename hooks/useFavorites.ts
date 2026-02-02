import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import type { Recipe } from '@/lib/types';

const FAVORITES_KEY = ['favorites'];
const RECIPES_KEY = ['recipes'];

// Fetch all favorite recipes for the current user
async function fetchFavorites(): Promise<Recipe[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      recipe:recipes(
        *,
        grill:grills(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Extract recipes from the nested structure and convert JSON types
  const recipes = (data || [])
    .map((f) => f.recipe)
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return JSON.parse(JSON.stringify(recipes)) as Recipe[];
}

// Check if a recipe is favorited
async function checkIsFavorite(recipeId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

// Add a recipe to favorites
async function addFavorite(recipeId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, recipe_id: recipeId });

  if (error) throw error;
}

// Remove a recipe from favorites
async function removeFavorite(recipeId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId);

  if (error) throw error;
}

// Hook to fetch all favorites
export function useFavorites() {
  return useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: fetchFavorites,
  });
}

// Hook to check if a specific recipe is favorited
export function useIsFavorite(recipeId: string | undefined) {
  return useQuery({
    queryKey: [...FAVORITES_KEY, recipeId],
    queryFn: () => checkIsFavorite(recipeId!),
    enabled: !!recipeId,
  });
}

// Hook to toggle favorite status
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipeId, isFavorite }: { recipeId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        await removeFavorite(recipeId);
      } else {
        await addFavorite(recipeId);
        // Track when a recipe is favorited (not when unfavorited)
        posthog.capture('recipe_favorited', { recipe_id: recipeId });
      }
      return !isFavorite;
    },
    onMutate: async ({ recipeId, isFavorite }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      await queryClient.cancelQueries({ queryKey: [...FAVORITES_KEY, recipeId] });

      // Snapshot
      const previousFavorites = queryClient.getQueryData<Recipe[]>(FAVORITES_KEY);
      const previousIsFavorite = queryClient.getQueryData<boolean>([...FAVORITES_KEY, recipeId]);

      // Optimistically update the isFavorite query
      queryClient.setQueryData([...FAVORITES_KEY, recipeId], !isFavorite);

      return { previousFavorites, previousIsFavorite, recipeId };
    },
    onError: (_, { recipeId }, context) => {
      if (context?.previousFavorites !== undefined) {
        queryClient.setQueryData(FAVORITES_KEY, context.previousFavorites);
      }
      if (context?.previousIsFavorite !== undefined) {
        queryClient.setQueryData([...FAVORITES_KEY, recipeId], context.previousIsFavorite);
      }
    },
    onSettled: (_, __, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
      queryClient.invalidateQueries({ queryKey: [...FAVORITES_KEY, recipeId] });
      queryClient.invalidateQueries({ queryKey: RECIPES_KEY });
    },
  });
}
