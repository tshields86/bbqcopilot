import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import type { Recipe, RecipeData } from '@/lib/types';

const RECIPES_KEY = ['recipes'];

// Fetch all recipes for the current user
async function fetchRecipes(): Promise<Recipe[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      grill:grills(*)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Recipe[];
}

// Fetch a single recipe by ID
async function fetchRecipe(id: string): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      grill:grills(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as Recipe;
}

// Save a new recipe
async function saveRecipe(recipe: {
  title: string;
  description?: string;
  grillId?: string;
  recipeData: RecipeData;
  proteins?: Array<{ name: string; weight: string; quantity: number }>;
  servings?: number;
  totalTimeMinutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
}): Promise<Recipe> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Normalize difficulty to match DB constraint (easy, medium, hard)
  let normalizedDifficulty: 'easy' | 'medium' | 'hard' | null = null;
  if (recipe.difficulty) {
    const lower = recipe.difficulty.toLowerCase();
    if (lower === 'easy' || lower === 'beginner' || lower === 'simple') {
      normalizedDifficulty = 'easy';
    } else if (lower === 'medium' || lower === 'intermediate' || lower === 'moderate') {
      normalizedDifficulty = 'medium';
    } else if (
      lower === 'hard' ||
      lower === 'advanced' ||
      lower === 'difficult' ||
      lower === 'expert'
    ) {
      normalizedDifficulty = 'hard';
    }
  }

  const insertData = {
    user_id: user.id,
    title: recipe.title,
    description: recipe.description || null,
    grill_id: recipe.grillId || null,
    recipe_data: JSON.parse(JSON.stringify(recipe.recipeData)),
    proteins: JSON.parse(JSON.stringify(recipe.proteins || [])),
    servings: recipe.servings || null,
    total_time_minutes: recipe.totalTimeMinutes || null,
    difficulty: normalizedDifficulty,
  };

  const { data, error } = await supabase
    .from('recipes')
    .insert(insertData)
    .select(
      `
      *,
      grill:grills(*)
    `
    )
    .single();

  if (error) throw error;
  return data as unknown as Recipe;
}

// Delete a recipe
async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

// Hook to fetch all recipes
export function useRecipes() {
  return useQuery({
    queryKey: RECIPES_KEY,
    queryFn: fetchRecipes,
  });
}

// Hook to fetch a single recipe
export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: [...RECIPES_KEY, id],
    queryFn: () => fetchRecipe(id!),
    enabled: !!id,
  });
}

// Hook for saving a recipe
export function useSaveRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveRecipe,
    onSuccess: (recipe) => {
      posthog.capture('recipe_saved', { recipe_id: recipe.id });
      queryClient.invalidateQueries({ queryKey: RECIPES_KEY });
    },
  });
}

// Hook for deleting a recipe
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: RECIPES_KEY });
      const previousRecipes = queryClient.getQueryData<Recipe[]>(RECIPES_KEY);

      if (previousRecipes) {
        queryClient.setQueryData<Recipe[]>(
          RECIPES_KEY,
          previousRecipes.filter((r) => r.id !== recipeId)
        );
      }

      return { previousRecipes };
    },
    onError: (_, __, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(RECIPES_KEY, context.previousRecipes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: RECIPES_KEY });
    },
  });
}
