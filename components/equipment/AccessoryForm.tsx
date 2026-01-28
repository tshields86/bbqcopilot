import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AccessoryTypeSelector } from './AccessoryTypeSelector';
import { ACCESSORY_BRANDS } from '@/hooks/useAccessories';
import type { AccessoryType, Accessory } from '@/lib/types';

interface AccessoryFormData {
  name: string;
  accessory_type: AccessoryType;
  brand: string;
  notes: string;
}

interface AccessoryFormProps {
  initialData?: Partial<Accessory>;
  onSubmit: (data: AccessoryFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AccessoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Add Accessory',
}: AccessoryFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [accessoryType, setAccessoryType] = useState<AccessoryType | null>(
    initialData?.accessory_type ?? null
  );
  const [brand, setBrand] = useState(initialData?.brand ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!accessoryType) {
      newErrors.accessoryType = 'Please select an accessory type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      accessory_type: accessoryType!,
      brand: brand.trim() || '',
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
        {/* Accessory Type */}
        <View className="mb-4">
          <AccessoryTypeSelector
            label="What type of accessory is it?"
            value={accessoryType}
            onChange={setAccessoryType}
          />
          {errors.accessoryType && (
            <Text className="font-body text-sm text-ember-red mt-1">
              {errors.accessoryType}
            </Text>
          )}
        </View>

        {/* Name */}
        <Input
          label="Name"
          placeholder="e.g., Joetisserie, Pizza Stone"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        {/* Brand */}
        <Input
          label="Brand (optional)"
          placeholder="e.g., Kamado Joe, Weber"
          value={brand}
          onChangeText={setBrand}
          autoCapitalize="words"
        />

        {/* Brand Suggestions */}
        {!brand && (
          <View className="flex-row flex-wrap gap-2 -mt-2 mb-2">
            {ACCESSORY_BRANDS.slice(0, 5).map((suggestion) => (
              <Button
                key={suggestion}
                variant="secondary"
                size="sm"
                onPress={() => setBrand(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </View>
        )}

        {/* Notes */}
        <Input
          label="Notes (optional)"
          placeholder="Any special notes about this accessory..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
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
