import { useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export type InputState = 'default' | 'error' | 'success';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  state?: InputState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const stateStyles: Record<InputState, string> = {
  default: 'border-char-500 focus:border-ember-500',
  error: 'border-error',
  success: 'border-success',
};

export function Input({
  label,
  error,
  hint,
  state = 'default',
  leftIcon,
  rightIcon,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currentState = error ? 'error' : state;
  const isPassword = secureTextEntry !== undefined;

  return (
    <View className="w-full">
      {label && (
        <Text className="text-ash font-body-medium text-sm mb-2">{label}</Text>
      )}

      <View
        className={`
          flex-row items-center
          bg-char-700 border rounded-button
          ${stateStyles[currentState]}
          ${isFocused ? 'border-ember-500' : ''}
        `}
      >
        {leftIcon && <View className="pl-4">{leftIcon}</View>}

        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor="#818181"
          className={`
            flex-1 px-4 py-3
            text-ash font-body text-base
            ${leftIcon ? 'pl-2' : ''}
            ${rightIcon || isPassword ? 'pr-2' : ''}
          `}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="pr-4"
          >
            {showPassword ? (
              <EyeOff size={20} color="#818181" />
            ) : (
              <Eye size={20} color="#818181" />
            )}
          </Pressable>
        )}

        {rightIcon && !isPassword && <View className="pr-4">{rightIcon}</View>}
      </View>

      {error && (
        <Text className="text-error font-body text-sm mt-1">{error}</Text>
      )}

      {hint && !error && (
        <Text className="text-char-400 font-body text-sm mt-1">{hint}</Text>
      )}
    </View>
  );
}

// Password input convenience wrapper
export function PasswordInput(props: Omit<InputProps, 'secureTextEntry'>) {
  return <Input {...props} secureTextEntry />;
}
