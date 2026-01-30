import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/lib/types';
import type { UpdateTables } from '@/lib/database.types';

// User-scoped cache key to prevent stale data across different users
const getProfileKey = (userId: string | undefined) => ['profile', userId ?? 'anonymous'];

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
  const { user } = useAuth();
  const profileKey = getProfileKey(user?.id);

  return useQuery({
    queryKey: profileKey,
    queryFn: fetchProfile,
    enabled: !!user, // Only fetch when user is authenticated
  });
}

// Hook for updating the profile with optimistic updates
export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileKey = getProfileKey(user?.id);

  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: profileKey });

      const previousProfile = queryClient.getQueryData<Profile>(profileKey);

      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKey, {
          ...previousProfile,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousProfile, profileKey };
    },
    onError: (_, __, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(context.profileKey, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKey });
    },
  });
}

// Hook for completing onboarding
export function useCompleteOnboarding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profileKey = getProfileKey(user?.id);

  return useMutation({
    mutationFn: completeOnboarding,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: profileKey });

      const previousProfile = queryClient.getQueryData<Profile>(profileKey);

      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKey, {
          ...previousProfile,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousProfile, profileKey };
    },
    onError: (_, __, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(context.profileKey, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKey });
    },
  });
}

// Skill level options for UI
export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to grilling and smoking' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with basics, learning advanced techniques' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced pitmaster, ready for any challenge' },
] as const;
