import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import type { UpdateTables } from '@/lib/database.types';

const PROFILE_KEY = ['profile'];

type ProfileUpdate = UpdateTables<'profiles'>;

// Fetch the current user's profile
async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // Profile might not exist yet (RLS will create it via trigger)
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Profile;
}

// Update the current user's profile
async function updateProfile(updates: ProfileUpdate): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

// Mark onboarding as completed
async function completeOnboarding(): Promise<Profile> {
  return updateProfile({ onboarding_completed: true });
}

// Hook to fetch the current user's profile
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: fetchProfile,
  });
}

// Hook for updating the profile with optimistic updates
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: PROFILE_KEY });

      const previousProfile = queryClient.getQueryData<Profile>(PROFILE_KEY);

      if (previousProfile) {
        queryClient.setQueryData<Profile>(PROFILE_KEY, {
          ...previousProfile,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousProfile };
    },
    onError: (_, __, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_KEY, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

// Hook for completing onboarding
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOnboarding,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: PROFILE_KEY });

      const previousProfile = queryClient.getQueryData<Profile>(PROFILE_KEY);

      if (previousProfile) {
        queryClient.setQueryData<Profile>(PROFILE_KEY, {
          ...previousProfile,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousProfile };
    },
    onError: (_, __, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_KEY, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
    },
  });
}

// Skill level options for UI
export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to grilling and smoking' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with basics, learning advanced techniques' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced pitmaster, ready for any challenge' },
] as const;
