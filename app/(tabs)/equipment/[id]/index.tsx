import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Edit2, Trash2, Star, Plus } from 'lucide-react-native';
import {
  useGrill,
  useUpdateGrill,
  useDeleteGrill,
  useSetPrimaryGrill,
  useDeleteAccessory,
} from '@/hooks';
import { Card, Button, FlameLoader, ConfirmDialog } from '@/components/ui';
import { GrillIcon, getGrillTypeName, AccessoryCard, GrillForm } from '@/components/equipment';

export default function GrillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: grill, isLoading } = useGrill(id);
  const updateGrill = useUpdateGrill();
  const deleteGrill = useDeleteGrill();
  const setPrimaryGrill = useSetPrimaryGrill();
  const deleteAccessory = useDeleteAccessory();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccessoryId, setDeletingAccessoryId] = useState<string | null>(null);

  if (isLoading || !grill) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
        </View>
      </>
    );
  }

  const handleUpdate = async (data: {
    name: string;
    grill_type:
      | 'kamado'
      | 'gas'
      | 'charcoal'
      | 'pellet'
      | 'offset'
      | 'kettle'
      | 'electric'
      | 'other';
    brand: string;
    model: string;
    notes: string;
  }) => {
    try {
      await updateGrill.mutateAsync({
        id: grill.id,
        name: data.name,
        grill_type: data.grill_type,
        brand: data.brand || null,
        model: data.model || null,
        notes: data.notes || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update grill:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGrill.mutateAsync(grill.id);
      router.back();
    } catch (error) {
      console.error('Failed to delete grill:', error);
    }
  };

  const handleSetPrimary = async () => {
    try {
      await setPrimaryGrill.mutateAsync(grill.id);
    } catch (error) {
      console.error('Failed to set primary grill:', error);
    }
  };

  const handleDeleteAccessory = async (accessoryId: string) => {
    try {
      await deleteAccessory.mutateAsync({ id: accessoryId, grillId: grill.id });
      setDeletingAccessoryId(null);
    } catch (error) {
      console.error('Failed to delete accessory:', error);
    }
  };

  if (isEditing) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Edit Grill',
            headerStyle: { backgroundColor: '#1A1A1A' },
            headerTintColor: '#F5F5F0',
          }}
        />
        <View className="flex-1 bg-char-black">
          <GrillForm
            initialData={grill}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={updateGrill.isPending}
            submitLabel="Save Changes"
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: grill.name,
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#F5F5F0',
          headerTitleStyle: {
            fontFamily: 'SourceSans3_600SemiBold',
          },
          headerRight: () => (
            <View className="flex-row gap-4 mr-2">
              <Pressable onPress={() => setIsEditing(true)} hitSlop={8}>
                <Edit2 size={20} color="#F5F5F0" />
              </Pressable>
              <Pressable onPress={() => setShowDeleteConfirm(true)} hitSlop={8}>
                <Trash2 size={20} color="#8B2635" />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-char-black" contentContainerClassName="p-4">
        {/* Grill Info Card */}
        <Card variant="elevated" className="mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-xl bg-mesquite-brown/20 items-center justify-center mr-4">
              <GrillIcon type={grill.grill_type} size={32} color="#B87333" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-display text-xl text-ash-white">{grill.name}</Text>
                {grill.is_primary && <Star size={16} color="#B87333" fill="#B87333" />}
              </View>
              <Text className="font-body text-char-300">{getGrillTypeName(grill.grill_type)}</Text>
            </View>
          </View>

          {(grill.brand || grill.model) && (
            <View className="mb-3">
              <Text className="font-body-medium text-sm text-char-300">Brand / Model</Text>
              <Text className="font-body text-ash-white">
                {[grill.brand, grill.model].filter(Boolean).join(' ')}
              </Text>
            </View>
          )}

          {grill.notes && (
            <View className="mb-3">
              <Text className="font-body-medium text-sm text-char-300">Notes</Text>
              <Text className="font-body text-ash-white">{grill.notes}</Text>
            </View>
          )}

          {!grill.is_primary && (
            <Button
              variant="secondary"
              size="sm"
              onPress={handleSetPrimary}
              loading={setPrimaryGrill.isPending}
              leftIcon={Star}
              className="mt-2"
            >
              Set as Primary
            </Button>
          )}
        </Card>

        {/* Accessories Section */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-display text-lg text-ash-white">Accessories</Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push(`/equipment/${grill.id}/add-accessory`)}
              leftIcon={Plus}
            >
              Add
            </Button>
          </View>

          {grill.accessories && grill.accessories.length > 0 ? (
            <View className="gap-2">
              {grill.accessories.map((accessory) => (
                <AccessoryCard
                  key={accessory.id}
                  accessory={accessory}
                  onDelete={() => setDeletingAccessoryId(accessory.id)}
                />
              ))}
            </View>
          ) : (
            <Card variant="outlined" className="items-center py-6">
              <Text className="font-body text-char-300 text-center">No accessories added yet.</Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.push(`/equipment/${grill.id}/add-accessory`)}
                className="mt-2"
              >
                Add your first accessory
              </Button>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Delete Grill Confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Grill?"
        message={`Are you sure you want to delete "${grill.name}"? This will also remove all accessories and cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteGrill.isPending}
      />

      {/* Delete Accessory Confirmation */}
      <ConfirmDialog
        visible={!!deletingAccessoryId}
        onClose={() => setDeletingAccessoryId(null)}
        onConfirm={() => deletingAccessoryId && handleDeleteAccessory(deletingAccessoryId)}
        title="Delete Accessory?"
        message="Are you sure you want to delete this accessory?"
        confirmLabel="Delete"
        destructive
        isLoading={deleteAccessory.isPending}
      />
    </>
  );
}
