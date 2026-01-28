import { useMemo } from 'react';
import { View, ScrollView, RefreshControl, Text, Pressable } from 'react-native';
import { Flame, Plus, Heart, ChevronRight, Clock, Star } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useGrills, useCookLogs, useFavorites, useProfile } from '@/hooks';
import { GrillIcon } from '@/components/equipment';
import { CookLogCard } from '@/components/recipe';
import {
  H2,
  H4,
  Body,
  Button,
  Card,
  PressableCard,
  Badge,
  IconContainer,
  FlameLoader,
} from '@/components/ui';

const BBQ_TIPS = [
  "Always let your meat rest for at least 10 minutes after cooking. This allows the juices to redistribute for maximum flavor.",
  "The bark on brisket forms best when the surface stays dry. Avoid opening the lid too often!",
  "For the perfect smoke ring, keep your temperatures between 225-250°F for low and slow cooks.",
  "Fat side up or down? On a kamado, fat side up. On an offset, fat side toward the heat source.",
  "Don't rely solely on time - use internal temperature to judge doneness. Invest in a good meat thermometer.",
  "Give your grill time to preheat. 15-20 minutes ensures even cooking temperatures.",
  "For juicy chicken, brine it first! A simple salt water soak for 1-4 hours makes a huge difference.",
  "Wood chunks last longer than chips for smoking. Soak chips in water for sustained smoke.",
  "The stall is real! Brisket and pork shoulder often stall around 150-170°F. Be patient or wrap in butcher paper.",
  "Clean your grill grates while they're still warm for easiest cleanup.",
];

