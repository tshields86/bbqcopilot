import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { posthog } from '@/lib/posthog';
import type { Accessory, AccessoryType, Grill } from '@/lib/types';
import type { InsertTables, UpdateTables } from '@/lib/database.types';

const GRILLS_KEY = ['grills'];
const ACCESSORIES_KEY = ['accessories'];

type AccessoryInsert = InsertTables<'accessories'>;
type AccessoryUpdate = UpdateTables<'accessories'>;

// Fetch all accessories for a specific grill
async function fetchAccessoriesForGrill(grillId: string): Promise<Accessory[]> {
  const { data, error } = await supabase
    .from('accessories')
    .select('*')
    .eq('grill_id', grillId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Accessory[];
}

// Create a new accessory
async function createAccessory(accessory: AccessoryInsert): Promise<Accessory> {
  const { data, error } = await supabase.from('accessories').insert(accessory).select().single();

  if (error) throw error;
  return data as Accessory;
}

// Update an existing accessory
async function updateAccessory({
  id,
  ...updates
}: AccessoryUpdate & { id: string }): Promise<Accessory> {
  const { data, error } = await supabase
    .from('accessories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Accessory;
}

// Delete an accessory
async function deleteAccessory(id: string): Promise<void> {
  const { error } = await supabase.from('accessories').delete().eq('id', id);
  if (error) throw error;
}

// Hook to fetch accessories for a specific grill
export function useAccessories(grillId: string | undefined) {
  return useQuery({
    queryKey: [...ACCESSORIES_KEY, grillId],
    queryFn: () => fetchAccessoriesForGrill(grillId!),
    enabled: !!grillId,
  });
}

// Hook for creating an accessory with optimistic updates
export function useCreateAccessory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccessory,
    onSuccess: (accessory) => {
      posthog.capture('equipment_added', {
        equipment_type: 'accessory',
        accessory_type: accessory.accessory_type,
      });
    },
    onMutate: async (newAccessory) => {
      const grillId = newAccessory.grill_id;

      await queryClient.cancelQueries({ queryKey: [...ACCESSORIES_KEY, grillId] });
      await queryClient.cancelQueries({ queryKey: GRILLS_KEY });

      const previousAccessories = queryClient.getQueryData<Accessory[]>([
        ...ACCESSORIES_KEY,
        grillId,
      ]);
      const previousGrills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);

      // Optimistic accessory
      const optimisticAccessory: Accessory = {
        id: `temp-${Date.now()}`,
        grill_id: grillId,
        name: newAccessory.name,
        accessory_type: newAccessory.accessory_type,
        brand: newAccessory.brand ?? null,
        notes: newAccessory.notes ?? null,
        created_at: new Date().toISOString(),
      };

      // Update accessories list
      if (previousAccessories) {
        queryClient.setQueryData<Accessory[]>(
          [...ACCESSORIES_KEY, grillId],
          [...previousAccessories, optimisticAccessory]
        );
      }

      // Update grills list (nested accessories)
      if (previousGrills) {
        queryClient.setQueryData<Grill[]>(
          GRILLS_KEY,
          previousGrills.map((g) =>
            g.id === grillId
              ? { ...g, accessories: [...(g.accessories || []), optimisticAccessory] }
              : g
          )
        );
      }

      return { previousAccessories, previousGrills, grillId };
    },
    onError: (_, newAccessory, context) => {
      if (context?.previousAccessories) {
        queryClient.setQueryData(
          [...ACCESSORIES_KEY, context.grillId],
          context.previousAccessories
        );
      }
      if (context?.previousGrills) {
        queryClient.setQueryData(GRILLS_KEY, context.previousGrills);
      }
    },
    onSettled: (_, __, newAccessory) => {
      queryClient.invalidateQueries({ queryKey: [...ACCESSORIES_KEY, newAccessory.grill_id] });
      queryClient.invalidateQueries({ queryKey: GRILLS_KEY });
    },
  });
}

