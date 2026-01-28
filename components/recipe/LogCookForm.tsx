import { useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Flame } from 'lucide-react-native';
import { Input, Button, Card } from '@/components/ui';

interface LogCookFormData {
  rating: number | null;
  notes: string;
  whatWorked: string;
  whatToImprove: string;
  actualTimeMinutes: number | null;
}

interface LogCookFormProps {
  recipeName?: string;
  onSubmit: (data: LogCookFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function LogCookForm({ recipeName, onSubmit, onCancel, isLoading }: LogCookFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [actualTime, setActualTime] = useState('');

  const handleSubmit = () => {
    const actualTimeMinutes = actualTime ? parseInt(actualTime, 10) * 60 : null;
    onSubmit({
      rating,
      notes: notes.trim(),
      whatWorked: whatWorked.trim(),
      whatToImprove: whatToImprove.trim(),
      actualTimeMinutes,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        keyboardShouldPersistTaps="handled"
      >
        {recipeName && (
          <Text className="font-display text-lg text-ash-white mb-4">
            Logging cook for: {recipeName}
          </Text>
        )}

        {/* Rating */}
        <View className="mb-6">
          <Text className="font-body text-sm text-char-300 mb-2">
            How did it turn out?
          </Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                onPress={() => setRating(value)}
                className={`
                  w-12 h-12 rounded-xl items-center justify-center
                  ${rating && value <= rating ? 'bg-ember-red/20' : 'bg-char-black/50 border border-char-500/30'}
                `}
              >
                <Flame
                  size={24}
                  color={rating && value <= rating ? '#C41E3A' : '#4A4A4A'}
                  fill={rating && value <= rating ? '#C41E3A' : 'transparent'}
                />
              </Pressable>
            ))}
          </View>
          <Text className="font-body text-xs text-char-300 mt-1">
            {rating === 1 && 'Needs work'}
            {rating === 2 && 'Okay'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Great'}
            {rating === 5 && 'Perfect!'}
          </Text>
        </View>

        {/* Notes */}
        <Input
          label="Notes (optional)"
          placeholder="How was the cook? Any observations?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* What worked */}
        <Input
          label="What worked well? (optional)"
          placeholder="Techniques, timings, temperatures..."
          value={whatWorked}
          onChangeText={setWhatWorked}
          multiline
          numberOfLines={2}
        />

        {/* What to improve */}
        <Input
          label="What to improve next time? (optional)"
          placeholder="Things to try differently..."
          value={whatToImprove}
          onChangeText={setWhatToImprove}
          multiline
          numberOfLines={2}
        />

        {/* Actual cook time */}
        <Input
          label="Actual cook time (hours, optional)"
          placeholder="e.g., 8"
          value={actualTime}
          onChangeText={setActualTime}
          keyboardType="numeric"
        />

        {/* Actions */}
        <View className="flex-row gap-3 mt-6">
          {onCancel && (
            <Button
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            Save Cook Log
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