export default function HomeScreen() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: grills, isLoading: grillsLoading, refetch: refetchGrills } = useGrills();
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useCookLogs();
  const { data: favorites, refetch: refetchFavorites } = useFavorites();

  const isLoading = profileLoading || grillsLoading || logsLoading;
  const isRefetching = false;

  const refetch = () => {
    refetchGrills();
    refetchLogs();
    refetchFavorites();
  };

  // Get random tip based on day
  const todaysTip = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return BBQ_TIPS[dayOfYear % BBQ_TIPS.length];
  }, []);

  // Get recent cooks (last 3)
  const recentCooks = useMemo(() => {
    return (logs || []).slice(0, 3);
  }, [logs]);

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = profile?.display_name?.split(' ')[0] || 'Pitmaster';

  if (isLoading) {
    return (
      <View className="flex-1 bg-char-black items-center justify-center">
        <FlameLoader size="lg" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-char-black"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#B87333"
        />
      }
    >
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="font-body text-char-300 mb-1">{greeting},</Text>
          <H2 className="text-ash-white">{firstName}</H2>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <View className="flex-row gap-3">
            <Link href="/(tabs)/cook" asChild>
              <Pressable className="flex-1 bg-ember-red rounded-2xl p-4 active:opacity-90">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-3">
                  <Flame size={20} color="#F5F5F0" />
                </View>
                <Text className="font-body-semibold text-base text-ash-white">New Cook</Text>
                <Text className="font-body text-xs text-ash-white/70">Start cooking</Text>
              </Pressable>
            </Link>

            <Link href="/(tabs)/recipes" asChild>
              <Pressable className="flex-1 bg-mesquite-brown rounded-2xl p-4 active:opacity-90">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-3">
                  <Heart size={20} color="#F5F5F0" />
                </View>
                <Text className="font-body-semibold text-base text-ash-white">
                  Favorites
                </Text>
                <Text className="font-body text-xs text-ash-white/70">
                  {favorites?.length || 0} saved
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Equipment Summary */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <H4 className="text-ash-white">Your Equipment</H4>
            <Pressable onPress={() => router.push('/(tabs)/equipment')} hitSlop={8}>
              <Text className="font-body text-sm text-copper-glow">View all</Text>
            </Pressable>
          </View>

          {!grills || grills.length === 0 ? (
            <Link href="/(tabs)/equipment/add" asChild>
              <PressableCard variant="outlined">
                <View className="flex-row items-center">
                  <IconContainer
                    icon={Plus}
                    size="md"
                    color="copper"
                    background="copper"
                  />
                  <View className="ml-4 flex-1">
                    <Body className="text-ash-white">Add Your First Grill</Body>
                    <Body color="muted" className="text-sm">
                      Get personalized recipes for your equipment
                    </Body>
                  </View>
                  <ChevronRight size={20} color="#4A4A4A" />
                </View>
              </PressableCard>
            </Link>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3"
            >
              {grills.map((grill) => (
                <Pressable
                  key={grill.id}
                  onPress={() => router.push(`/(tabs)/equipment/${grill.id}`)}
                  className="bg-char-black/50 border border-char-500/30 rounded-xl p-4 w-36 active:opacity-80"
                >
                  <View className="items-center">
                    <View className="w-12 h-12 rounded-full bg-copper-glow/20 items-center justify-center mb-2">
                      <GrillIcon type={grill.grill_type} size={24} color="#B87333" />
                    </View>
                    <Text
                      className="font-body-semibold text-sm text-ash-white text-center"
                      numberOfLines={1}
                    >
                      {grill.name}
                    </Text>
                    <Text className="font-body text-xs text-char-300 capitalize">
                      {grill.grill_type.replace('_', ' ')}
                    </Text>
                    {grill.is_primary && (
                      <View className="mt-2">
                        <Badge variant="ember" size="sm">
                          Primary
                        </Badge>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
              <Pressable
                onPress={() => router.push('/(tabs)/equipment/add')}
                className="bg-char-black/50 border border-dashed border-char-500/30 rounded-xl p-4 w-36 items-center justify-center active:opacity-80"
              >
                <Plus size={24} color="#4A4A4A" />
                <Text className="font-body text-sm text-char-300 mt-2">Add Grill</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>

        {/* Recent Cooks */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <H4 className="text-ash-white">Recent Cooks</H4>
            {recentCooks.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/history')} hitSlop={8}>
                <Text className="font-body text-sm text-copper-glow">View all</Text>
              </Pressable>
            )}
          </View>

          {recentCooks.length === 0 ? (
            <Card variant="outlined">
              <View className="items-center py-4">
                <View className="w-12 h-12 rounded-full bg-char-600 items-center justify-center mb-3">
                  <Clock size={24} color="#4A4A4A" />
                </View>
                <Body color="muted" className="text-center">
                  No cooks yet. Start your first cook to track your BBQ journey!
                </Body>
              </View>
            </Card>
          ) : (
            <View className="gap-3">
              {recentCooks.map((log) => (
                <CookLogCard
                  key={log.id}
                  log={log}
                  onPress={() => router.push(`/(tabs)/history/${log.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Stats Summary */}
        {(logs?.length || 0) > 0 && (
          <View className="mb-6">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-char-black/50 border border-char-500/30 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <Flame size={16} color="#C41E3A" />
                  <Text className="font-body text-xs text-char-300">Total Cooks</Text>
                </View>
                <Text className="font-display text-2xl text-ash-white">
                  {logs?.length || 0}
                </Text>
              </View>
              <View className="flex-1 bg-char-black/50 border border-char-500/30 rounded-xl p-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <Star size={16} color="#B87333" />
                  <Text className="font-body text-xs text-char-300">Avg Rating</Text>
                </View>
                <Text className="font-display text-2xl text-ash-white">
                  {(() => {
                    const rated = logs?.filter((l) => l.rating) || [];
                    if (rated.length === 0) return '-';
                    const avg = rated.reduce((sum, l) => sum + (l.rating || 0), 0) / rated.length;
                    return avg.toFixed(1);
                  })()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* BBQ Tip of the Day */}
        <Card variant="outlined" className="mb-4">
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-full bg-copper-glow/20 items-center justify-center mr-3">
              <Flame size={20} color="#B87333" />
            </View>
            <View className="flex-1">
              <Text className="font-body-semibold text-sm text-copper-glow mb-1">
                Pitmaster Tip
              </Text>
              <Text className="font-body text-sm text-char-300 leading-5">
                {todaysTip}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
