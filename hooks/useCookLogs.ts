import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CookLog, WeatherConditions } from '@/lib/types';

const COOK_LOGS_KEY = ['cook_logs'];

// Fetch a single cook log by ID
async function fetchCookLog(id: string): Promise<CookLog> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('cook_logs')
    .select(`
      *,
      recipe:recipes(
        id,
        title,
        proteins,
        grill:grills(name, grill_type)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data as unknown as CookLog;
}

// Fetch all cook logs for the current user
async function fetchCookLogs(): Promise<CookLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('cook_logs')
    .select(`
      *,
      recipe:recipes(
        id,
        title,
        proteins,
        grill:grills(name, grill_type)
      )
    `)
    .eq('user_id', user.id)
    .order('cooked_at', { ascending: false });

  if (error) throw error;
  return data as unknown as CookLog[];
}

// Fetch cook logs for a specific recipe
async function fetchCookLogsForRecipe(recipeId: string): Promise<CookLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('cook_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('recipe_id', recipeId)
    .order('cooked_at', { ascending: false });

  if (error) throw error;
  return data as CookLog[];
}

// Create a new cook log
async function createCookLog(log: {
  recipeId?: string;
  rating?: number;
  notes?: string;
  whatWorked?: string;
  whatToImprove?: string;
  photos?: string[];
  weatherConditions?: WeatherConditions;
  actualTimeMinutes?: number;
}): Promise<CookLog> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const insertData = {
    recipe_id: log.recipeId || null,
    rating: log.rating || null,
    notes: log.notes || null,
    what_worked: log.whatWorked || null,
    what_to_improve: log.whatToImprove || null,
    photos: log.photos || [],
    weather_conditions: log.weatherConditions ? JSON.parse(JSON.stringify(log.weatherConditions)) : null,
    actual_time_minutes: log.actualTimeMinutes || null,
    cooked_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cook_logs')
    .insert(insertData)
    .select(`
      *,
      recipe:recipes(
        id,
        title,
        proteins,
        grill:grills(name, grill_type)
      )
    `)
    .single();

  if (error) throw error;
  return data as unknown as CookLog;
}

// Update a cook log
async function updateCookLog({
  id,
  ...updates
}: {
  id: string;
  rating?: number;
  notes?: string;
  whatWorked?: string;
  whatToImprove?: string;
  photos?: string[];
}): Promise<CookLog> {
  const updateData: Record<string, unknown> = {};
  if (updates.rating !== undefined) updateData.rating = updates.rating;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.whatWorked !== undefined) updateData.what_worked = updates.whatWorked;
  if (updates.whatToImprove !== undefined) updateData.what_to_improve = updates.whatToImprove;
  if (updates.photos !== undefined) updateData.photos = updates.photos;

  const { data, error } = await supabase
    .from('cook_logs')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      recipe:recipes(
        id,
        title,
        proteins,
        grill:grills(name, grill_type)
      )
    `)
    .single();

  if (error) throw error;
  return data as unknown as CookLog;
}

// Delete a cook log
async function deleteCookLog(id: string): Promise<void> {
  const { error } = await supabase.from('cook_logs').delete().eq('id', id);
  if (error) throw error;
}

// Hook to fetch all cook logs
export function useCookLogs() {
  return useQuery({
    queryKey: COOK_LOGS_KEY,
    queryFn: fetchCookLogs,
  });
}

// Hook to fetch a single cook log
export function useCookLog(id: string | undefined) {
  return useQuery({
    queryKey: [...COOK_LOGS_KEY, id],
    queryFn: () => fetchCookLog(id!),
    enabled: !!id,
  });
}

// Hook to fetch cook logs for a specific recipe
export function useCookLogsForRecipe(recipeId: string | undefined) {
  return useQuery({
    queryKey: [...COOK_LOGS_KEY, 'recipe', recipeId],
    queryFn: () => fetchCookLogsForRecipe(recipeId!),
    enabled: !!recipeId,
  });
}

// Hook for creating a cook log
export function useCreateCookLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCookLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COOK_LOGS_KEY });
    },
  });
}

// Hook for updating a cook log
export function useUpdateCookLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCookLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COOK_LOGS_KEY });
    },
  });
}

// Hook for deleting a cook log
export function useDeleteCookLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCookLog,
    onMutate: async (logId) => {
      await queryClient.cancelQueries({ queryKey: COOK_LOGS_KEY });
      const previousLogs = queryClient.getQueryData<CookLog[]>(COOK_LOGS_KEY);

      if (previousLogs) {
        queryClient.setQueryData<CookLog[]>(
          COOK_LOGS_KEY,
          previousLogs.filter((l) => l.id !== logId)
        );
      }

      return { previousLogs };
    },
    onError: (_, __, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(COOK_LOGS_KEY, context.previousLogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COOK_LOGS_KEY });
    },
  });
}

// Get average rating for a recipe
export function getAverageRating(logs: CookLog[]): number | null {
  const ratedLogs = logs.filter((l) => l.rating !== null);
  if (ratedLogs.length === 0) return null;
  const sum = ratedLogs.reduce((acc, l) => acc + (l.rating || 0), 0);
  return sum / ratedLogs.length;
}
