import { View, Text, Pressable } from 'react-native';
import { Calendar, Clock, ChevronRight, Flame } from 'lucide-react-native';
import { Card } from '@/components/ui';
import type { CookLog } from '@/lib/types';

interface CookLogCardProps {
  log: CookLog;
  onPress?: () => void;
}

export function CookLogCard({ log, onPress }: CookLogCardProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Render rating flames
  const renderRating = (rating: number | null) => {
    if (!rating) return null;
    return (
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Flame
            key={i}
            size={14}
            color={i <= rating ? '#C41E3A' : '#4A4A4A'}
            fill={i <= rating ? '#C41E3A' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Card
          variant="outlined"
          className={`${pressed && onPress ? 'opacity-80 scale-[0.98]' : ''}`}
        >
          <View className="flex-row items-start">
            {/* Content */}
            <View className="flex-1">
              {/* Recipe title or "Quick Cook" */}
              <Text className="font-body-semibold text-base text-ash-white mb-1">
                {log.recipe?.title || 'Quick Cook'}
              </Text>

              {/* Date and time */}
              <View className="flex-row items-center gap-4 mb-2">
                <View className="flex-row items-center gap-1">
                  <Calendar size={12} color="#4A4A4A" />
                  <Text className="font-body text-xs text-char-300">
                    {formatDate(log.cooked_at)}
                  </Text>
                </View>

                {log.actual_time_minutes && (
                  <View className="flex-row items-center gap-1">
                    <Clock size={12} color="#4A4A4A" />
                    <Text className="font-body text-xs text-char-300">
                      {formatTime(log.actual_time_minutes)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Rating */}
              {log.rating && <View className="mb-2">{renderRating(log.rating)}</View>}

              {/* Notes preview */}
              {log.notes && (
                <Text className="font-body text-sm text-char-300" numberOfLines={2}>
                  {log.notes}
                </Text>
              )}
            </View>

            {/* Arrow */}
            {onPress && <ChevronRight size={20} color="#4A4A4A" className="ml-2" />}
          </View>
        </Card>
      )}
    </Pressable>
  );
}
