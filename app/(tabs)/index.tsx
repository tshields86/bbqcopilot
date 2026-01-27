import { View, ScrollView } from 'react-native';
import { Flame, Plus } from 'lucide-react-native';
import { Link } from 'expo-router';
import {
  H2,
  H4,
  Body,
  Button,
  Card,
  PressableCard,
  Badge,
  IconContainer,
} from '@/components/ui';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-char-800">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <H2 className="mb-2">BBQCopilot</H2>
          <Body color="muted">Your AI-powered pitmaster assistant</Body>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <H4 className="mb-4">Quick Actions</H4>
          <Link href="/(tabs)/cook" asChild>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<Flame size={24} color="#F5F5F0" />}
            >
              Start New Cook
            </Button>
          </Link>
        </View>

        {/* Recent Cooks Placeholder */}
        <View className="mb-8">
          <H4 className="mb-4">Recent Cooks</H4>
          <Card variant="default">
            <View className="items-center py-4">
              <Body color="muted" className="text-center">
                No cooks yet. Start your first cook to see it here!
              </Body>
            </View>
          </Card>
        </View>

        {/* Equipment Summary */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <H4>Your Equipment</H4>
            <Badge variant="warning" size="sm">
              Setup Required
            </Badge>
          </View>
          <Link href="/(tabs)/equipment" asChild>
            <PressableCard variant="default">
              <View className="flex-row items-center">
                <IconContainer
                  icon={Plus}
                  size="md"
                  color="copper"
                  background="copper"
                />
                <View className="ml-4 flex-1">
                  <Body>Add Your First Grill</Body>
                  <Body color="muted" className="text-sm">
                    Get personalized recipes for your equipment
                  </Body>
                </View>
              </View>
            </PressableCard>
          </Link>
        </View>

        {/* BBQ Tip */}
        <Card variant="outlined">
          <View className="flex-row items-start">
            <Flame size={20} color="#B87333" />
            <View className="ml-3 flex-1">
              <Body className="font-body-semibold mb-1">Pitmaster Tip</Body>
              <Body color="muted" className="text-sm">
                Always let your meat rest for at least 10 minutes after cooking.
                This allows the juices to redistribute for maximum flavor.
              </Body>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
