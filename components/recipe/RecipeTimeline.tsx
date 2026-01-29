import { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Clock, Thermometer, AlertCircle, ChevronUp, ChevronDown, X } from 'lucide-react-native';
import { Card, H3, Button } from '@/components/ui';
import type { TimelineStep } from '@/lib/types';
import {
  recalculateTimeline,
  getTimeUntilStart,
  getDefaultEatingTime,
  formatRelativeTime,
  parseTimeString,
  formatTime12Hour,
} from '@/lib/timeUtils';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface RecipeTimelineProps {
  timeline: TimelineStep[];
  initialEatingTime?: string;
  onEatingTimeChange?: (newTime: string, updatedTimeline: TimelineStep[]) => void;
}

export function RecipeTimeline({
  timeline: initialTimeline,
  initialEatingTime,
  onEatingTimeChange,
}: RecipeTimelineProps) {
  const [eatingTime, setEatingTime] = useState(initialEatingTime || getDefaultEatingTime());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempHours, setTempHours] = useState(18);
  const [tempMinutes, setTempMinutes] = useState(0);
  const [hasAdjusted, setHasAdjusted] = useState(false);

  // Recalculate timeline when eating time changes
  const timeline = useMemo(() => {
    if (!hasAdjusted) return initialTimeline;
    return recalculateTimeline(initialTimeline, eatingTime);
  }, [initialTimeline, eatingTime, hasAdjusted]);

  // Calculate countdown to start
  const countdown = useMemo(() => {
    return getTimeUntilStart(eatingTime, timeline);
  }, [eatingTime, timeline]);

  // Parse eating time when opening picker
  useEffect(() => {
    if (isPickerOpen) {
      const parsed = parseTimeString(eatingTime);
      if (parsed) {
        setTempHours(parsed.hours);
        setTempMinutes(parsed.minutes);
      }
    }
  }, [isPickerOpen, eatingTime]);

  const incrementHours = () => setTempHours((h) => (h + 1) % 24);
  const decrementHours = () => setTempHours((h) => (h - 1 + 24) % 24);
  const incrementMinutes = () => {
    setTempMinutes((m) => {
      const newMinutes = (m + 15) % 60;
      if (newMinutes < m) setTempHours((h) => (h + 1) % 24);
      return newMinutes;
    });
  };
  const decrementMinutes = () => {
    setTempMinutes((m) => {
      const newMinutes = (m - 15 + 60) % 60;
      if (newMinutes > m) setTempHours((h) => (h - 1 + 24) % 24);
      return newMinutes;
    });
  };

  const handleConfirmTime = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTime = formatTime12Hour(tempHours, tempMinutes);
    setEatingTime(newTime);
    setHasAdjusted(true);
    setIsPickerOpen(false);

    // Notify parent of change
    if (onEatingTimeChange) {
      const updatedTimeline = recalculateTimeline(initialTimeline, newTime);
      onEatingTimeChange(newTime, updatedTimeline);
    }
  };

  // Display format for picker
  const displayHours = tempHours === 0 ? 12 : tempHours > 12 ? tempHours - 12 : tempHours;
  const displayPeriod = tempHours >= 12 ? 'PM' : 'AM';
  const displayMinutes = tempMinutes.toString().padStart(2, '0');

  return (
    <Card variant="outlined" className="mb-4">
      {/* Eating Time Header */}
      <Pressable
        onPress={() => setIsPickerOpen(true)}
        className="bg-ember-red/10 rounded-xl p-4 mb-4 border border-ember-red/20"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-ember-red/20 items-center justify-center">
              <Clock size={20} color="#C41E3A" />
            </View>
            <View>
              <Text className="font-body text-xs text-char-300 mb-0.5">Target Serving Time</Text>
              <Text className="font-mono-bold text-2xl text-ash-white">{eatingTime}</Text>
              {countdown && !countdown.isPast && (
                <Text className="font-body text-sm text-copper-glow mt-0.5">
                  Start cooking in {countdown.hours}h {countdown.minutes}m
                </Text>
              )}
              {countdown && countdown.isPast && (
                <Text className="font-body text-sm text-warning mt-0.5">Start time has passed</Text>
              )}
            </View>
          </View>
          <View className="bg-char-black/50 px-3 py-1.5 rounded-lg">
            <Text className="font-body-semibold text-sm text-copper-glow">Adjust</Text>
          </View>
        </View>
      </Pressable>

      {/* Time Picker Modal */}
      <Modal
        visible={isPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPickerOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/70 justify-center items-center px-6"
          onPress={() => setIsPickerOpen(false)}
        >
          <Pressable
            className="bg-char-700 rounded-2xl w-full max-w-sm overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-char-500/30">
              <Text className="font-display text-lg text-ash-white">Adjust Serving Time</Text>
              <Pressable onPress={() => setIsPickerOpen(false)} className="p-1">
                <X size={20} color="#4A4A4A" />
              </Pressable>
            </View>

            {/* Info text */}
            <View className="px-4 pt-3">
              <Text className="font-body text-sm text-char-300 text-center">
                All timeline steps will automatically update based on your new serving time.
              </Text>
            </View>

            {/* Time picker wheels */}
            <View className="flex-row justify-center items-center py-6 gap-2">
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
              <Button variant="ghost" onPress={() => setIsPickerOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onPress={handleConfirmTime} className="flex-1">
                Update Times
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Timeline Header */}
      <H3 className="mb-4">Cook Timeline</H3>

      {/* Timeline Steps */}
      <View className="gap-0">
        {timeline.map((step, index) => (
          <View key={index} className="flex-row">
            {/* Timeline line */}
            <View className="items-center mr-4">
              {/* Dot */}
              <View className="w-4 h-4 rounded-full bg-copper-glow items-center justify-center">
                <View className="w-2 h-2 rounded-full bg-ash-white" />
              </View>
              {/* Line */}
              {index < timeline.length - 1 && (
                <View className="w-0.5 flex-1 bg-char-500/30 min-h-[60px]" />
              )}
            </View>

            {/* Content */}
            <View className="flex-1 pb-6">
              {/* Time */}
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="font-mono text-sm text-copper-glow">{step.time}</Text>
                {step.duration && (
                  <View className="flex-row items-center gap-1 bg-char-black/50 px-2 py-0.5 rounded">
                    <Clock size={10} color="#4A4A4A" />
                    <Text className="font-mono text-xs text-char-300">{step.duration}</Text>
                  </View>
                )}
              </View>

              {/* Relative time indicator */}
              <Text className="font-body text-xs text-char-400 mb-1">
                {formatRelativeTime(step.relativeHours)}
              </Text>

              {/* Action */}
              <Text className="font-body-semibold text-base text-ash-white mb-1">
                {step.action}
              </Text>

              {/* Details */}
              <Text className="font-body text-sm text-char-300 mb-2">{step.details}</Text>

              {/* Temperature */}
              {step.temperature && (
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Thermometer size={14} color="#C41E3A" />
                  <Text className="font-mono-bold text-sm text-ember-red">{step.temperature}</Text>
                </View>
              )}

              {/* Checkpoints */}
              {step.checkpoints && step.checkpoints.length > 0 && (
                <View className="bg-warning/10 rounded-lg p-3 gap-1.5">
                  <View className="flex-row items-center gap-1.5 mb-1">
                    <AlertCircle size={12} color="#D4A574" />
                    <Text className="font-body-semibold text-xs text-warning">
                      What to look for:
                    </Text>
                  </View>
                  {step.checkpoints.map((checkpoint, cpIndex) => (
                    <Text key={cpIndex} className="font-body text-xs text-char-300 pl-4">
                      * {checkpoint}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
