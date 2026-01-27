import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GrillTypeSelector } from './GrillTypeSelector';
import { GRILL_BRANDS } from '@/hooks/useGrills';
import type { GrillType, Grill } from '@/lib/types';

interface GrillFormData {
  name: string;
  grill_type: GrillType;
  brand: string;
  model: string;
  notes: string;
}

interface GrillFormProps {
  initialData?: Partial<Grill>;
  onSubmit: (data: GrillFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function GrillForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Grill',
}: GrillFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [grillType, setGrillType] = useState<GrillType | null>(
    initialData?.grill_type ?? null
  );
  const [brand, setBrand] = useState(initialData?.brand ?? '');
  const [model, setModel] = useState(initialData?.model ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!grillType) {
      newErrors.grillType = 'Please select a grill type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      grill_type: grillType!,
      brand: brand.trim() || '',
      model: model.trim() || '',
      notes: notes.trim() || '',
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
        {/* Grill Type */}
        <View className="mb-4">
          <GrillTypeSelector
            label="What type of grill is it?"
            value={grillType}
            onChange={setGrillType}
          />
          {errors.grillType && (
            <Text className="font-body text-sm text-ember-red mt-1">
              {errors.grillType}
            </Text>
          )}
        </View>

        {/* Name */}
        <Input
          label="Nickname"
          placeholder="e.g., Big Joe, Backyard Beast"
          value={name}
          onChangeText={setName}
          error={errors.name}
          hint="Give your grill a memorable name"
        />

        {/* Brand */}
        <Input
          label="Brand (optional)"
          placeholder="e.g., Kamado Joe, Weber, Traeger"
          value={brand}
          onChangeText={setBrand}
          autoCapitalize="words"
        />

        {/* Brand Suggestions */}
        {!brand && (
          <View className="flex-row flex-wrap gap-2 -mt-2 mb-4">
            {GRILL_BRANDS.slice(0, 6).map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                onPress={() => setBrand(suggestion)}
                className="border border-smoke-gray/30"
              >
                {suggestion}
              </Button>
            ))}
          </View>
        )}

        {/* Model */}
        <Input
          label="Model (optional)"
          placeholder="e.g., Big Joe III, Genesis II"
          value={model}
          onChangeText={setModel}
          autoCapitalize="words"
        />

        {/* Notes */}
        <Input
          label="Notes (optional)"
          placeholder="Any special features or modifications..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
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
            {submitLabel}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
