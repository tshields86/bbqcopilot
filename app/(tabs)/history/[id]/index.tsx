import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, Flame, Trash2, Edit3, ChefHat } from 'lucide-react-native';
import { useCookLog, useUpdateCookLog, useDeleteCookLog } from '@/hooks';
import { Button, FlameLoader, Card, ConfirmDialog, Input } from '@/components/ui';

export default function CookLogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: log, isLoading } = useCookLog(id);
  const updateCookLog = useUpdateCookLog();
  const deleteCookLog = useDeleteCookLog();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');

  const startEditing = () => {
    if (!log) return;
    setRating(log.rating);
    setNotes(log.notes || '');
    setWhatWorked(log.what_worked || '');
    setWhatToImprove(log.what_to_improve || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateCookLog.mutateAsync({
        id,
        rating: rating ?? undefined,
        notes: notes.trim() || undefined,
        whatWorked: whatWorked.trim() || undefined,
        whatToImprove: whatToImprove.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update cook log:', error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCookLog.mutateAsync(id);
      router.back();
    } catch (error) {
      console.error('Failed to delete cook log:', error);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };

  const renderRating = (value: number | null, interactive = false) => {
    return (
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable
            key={i}
            onPress={interactive ? () => setRating(i) : undefined}
            disabled={!interactive}
            className={`
              ${interactive ? 'w-12 h-12 rounded-xl items-center justify-center' : ''}
              ${interactive && value && i <= value ? 'bg-ember-red/20' : ''}
              ${interactive && (!value || i > value) ? 'bg-char-black/50 border border-char-500/30' : ''}
            `}
          >
            <Flame
              size={interactive ? 24 : 20}
              color={value && i <= value ? '#C41E3A' : '#4A4A4A'}
              fill={value && i <= value ? '#C41E3A' : 'transparent'}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  if (isLoading || !log) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cook Log' }} />
        <View className="flex-1 bg-char-black items-center justify-center">
          <FlameLoader size="lg" />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: log.recipe?.title || 'Cook Log',
          headerRight: () =>
            !isEditing ? (
              <View className="flex-row gap-4 mr-2">
                <Pressable onPress={startEditing} hitSlop={8}>
                  <Edit3 size={22} color="#F5F5F0" />
                </Pressable>
                <Pressable onPress={() => setShowDeleteConfirm(true)} hitSlop={8}>
                  <Trash2 size={22} color="#8B2635" />
                </Pressable>
              </View>
            ) : null,
        }}
      />
      <ScrollView
        className="flex-1 bg-char-black"
        contentContainerClassName="p-4"
      >
        {/* Header Card */}
        <Card className="mb-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-12 h-12 rounded-full bg-copper-glow/20 items-center justify-center">
              <ChefHat size={24} color="#B87333" />
            </View>
            <View className="flex-1">
              <Text className="font-display text-lg text-ash-white">
                {log.recipe?.title || 'Quick Cook'}
              </Text>
              {log.recipe?.grill && (
                <Text className="font-body text-sm text-char-300">
                  on {log.recipe.grill.name}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color="#4A4A4A" />
              <Text className="font-body text-sm text-char-300">
                {formatDate(log.cooked_at)}
              </Text>
            </View>

            {log.actual_time_minutes && (
              <View className="flex-row items-center gap-2">
                <Clock size={16} color="#4A4A4A" />
                <Text className="font-body text-sm text-char-300">
                  {formatTime(log.actual_time_minutes)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Rating Section */}
        <Card className="mb-4">
          <Text className="font-body-semibold text-base text-ash-white mb-3">
            Rating
          </Text>
          {isEditing ? (
            <View>
              {renderRating(rating, true)}
              <Text className="font-body text-xs text-char-300 mt-2">
                {rating === 1 && 'Needs work'}
                {rating === 2 && 'Okay'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Great'}
                {rating === 5 && 'Perfect!'}
              </Text>
            </View>
          ) : log.rating ? (
            renderRating(log.rating)
          ) : (
            <Text className="font-body text-char-300">No rating</Text>
          )}
        </Card>

        {/* Notes Section */}
        <Card className="mb-4">
          <Text className="font-body-semibold text-base text-ash-white mb-3">
            Notes
          </Text>
          {isEditing ? (
            <Input
              placeholder="How was the cook?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          ) : log.notes ? (
            <Text className="font-body text-char-300">{log.notes}</Text>
          ) : (
            <Text className="font-body text-char-300/50 italic">No notes</Text>
          )}
        </Card>

        {/* What Worked Section */}
        <Card className="mb-4">
          <Text className="font-body-semibold text-base text-ash-white mb-3">
            What Worked
          </Text>
          {isEditing ? (
            <Input
              placeholder="Techniques, timings, temperatures..."
              value={whatWorked}
              onChangeText={setWhatWorked}
              multiline
              numberOfLines={2}
            />
          ) : log.what_worked ? (
            <Text className="font-body text-char-300">{log.what_worked}</Text>
          ) : (
            <Text className="font-body text-char-300/50 italic">Not recorded</Text>
          )}
        </Card>

        {/* What to Improve Section */}
        <Card className="mb-4">
          <Text className="font-body-semibold text-base text-ash-white mb-3">
            What to Improve
          </Text>
          {isEditing ? (
            <Input
              placeholder="Things to try differently..."
              value={whatToImprove}
              onChangeText={setWhatToImprove}
              multiline
              numberOfLines={2}
            />
          ) : log.what_to_improve ? (
            <Text className="font-body text-char-300">{log.what_to_improve}</Text>
          ) : (
            <Text className="font-body text-char-300/50 italic">Not recorded</Text>
          )}
        </Card>

        {/* Edit Actions */}
        {isEditing && (
          <View className="flex-row gap-3 mt-2">
            <Button
              variant="secondary"
              onPress={cancelEditing}
              disabled={updateCookLog.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleSave}
              loading={updateCookLog.isPending}
              disabled={updateCookLog.isPending}
              className="flex-1"
            >
              Save Changes
            </Button>
          </View>
        )}

        {/* View Recipe Button */}
        {!isEditing && log.recipe_id && (
          <Button
            variant="secondary"
            onPress={() => router.push(`/recipes/${log.recipe_id}`)}
            fullWidth
            className="mt-2"
          >
            View Recipe
          </Button>
        )}
      </ScrollView>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Cook Log?"
        message="Are you sure you want to delete this cook log? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleteCookLog.isPending}
      />
    </>
  );
}
