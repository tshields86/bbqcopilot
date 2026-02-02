import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import type { Grill, GrillType } from '@/lib/types';
import type { InsertTables, UpdateTables } from '@/lib/database.types';

const GRILLS_KEY = ['grills'];

type GrillInsert = Omit<InsertTables<'grills'>, 'user_id'>;
type GrillUpdate = UpdateTables<'grills'>;

// Fetch all grills for the current user
async function fetchGrills(): Promise<Grill[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('grills')
    .select(`
      *,
      accessories (*)
    `)
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Grill[];
}

// Fetch a single grill by ID
async function fetchGrill(id: string): Promise<Grill> {
  const { data, error } = await supabase
    .from('grills')
    .select(`
      *,
      accessories (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Grill;
}

// Create a new grill
async function createGrill(grill: GrillInsert): Promise<Grill> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // If this is the first grill, make it primary
  const { count } = await supabase
    .from('grills')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const isFirstGrill = count === 0;

  const { data, error } = await supabase
    .from('grills')
    .insert({
      ...grill,
      user_id: user.id,
      is_primary: grill.is_primary ?? isFirstGrill,
    })
    .select(`
      *,
      accessories (*)
    `)
    .single();

  if (error) throw error;
  return data as Grill;
}

// Update an existing grill
async function updateGrill({ id, ...updates }: GrillUpdate & { id: string }): Promise<Grill> {
  const { data, error } = await supabase
    .from('grills')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      accessories (*)
    `)
    .single();

  if (error) throw error;
  return data as Grill;
}

// Delete a grill
async function deleteGrill(id: string): Promise<void> {
  const { error } = await supabase.from('grills').delete().eq('id', id);
  if (error) throw error;
}

// Set a grill as primary (unset others)
async function setPrimaryGrill(id: string): Promise<Grill> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, unset all other grills as primary
  await supabase
    .from('grills')
    .update({ is_primary: false })
    .eq('user_id', user.id)
    .neq('id', id);

  // Then set the target grill as primary
  const { data, error } = await supabase
    .from('grills')
    .update({ is_primary: true })
    .eq('id', id)
    .select(`
      *,
      accessories (*)
    `)
    .single();

  if (error) throw error;
  return data as Grill;
}

// Hook to fetch all grills
export function useGrills() {
  return useQuery({
    queryKey: GRILLS_KEY,
    queryFn: fetchGrills,
  });
}

// Hook to fetch a single grill
export function useGrill(id: string | undefined) {
  return useQuery({
    queryKey: [...GRILLS_KEY, id],
    queryFn: () => fetchGrill(id!),
    enabled: !!id,
  });
}

// Hook for creating a grill with optimistic updates
export function useCreateGrill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGrill,
    onSuccess: (grill) => {
      posthog.capture('equipment_added', {
        equipment_type: 'grill',
        grill_type: grill.grill_type,
        ...(grill.brand && { grill_brand: grill.brand }),
      });
    },
    onMutate: async (newGrill) => {
      await queryClient.cancelQueries({ queryKey: GRILLS_KEY });
      const previousGrills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);

      if (previousGrills) {
        const optimisticGrill: Grill = {
          id: `temp-${Date.now()}`,
          user_id: '',
          name: newGrill.name,
          brand: newGrill.brand ?? null,
          model: newGrill.model ?? null,
          grill_type: newGrill.grill_type,
          notes: newGrill.notes ?? null,
          is_primary: newGrill.is_primary ?? previousGrills.length === 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          accessories: [],
        };
        queryClient.setQueryData<Grill[]>(GRILLS_KEY, [...previousGrills, optimisticGrill]);
      }

      return { previousGrills };
    },
    onError: (_, __, context) => {
      if (context?.previousGrills) {
        queryClient.setQueryData(GRILLS_KEY, context.previousGrills);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GRILLS_KEY });
    },
  });
}

