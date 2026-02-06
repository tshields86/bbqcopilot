import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, ChefHat, LogOut, ChevronLeft, Check } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile, SKILL_LEVELS } from '@/hooks';
import { H3, Body, Button, Card, Input, ConfirmDialog, FlameLoader } from '@/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSkillLevel(profile.skill_level);
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const nameChanged = displayName !== (profile.display_name || '');
      const skillChanged = skillLevel !== profile.skill_level;
      setHasChanges(nameChanged || skillChanged);
    }
  }, [displayName, skillLevel, profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile.mutateAsync({
        display_name: displayName.trim() || null,
        skill_level: skillLevel as 'beginner' | 'intermediate' | 'advanced' | null,
      });
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setLogoutDialogVisible(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-char-black" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <FlameLoader size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-char-black" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-char-500/20">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
          hitSlop={8}
        >
          <ChevronLeft size={24} color="#F5F5F0" />
        </Pressable>
        <H3 className="flex-1 text-ash-white">Settings</H3>
        {hasChanges && (
          <Button variant="primary" size="sm" onPress={handleSave} loading={isSaving}>
            Save
          </Button>
        )}
        {saveSuccess && (
          <View className="flex-row items-center">
            <Check size={20} color="#2D5A27" />
            <Text className="font-body text-sm text-success ml-1">Saved</Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Profile Section */}
        <View className="mb-6">
          <Text className="font-body-semibold text-sm text-char-300 uppercase tracking-wide mb-3">
            Profile
          </Text>
          <Card variant="default">
            <View className="gap-4">
              {/* Display Name */}
              <View>
                <Input
                  label="Display Name"
                  placeholder="What should we call you?"
                  value={displayName}
                  onChangeText={setDisplayName}
                  leftIcon={<User size={20} color="#818181" />}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <Text className="font-body text-xs text-char-400 -mt-2">
                  This is how you'll be greeted in the app
                </Text>
              </View>

              {/* Email (read-only) */}
              <View>
                <Text className="text-ash font-body-medium text-sm mb-2">Email</Text>
                <View className="flex-row items-center bg-char-700/50 border border-char-500 rounded-button px-4 py-3">
                  <Mail size={20} color="#818181" />
                  <Text className="flex-1 font-body text-base text-char-300 ml-2">
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Skill Level Section */}
        <View className="mb-6">
          <Text className="font-body-semibold text-sm text-char-300 uppercase tracking-wide mb-3">
            Experience Level
          </Text>
          <Card variant="default">
            <View className="gap-2">
              {SKILL_LEVELS.map((level) => (
                <Pressable
                  key={level.value}
                  onPress={() => setSkillLevel(level.value)}
                  className={`flex-row items-center p-3 rounded-xl border ${
                    skillLevel === level.value
                      ? 'border-ember-red bg-ember-red/10'
                      : 'border-char-500/30 bg-char-700/30'
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                      skillLevel === level.value
                        ? 'border-ember-red bg-ember-red'
                        : 'border-char-400'
                    }`}
                  >
                    {skillLevel === level.value && <Check size={12} color="#F5F5F0" />}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-body-semibold text-base ${
                        skillLevel === level.value ? 'text-ash-white' : 'text-char-200'
                      }`}
                    >
                      {level.label}
                    </Text>
                    <Text className="font-body text-sm text-char-400">{level.description}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <Text className="font-body-semibold text-sm text-char-300 uppercase tracking-wide mb-3">
            Account
          </Text>
          <Card variant="default">
            <Pressable
              onPress={() => setLogoutDialogVisible(true)}
              className="flex-row items-center py-2"
            >
              <View className="w-10 h-10 rounded-full bg-ember-red/10 items-center justify-center mr-3">
                <LogOut size={20} color="#C41E3A" />
              </View>
              <Text className="font-body text-base text-ember-red">Log Out</Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={logoutDialogVisible}
        onClose={() => setLogoutDialogVisible(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out? You'll need to sign in again to access your recipes and equipment."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        destructive
        isLoading={isLoggingOut}
      />
    </SafeAreaView>
  );
}
