import { View, Text, Modal, Pressable } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center p-6"
        onPress={onClose}
      >
        <Pressable
          className="bg-char-black rounded-2xl p-6 w-full max-w-sm border border-char-500/20"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          {destructive && (
            <View className="w-12 h-12 rounded-full bg-ember-red/20 items-center justify-center mb-4 self-center">
              <AlertTriangle size={24} color="#C41E3A" />
            </View>
          )}

          {/* Title */}
          <Text className="font-display text-xl text-ash-white text-center mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="font-body text-sm text-char-300 text-center mb-6">
            {message}
          </Text>

          {/* Actions */}
          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              onPress={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              onPress={onConfirm}
              loading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              {confirmLabel}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
