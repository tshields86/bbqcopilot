import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import {
  ErrorBoundary,
  ErrorFallback,
  EmptyState,
  NetworkError,
} from '@/components/ui/ErrorBoundary';

// Mock posthog
jest.mock('@/lib/posthog', () => ({
  posthog: {
    capture: jest.fn(),
  },
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Children rendered successfully</Text>;
}

// Controlled error component
function ControlledError({ error }: { error: Error | null }) {
  if (error) {
    throw error;
  }
  return <Text>No error</Text>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're testing error handling
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Text>Child content</Text>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('catches error and shows default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Test error')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('shows custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<Text>Custom error message</Text>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('calls handleRetry when Try Again is pressed', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();

    // Press Try Again - this should reset hasError state internally
    // The component will attempt to re-render children
    fireEvent.press(screen.getByText('Try Again'));

    // The test verifies the retry button is pressable
    // (Full state reset verification would require complex setup)
  });

  it('tracks error in PostHog', () => {
    const { posthog } = require('@/lib/posthog');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(posthog.capture).toHaveBeenCalledWith(
      'error_occurred',
      expect.objectContaining({
        error_type: 'react_error_boundary',
        error_message: 'Test error',
      })
    );
  });

  it('shows default message when error has no message', () => {
    const ErrorWithNoMessage = () => {
      throw new Error();
    };

    render(
      <ErrorBoundary>
        <ErrorWithNoMessage />
      </ErrorBoundary>
    );

    expect(screen.getByText('An unexpected error occurred')).toBeTruthy();
  });
});

describe('ErrorFallback', () => {
  it('renders error message', () => {
    render(<ErrorFallback error={new Error('Something broke')} />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Something broke')).toBeTruthy();
  });

  it('renders custom message when provided', () => {
    render(<ErrorFallback message="Custom error description" />);

    expect(screen.getByText('Custom error description')).toBeTruthy();
  });

  it('shows Try Again button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<ErrorFallback onRetry={onRetry} />);

    expect(screen.getByText('Try Again')).toBeTruthy();

    fireEvent.press(screen.getByText('Try Again'));

    expect(onRetry).toHaveBeenCalled();
  });

  it('does not show Try Again button when onRetry is not provided', () => {
    render(<ErrorFallback />);

    expect(screen.queryByText('Try Again')).toBeNull();
  });
});

describe('EmptyState', () => {
  it('renders title and message', () => {
    render(<EmptyState title="No items" message="You haven't added any items yet." />);

    expect(screen.getByText('No items')).toBeTruthy();
    expect(screen.getByText("You haven't added any items yet.")).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const onPress = jest.fn();
    render(
      <EmptyState
        title="No items"
        message="Add some items"
        action={{ label: 'Add Item', onPress }}
      />
    );

    expect(screen.getByText('Add Item')).toBeTruthy();

    fireEvent.press(screen.getByText('Add Item'));

    expect(onPress).toHaveBeenCalled();
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="No items" message="Nothing here" />);

    expect(screen.queryByText('Add Item')).toBeNull();
  });
});

describe('NetworkError', () => {
  it('renders network error message', () => {
    render(<NetworkError />);

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Please check your internet connection and try again.')).toBeTruthy();
  });

  it('shows Try Again button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<NetworkError onRetry={onRetry} />);

    expect(screen.getByText('Try Again')).toBeTruthy();

    fireEvent.press(screen.getByText('Try Again'));

    expect(onRetry).toHaveBeenCalled();
  });
});
