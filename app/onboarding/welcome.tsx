import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ChefHat, Clock, Thermometer } from 'lucide-react-native';
import { Button, Body, Logo, LogoIcon } from '@/components/ui';
import { useAnalytics } from '@/lib/analytics';

export default function WelcomeScreen() {
  const router = useRouter();
  const { trackOnboardingStarted, trackOnboardingStepCompleted } = useAnalytics();

  const handleGetStarted = () => {
    trackOnboardingStarted();
    trackOnboardingStepCompleted('welcome');
    router.push('/onboarding/add-grill');
  };

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
          <LogoIcon size="xl" />
        </View>
        <View className="mb-4">
          <Logo size="xl" />
        </View>
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
              <Text className="text-ash-white font-body ml-4 flex-1">{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View className="w-full mb-8 px-2">
        <Button variant="primary" size="lg" fullWidth onPress={handleGetStarted}>
          Get Started
        </Button>
      </View>
    </View>
  );
}
