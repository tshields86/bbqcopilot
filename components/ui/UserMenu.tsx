import { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { LogOut, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks';
import { ConfirmDialog } from './ConfirmDialog';

export function UserMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setLogoutDialogVisible(false);
      setMenuVisible(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Profile Button */}
      <Pressable
        onPress={() => setMenuVisible(true)}
        className="w-9 h-9 rounded-full bg-copper-glow/20 items-center justify-center mr-3 active:opacity-70"
        hitSlop={8}
      >
        <Text className="font-body-semibold text-sm text-copper-glow">{initials}</Text>
      </Pressable>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable className="flex-1 bg-black/60" onPress={() => setMenuVisible(false)}>
          <Pressable
            className="absolute top-20 right-4 bg-char-black rounded-2xl border border-char-500/20 overflow-hidden w-64"
            onPress={(e) => e.stopPropagation()}
          >
            {/* User Info */}
            <View className="p-4 border-b border-char-500/20">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-copper-glow/20 items-center justify-center mr-3">
                  <Text className="font-body-semibold text-base text-copper-glow">{initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-body-semibold text-base text-ash-white" numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text className="font-body text-xs text-char-300" numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View className="py-2">
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/settings');
                }}
                className="flex-row items-center px-4 py-3 active:bg-char-600/30"
              >
                <Settings size={20} color="#F5F5F0" />
                <Text className="font-body text-base text-ash-white ml-3">Settings</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  setLogoutDialogVisible(true);
                }}
                className="flex-row items-center px-4 py-3 active:bg-char-600/30"
              >
                <LogOut size={20} color="#C41E3A" />
                <Text className="font-body text-base text-ember-red ml-3">Log Out</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
    </>
  );
}