// Hook for updating an accessory with optimistic updates
export function useUpdateAccessory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccessory,
    onMutate: async (updatedAccessory) => {
      // We need to find the grill_id from existing data
      const grills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);
      let grillId: string | undefined;

      // Find the grill that contains this accessory
      if (grills) {
        for (const grill of grills) {
          if (grill.accessories?.some((a) => a.id === updatedAccessory.id)) {
            grillId = grill.id;
            break;
          }
        }
      }

      if (!grillId) return { previousAccessories: undefined, previousGrills: undefined };

      await queryClient.cancelQueries({ queryKey: [...ACCESSORIES_KEY, grillId] });
      await queryClient.cancelQueries({ queryKey: GRILLS_KEY });

      const previousAccessories = queryClient.getQueryData<Accessory[]>([
        ...ACCESSORIES_KEY,
        grillId,
      ]);
      const previousGrills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);

      // Update accessories list
      if (previousAccessories) {
        queryClient.setQueryData<Accessory[]>(
          [...ACCESSORIES_KEY, grillId],
          previousAccessories.map((a) =>
            a.id === updatedAccessory.id ? { ...a, ...updatedAccessory } : a
          )
        );
      }

      // Update grills list (nested accessories)
      if (previousGrills) {
        queryClient.setQueryData<Grill[]>(
          GRILLS_KEY,
          previousGrills.map((g) =>
            g.id === grillId
              ? {
                  ...g,
                  accessories: g.accessories?.map((a) =>
                    a.id === updatedAccessory.id ? { ...a, ...updatedAccessory } : a
                  ),
                }
              : g
          )
        );
      }

      return { previousAccessories, previousGrills, grillId };
    },
    onError: (_, __, context) => {
      if (context?.previousAccessories && context?.grillId) {
        queryClient.setQueryData(
          [...ACCESSORIES_KEY, context.grillId],
          context.previousAccessories
        );
      }
      if (context?.previousGrills) {
        queryClient.setQueryData(GRILLS_KEY, context.previousGrills);
      }
    },
    onSettled: (_, __, ___, context) => {
      if (context?.grillId) {
        queryClient.invalidateQueries({ queryKey: [...ACCESSORIES_KEY, context.grillId] });
      }
      queryClient.invalidateQueries({ queryKey: GRILLS_KEY });
    },
  });
}

// Hook for deleting an accessory with optimistic updates
export function useDeleteAccessory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, grillId }: { id: string; grillId: string }) => deleteAccessory(id),
    onMutate: async ({ id, grillId }) => {
      await queryClient.cancelQueries({ queryKey: [...ACCESSORIES_KEY, grillId] });
      await queryClient.cancelQueries({ queryKey: GRILLS_KEY });

      const previousAccessories = queryClient.getQueryData<Accessory[]>([
        ...ACCESSORIES_KEY,
        grillId,
      ]);
      const previousGrills = queryClient.getQueryData<Grill[]>(GRILLS_KEY);

      // Update accessories list
      if (previousAccessories) {
        queryClient.setQueryData<Accessory[]>(
          [...ACCESSORIES_KEY, grillId],
          previousAccessories.filter((a) => a.id !== id)
        );
      }

      // Update grills list (nested accessories)
      if (previousGrills) {
        queryClient.setQueryData<Grill[]>(
          GRILLS_KEY,
          previousGrills.map((g) =>
            g.id === grillId ? { ...g, accessories: g.accessories?.filter((a) => a.id !== id) } : g
          )
        );
      }

      return { previousAccessories, previousGrills, grillId };
    },
    onError: (_, __, context) => {
      if (context?.previousAccessories && context?.grillId) {
        queryClient.setQueryData(
          [...ACCESSORIES_KEY, context.grillId],
          context.previousAccessories
        );
      }
      if (context?.previousGrills) {
        queryClient.setQueryData(GRILLS_KEY, context.previousGrills);
      }
    },
    onSettled: (_, __, { grillId }) => {
      queryClient.invalidateQueries({ queryKey: [...ACCESSORIES_KEY, grillId] });
      queryClient.invalidateQueries({ queryKey: GRILLS_KEY });
    },
  });
}

// Accessory type metadata for UI
export const ACCESSORY_TYPES: { value: AccessoryType; label: string; description: string }[] = [
  { value: 'rotisserie', label: 'Rotisserie', description: 'Rotating spit for even cooking' },
  {
    value: 'griddle',
    label: 'Griddle',
    description: 'Flat cooking surface for breakfast or smash burgers',
  },
  {
    value: 'pizza_stone',
    label: 'Pizza Stone',
    description: 'Stone surface for crispy pizza crust',
  },
  { value: 'soapstone', label: 'Soapstone', description: 'Heat-retaining stone for searing' },
  { value: 'smoking_stone', label: 'Smoking Stone', description: 'Stone for indirect smoking' },
  { value: 'grill_expander', label: 'Grill Expander', description: 'Additional cooking surface' },
  { value: 'heat_deflector', label: 'Heat Deflector', description: 'For indirect cooking setup' },
  { value: 'cold_smoker', label: 'Cold Smoker', description: 'Attachment for cold smoking' },
  { value: 'thermometer', label: 'Thermometer', description: 'Temperature monitoring device' },
  { value: 'cover', label: 'Cover', description: 'Protective grill cover' },
  { value: 'other', label: 'Other', description: 'Other accessory type' },
];

// Common accessory brands for suggestions
export const ACCESSORY_BRANDS = [
  'Kamado Joe',
  'Big Green Egg',
  'Weber',
  'Thermoworks',
  'Meater',
  'FireBoard',
  'ThermoWorks',
  'Inkbird',
  'Other',
];