// Hook for updating a grill with optimistic updates
export function useUpdateGrill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGrill,
    onMutate: async (updatedGrill) => {
      await queryClient.cancelQueries({ queryKey: GRILLS_KEY });
      await queryClient.cancelQueries({ queryKey: [...GRILLS_KEY, updatedGrill.id] });

      const previousGrills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);
      const previousGrill = queryClient.getQueryData<Grill>([...GRILLS_KEY, updatedGrill.id]);

      if (previousGrills) {
        queryClient.setQueryData<Grill[]>(
          GRILLS_KEY,
          previousGrills.map((g) =>
            g.id === updatedGrill.id
              ? { ...g, ...updatedGrill, updated_at: new Date().toISOString() }
              : g
          )
        );
      }

      if (previousGrill) {
        queryClient.setQueryData<Grill>([...GRILLS_KEY, updatedGrill.id], {
          ...previousGrill,
          ...updatedGrill,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousGrills, previousGrill };
    },
    onError: (_, updatedGrill, context) => {
      if (context?.previousGrills) {
        queryClient.setQueryData(GRILLS_KEY, context.previousGrills);
      }
      if (context?.previousGrill) {
        queryClient.setQueryData([...GRILLS_KEY, updatedGrill.id], context.previousGrill);
      }
    },
    onSettled: (_, __, updatedGrill) => {
      queryClient.invalidateQueries({ queryKey: GRILLS_KEY });
      queryClient.invalidateQueries({ queryKey: [...GRILLS_KEY, updatedGrill.id] });
    },
  });
}

// Hook for deleting a grill with optimistic updates
export function useDeleteGrill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGrill,
    onMutate: async (grillId) => {
      await queryClient.cancelQueries({ queryKey: GRILLS_KEY });
      const previousGrills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);

      if (previousGrills) {
        queryClient.setQueryData<Grill[]>(
          GRILLS_KEY,
          previousGrills.filter((g) => g.id !== grillId)
        );
      }

      return { previousGrills };
    },
    onError: (_, __, context) => {
      if (context?.previousGrills) {
        queryClient.setQueryData(GRILLS_KEY, context.previousGrills);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GRILLS_KEY });
    },
  });
}

// Hook for setting primary grill
export function useSetPrimaryGrill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setPrimaryGrill,
    onMutate: async (grillId) => {
      await queryClient.cancelQueries({ queryKey: GRILLS_KEY });
      const previousGrills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);

      if (previousGrills) {
        queryClient.setQueryData<Grill[]>(
          GRILLS_KEY,
          previousGrills.map((g) => ({
            ...g,
            is_primary: g.id === grillId,
          }))
        );
      }

      return { previousGrills };
    },
    onError: (_, __, context) => {
      if (context?.previousGrills) {
        queryClient.setQueryData(GRILLS_KEY, context.previousGrills);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GRILLS_KEY });
    },
  });
}

// Helper to get the primary grill from a list
export function getPrimaryGrill(grills: Grill[] | undefined): Grill | undefined {
  return grills?.find((g) => g.is_primary) ?? grills?.[0];
}

// Grill type metadata for UI
export const GRILL_TYPES: { value: GrillType; label: string; description: string }[] = [
  { value: 'kamado', label: 'Kamado', description: 'Ceramic cooker (Big Green Egg, Kamado Joe)' },
  { value: 'gas', label: 'Gas Grill', description: 'Propane or natural gas grill' },
  { value: 'charcoal', label: 'Charcoal Grill', description: 'Traditional charcoal grill' },
  { value: 'pellet', label: 'Pellet Grill', description: 'Wood pellet smoker (Traeger, Pit Boss)' },
  { value: 'offset', label: 'Offset Smoker', description: 'Traditional offset stick burner' },
  { value: 'kettle', label: 'Kettle', description: 'Weber kettle style grill' },
  { value: 'electric', label: 'Electric', description: 'Electric grill or smoker' },
  { value: 'other', label: 'Other', description: 'Other type of grill or smoker' },
];

// Common grill brands for suggestions
export const GRILL_BRANDS = [
  'Kamado Joe',
  'Big Green Egg',
  'Weber',
  'Traeger',
  'Pit Boss',
  'Char-Griller',
  "Oklahoma Joe's",
  'Masterbuilt',
  'Z Grills',
  'Camp Chef',
  'Napoleon',
  'Broil King',
  'Char-Broil',
  'Blackstone',
  'Yoder',
  'Rec Tec',
  'Other',
];
