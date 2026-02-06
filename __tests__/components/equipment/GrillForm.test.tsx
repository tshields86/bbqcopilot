import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { GrillForm } from '@/components/equipment/GrillForm';
import { mockGrill } from '../../helpers/testFixtures';

// Mock the GrillTypeSelector component
jest.mock('@/components/equipment/GrillTypeSelector', () => ({
  GrillTypeSelector: ({ value, onChange, label }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID="grill-type-selector">
        <Text>{label}</Text>
        <Pressable testID="select-kamado" onPress={() => onChange('kamado')}>
          <Text>Kamado</Text>
        </Pressable>
        <Pressable testID="select-gas" onPress={() => onChange('gas')}>
          <Text>Gas</Text>
        </Pressable>
        {value && <Text testID="selected-type">{value}</Text>}
      </View>
    );
  },
}));

describe('GrillForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<GrillForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('What type of grill is it?')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., Big Joe, Backyard Beast')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., Kamado Joe, Weber, Traeger')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., Big Joe III, Genesis II')).toBeTruthy();
    expect(screen.getByPlaceholderText('Any special features or modifications...')).toBeTruthy();
  });

  it('shows brand suggestion buttons when brand is empty', () => {
    render(<GrillForm onSubmit={mockOnSubmit} />);

    // Should show brand suggestion buttons
    expect(screen.getByText('Kamado Joe')).toBeTruthy();
    expect(screen.getByText('Weber')).toBeTruthy();
  });

  it('clicking brand suggestion fills the brand field', () => {
    render(<GrillForm onSubmit={mockOnSubmit} />);

    fireEvent.press(screen.getByText('Weber'));

    // Brand suggestions should disappear after selection
    // and the input should have the value
    expect(screen.queryByText('Kamado Joe')).toBeNull();
  });

  it('shows validation error when submitting without name', async () => {
    render(<GrillForm onSubmit={mockOnSubmit} />);

    // Select a grill type
    fireEvent.press(screen.getByTestId('select-kamado'));

    // Submit without name
    fireEvent.press(screen.getByText('Save Grill'));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when submitting without grill type', async () => {
    render(<GrillForm onSubmit={mockOnSubmit} />);

    // Enter name but no grill type
    fireEvent.changeText(screen.getByPlaceholderText('e.g., Big Joe, Backyard Beast'), 'My Grill');

    fireEvent.press(screen.getByText('Save Grill'));

    await waitFor(() => {
      expect(screen.getByText('Please select a grill type')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with trimmed data on valid submission', async () => {
    render(<GrillForm onSubmit={mockOnSubmit} />);

    // Select grill type
    fireEvent.press(screen.getByTestId('select-kamado'));

    // Fill in form fields with extra whitespace
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g., Big Joe, Backyard Beast'),
      '  Big Joe  '
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g., Kamado Joe, Weber, Traeger'),
      '  Kamado Joe  '
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('e.g., Big Joe III, Genesis II'),
      '  Big Joe III  '
    );

    fireEvent.press(screen.getByText('Save Grill'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Big Joe',
        grill_type: 'kamado',
        brand: 'Kamado Joe',
        model: 'Big Joe III',
        notes: '',
      });
    });
  });

  it('shows Cancel button when onCancel is provided', () => {
    render(<GrillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('calls onCancel when Cancel is pressed', () => {
    render(<GrillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.press(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('pre-populates form with initialData', () => {
    render(
      <GrillForm
        onSubmit={mockOnSubmit}
        initialData={{
          name: 'Existing Grill',
          grill_type: 'kamado',
          brand: 'Kamado Joe',
          model: 'Classic III',
        }}
      />
    );

    expect(screen.getByDisplayValue('Existing Grill')).toBeTruthy();
    expect(screen.getByDisplayValue('Kamado Joe')).toBeTruthy();
    expect(screen.getByDisplayValue('Classic III')).toBeTruthy();
    expect(screen.getByTestId('selected-type')).toBeTruthy();
  });

  it('uses custom submitLabel when provided', () => {
    render(<GrillForm onSubmit={mockOnSubmit} submitLabel="Add My Grill" />);

    expect(screen.getByText('Add My Grill')).toBeTruthy();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<GrillForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

    // Cancel button should still be visible but disabled
    expect(screen.getByText('Cancel')).toBeTruthy();

    // When loading, button shows ActivityIndicator instead of text
    // So "Save Grill" text should not be visible
    expect(screen.queryByText('Save Grill')).toBeNull();
  });
});
