import { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Clock, ChevronUp, ChevronDown, X } from 'lucide-react-native';
import { Button } from './Button';
import { parseTimeString, formatTime12Hour } from '@/lib/timeUtils';

interface TimePickerProps {
  value: string; // "HH:MM AM/PM" format
  onChange: (value: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempHours, setTempHours] = useState(18); // 6 PM default
  const [tempMinutes, setTempMinutes] = useState(0);

  // Parse initial value when opening
  useEffect(() => {
    if (isOpen && value) {
      const parsed = parseTimeString(value);
      if (parsed) {
        setTempHours(parsed.hours);
        setTempMinutes(parsed.minutes);
      }
    }
  }, [isOpen, value]);

  const incrementHours = () => {
    setTempHours((h) => (h + 1) % 24);
  };

  const decrementHours = () => {
    setTempHours((h) => (h - 1 + 24) % 24);
  };

  const incrementMinutes = () => {
    setTempMinutes((m) => {
      const newMinutes = (m + 15) % 60;
      if (newMinutes < m) {
        // Wrapped around, increment hour
        setTempHours((h) => (h + 1) % 24);
      }
      return newMinutes;
    });
  };

  const decrementMinutes = () => {
    setTempMinutes((m) => {
      const newMinutes = (m - 15 + 60) % 60;
      if (newMinutes > m) {
        // Wrapped around, decrement hour
        setTempHours((h) => (h - 1 + 24) % 24);
      }
      return newMinutes;
    });
  };

