import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, ChefHat, Clock, Thermometer } from 'lucide-react-native';
import { Button, H1, Body } from '@/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: ChefHat,
      text: 'Personalized recipes for your equipment',
    },
    {
      icon: Clock,
      text: 'Detailed cook timelines and prep guides',
    },
    {
      icon: Thermometer,
      text: 'Temperature guidance and checkpoints',
    },
  ];

  return (
    <View className="flex-1 bg-char-black p-6">
      {/* Header */}
      <View className="flex-1 justify-center items-center">
        <View className="bg-ember-red/20 p-6 rounded-full mb-6">
          <Flame size={64} color="#C41E3A" />
        </View>
        <H1 className="text-center mb-4">
          Welcome to BBQCopilot
        </H1>
        <Body className="text-char-300 text-center text-lg mb-8">
          Your AI-powered pitmaster assistant for perfect cooks every time
        </Body>

        {/* Features */}
        <View className="w-full max-w-sm gap-4">
          {features.map((feature, index) => (
            <View
              key={index}
              className="flex-row items-center bg-char-700 border border-char-500 p-4 rounded-xl"
            >
              <View className="w-10 h-10 rounded-lg bg-copper-glow/20 items-center justify-center">
                <feature.icon size={20} color="#B87333" />
              </View>
              <Text className="text-ash-white font-body ml-4 flex-1">
                {feature.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View className="w-full mb-8 px-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/onboarding/add-grill')}
        >
          Get Started
        </Button>
      </View>
    </View>
  );
}
