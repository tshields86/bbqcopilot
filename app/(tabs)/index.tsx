import { View, Text, ScrollView, Pressable } from 'react-native';
import { Flame, Plus } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-char-800">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-display text-ash mb-2">BBQCopilot</Text>
          <Text className="text-char-400 font-body">Your AI-powered pitmaster assistant</Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="text-lg font-body text-ash mb-4">Quick Actions</Text>
          <Link href="/(tabs)/cook" asChild>
            <Pressable className="bg-ember-500 rounded-card p-4 flex-row items-center justify-center active:scale-[0.98]">
              <Flame size={24} color="#F5F5F0" />
              <Text className="text-ash font-body text-lg ml-3">Start New Cook</Text>
            </Pressable>
          </Link>
        </View>

        {/* Recent Cooks Placeholder */}
        <View className="mb-8">
          <Text className="text-lg font-body text-ash mb-4">Recent Cooks</Text>
          <View className="bg-char-700 rounded-card p-6 items-center">
            <Text className="text-char-400 font-body text-center">
              No cooks yet. Start your first cook to see it here!
            </Text>
          </View>
        </View>

        {/* Equipment Summary Placeholder */}
        <View>
          <Text className="text-lg font-body text-ash mb-4">Your Equipment</Text>
          <Link href="/(tabs)/equipment" asChild>
            <Pressable className="bg-char-700 rounded-card p-4 flex-row items-center active:bg-char-600">
              <View className="bg-copper/20 p-3 rounded-full mr-4">
                <Plus size={24} color="#B87333" />
              </View>
              <View>
                <Text className="text-ash font-body">Add Your First Grill</Text>
                <Text className="text-char-400 font-body text-sm">
                  Get personalized recipes for your equipment
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