  const handleConfirm = () => {
    const newTime = formatTime12Hour(tempHours, tempMinutes);
    onChange(newTime);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Display format
  const displayHours = tempHours === 0 ? 12 : tempHours > 12 ? tempHours - 12 : tempHours;
  const displayPeriod = tempHours >= 12 ? 'PM' : 'AM';
  const displayMinutes = tempMinutes.toString().padStart(2, '0');

  return (
    <>
      {/* Trigger button */}
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center gap-2 bg-char-black/50 border border-char-500/30 rounded-lg px-4 py-3"
      >
        <Clock size={18} color="#B87333" />
        <View className="flex-1">
          {label && <Text className="font-body text-xs text-char-300 mb-0.5">{label}</Text>}
          <Text className="font-mono-bold text-lg text-ash-white">{value}</Text>
        </View>
        <Text className="font-body text-sm text-copper-glow">Edit</Text>
      </Pressable>

      {/* Modal picker */}
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleCancel}>
        <Pressable
          className="flex-1 bg-black/70 justify-center items-center px-6"
          onPress={handleCancel}
        >
          <Pressable
            className="bg-char-700 rounded-2xl w-full max-w-sm overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-char-500/30">
              <Text className="font-display text-lg text-ash-white">Set Eating Time</Text>
              <Pressable onPress={handleCancel} className="p-1">
                <X size={20} color="#4A4A4A" />
              </Pressable>
            </View>

            {/* Time picker wheels */}
            <View className="flex-row justify-center items-center py-8 gap-2">
              {/* Hours */}
              <View className="items-center">
                <Pressable
                  onPress={incrementHours}
                  className="p-3 active:bg-char-500/30 rounded-lg"
                >
                  <ChevronUp size={28} color="#B87333" />
                </Pressable>
                <View className="bg-char-black/50 rounded-xl px-6 py-4 min-w-[80px] items-center">
                  <Text className="font-mono-bold text-4xl text-ash-white">{displayHours}</Text>
                </View>
                <Pressable
                  onPress={decrementHours}
                  className="p-3 active:bg-char-500/30 rounded-lg"
                >
                  <ChevronDown size={28} color="#B87333" />
                </Pressable>
              </View>

              {/* Colon separator */}
              <Text className="font-mono-bold text-4xl text-char-300 mb-1">:</Text>

              {/* Minutes */}
              <View className="items-center">
                <Pressable
                  onPress={incrementMinutes}
                  className="p-3 active:bg-char-500/30 rounded-lg"
                >
                  <ChevronUp size={28} color="#B87333" />
                </Pressable>
                <View className="bg-char-black/50 rounded-xl px-6 py-4 min-w-[80px] items-center">
                  <Text className="font-mono-bold text-4xl text-ash-white">{displayMinutes}</Text>
                </View>
                <Pressable
                  onPress={decrementMinutes}
                  className="p-3 active:bg-char-500/30 rounded-lg"
                >
                  <ChevronDown size={28} color="#B87333" />
                </Pressable>
              </View>

              {/* AM/PM */}
              <View className="items-center ml-2">
                <Pressable
                  onPress={() => setTempHours((h) => (h + 12) % 24)}
                  className="p-3 active:bg-char-500/30 rounded-lg"
                >
                  <ChevronUp size={28} color="#B87333" />
                </Pressable>
                <View className="bg-char-black/50 rounded-xl px-4 py-4 min-w-[60px] items-center">
                  <Text className="font-mono-bold text-2xl text-ash-white">{displayPeriod}</Text>
                </View>
                <Pressable
                  onPress={() => setTempHours((h) => (h + 12) % 24)}
                  className="p-3 active:bg-char-500/30 rounded-lg"
                >
                  <ChevronDown size={28} color="#B87333" />
                </Pressable>
              </View>
            </View>

            {/* Quick select buttons */}
            <View className="flex-row justify-center gap-2 pb-4 px-4">
              {[
                { label: '12 PM', hours: 12 },
                { label: '5 PM', hours: 17 },
                { label: '6 PM', hours: 18 },
                { label: '7 PM', hours: 19 },
              ].map((preset) => (
                <Pressable
                  key={preset.label}
                  onPress={() => {
                    setTempHours(preset.hours);
                    setTempMinutes(0);
                  }}
                  className={`px-3 py-2 rounded-lg border ${
                    tempHours === preset.hours && tempMinutes === 0
                      ? 'border-ember-red bg-ember-red/20'
                      : 'border-char-500/30 bg-char-black/30'
                  }`}
                >
                  <Text
                    className={`font-body text-sm ${
                      tempHours === preset.hours && tempMinutes === 0
                        ? 'text-ember-red'
                        : 'text-char-300'
                    }`}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Actions */}
            <View className="flex-row gap-3 p-4 border-t border-char-500/30">
              <Button variant="ghost" onPress={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onPress={handleConfirm} className="flex-1">
                Set Time
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/**
 * Inline time display with edit button
 */
interface InlineTimeDisplayProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showCountdown?: { hours: number; minutes: number; isPast: boolean } | null;
}

export function InlineTimeDisplay({
  value,
  onChange,
  label,
  showCountdown,
}: InlineTimeDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <View className="bg-ember-red/10 rounded-xl p-4 border border-ember-red/30">
        <TimePicker
          value={value}
          onChange={(newValue) => {
            onChange(newValue);
            setIsEditing(false);
          }}
          label={label}
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => setIsEditing(true)}
      className="bg-gradient-to-r from-ember-red/10 to-copper-glow/10 rounded-xl p-4 border border-ember-red/20"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-ember-red/20 items-center justify-center">
            <Clock size={20} color="#C41E3A" />
          </View>
          <View>
            {label && <Text className="font-body text-xs text-char-300 mb-0.5">{label}</Text>}
            <Text className="font-mono-bold text-2xl text-ash-white">{value}</Text>
            {showCountdown && !showCountdown.isPast && (
              <Text className="font-body text-sm text-copper-glow mt-0.5">
                Start cooking in {showCountdown.hours}h {showCountdown.minutes}m
              </Text>
            )}
            {showCountdown && showCountdown.isPast && (
              <Text className="font-body text-sm text-warning mt-0.5">Start time has passed</Text>
            )}
          </View>
        </View>
        <View className="bg-char-black/50 px-3 py-1.5 rounded-lg">
          <Text className="font-body-semibold text-sm text-copper-glow">Adjust</Text>
        </View>
      </View>
    </Pressable>
  );
}
