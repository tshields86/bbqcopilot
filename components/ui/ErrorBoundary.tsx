import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-char-black items-center justify-center p-6">
          <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4">
            <AlertTriangle size={32} color="#8B2635" />
          </View>
          <Text className="font-display text-xl text-ash-white text-center mb-2">
            Something went wrong
          </Text>
          <Text className="font-body text-char-300 text-center mb-6">
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Pressable
            onPress={this.handleRetry}
            className="flex-row items-center gap-2 bg-ember-red px-6 py-3 rounded-xl active:opacity-80"
          >
            <RefreshCw size={18} color="#F5F5F0" />
            <Text className="font-body-semibold text-ash-white">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  message?: string;
}

export function ErrorFallback({ error, onRetry, message }: ErrorFallbackProps) {
  return (
    <View className="flex-1 bg-char-black items-center justify-center p-6">
      <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4">
        <AlertTriangle size={32} color="#8B2635" />
      </View>
      <Text className="font-display text-xl text-ash-white text-center mb-2">
        Something went wrong
      </Text>
      <Text className="font-body text-char-300 text-center mb-6">
        {message || error?.message || 'An unexpected error occurred'}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="flex-row items-center gap-2 bg-ember-red px-6 py-3 rounded-xl active:opacity-80"
        >
          <RefreshCw size={18} color="#F5F5F0" />
          <Text className="font-body-semibold text-ash-white">Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

// Empty state component
interface EmptyStateProps {
  icon?: React.ComponentType<{ size: number; color: string }>;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      {Icon && (
        <View className="w-16 h-16 rounded-full bg-copper-glow/20 items-center justify-center mb-4">
          <Icon size={32} color="#B87333" />
        </View>
      )}
      <Text className="font-display text-xl text-ash-white text-center mb-2">
        {title}
      </Text>
      <Text className="font-body text-char-300 text-center mb-6">
        {message}
      </Text>
      {action && (
        <Pressable
          onPress={action.onPress}
          className="bg-ember-red px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="font-body-semibold text-ash-white">{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Network error component
interface NetworkErrorProps {
  onRetry?: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <ErrorFallback
      message="Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}
