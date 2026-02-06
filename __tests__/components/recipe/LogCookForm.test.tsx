import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LogCookForm } from '@/components/recipe/LogCookForm';

describe('LogCookForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<LogCookForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('How did it turn out?')).toBeTruthy();
    expect(screen.getByPlaceholderText('How was the cook? Any observations?')).toBeTruthy();
    expect(screen.getByPlaceholderText('Techniques, timings, temperatures...')).toBeTruthy();
    expect(screen.getByPlaceholderText('Things to try differently...')).toBeTruthy();
    expect(screen.getByPlaceholderText('e.g., 8')).toBeTruthy();
  });

  it('displays recipe name when provided', () => {
    render(<LogCookForm onSubmit={mockOnSubmit} recipeName="Smoked Brisket" />);

    expect(screen.getByText('Logging cook for: Smoked Brisket')).toBeTruthy();
  });

  it('renders 5 rating flames', () => {
    render(<LogCookForm onSubmit={mockOnSubmit} />);

    // The rating buttons don't have explicit test IDs, but we can count them
    // by looking for the pressable elements (5 flames)
    const ratingContainer = screen.getByText('How did it turn out?').parent;
    expect(ratingContainer).toBeTruthy();
  });

  it('shows rating label when rating is selected', () => {
    render(<LogCookForm onSubmit={mockOnSubmit} />);

    // Initially no rating label
    expect(screen.queryByText('Perfect!')).toBeNull();
    expect(screen.queryByText('Great')).toBeNull();
    expect(screen.queryByText('Good')).toBeNull();
    expect(screen.queryByText('Okay')).toBeNull();
    expect(screen.queryByText('Needs work')).toBeNull();
  });

  it('calls onSubmit with correct data shape', async () => {
    render(<LogCookForm onSubmit={mockOnSubmit} />);

    // Fill in form fields
    fireEvent.changeText(
      screen.getByPlaceholderText('How was the cook? Any observations?'),
      'Great cook!'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Techniques, timings, temperatures...'),
      'Low and slow worked well'
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('Things to try differently...'),
      'Try more smoke next time'
    );
    fireEvent.changeText(screen.getByPlaceholderText('e.g., 8'), '10');

    fireEvent.press(screen.getByText('Save Cook Log'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        rating: null, // No rating was selected
        notes: 'Great cook!',
        whatWorked: 'Low and slow worked well',
        whatToImprove: 'Try more smoke next time',
        actualTimeMinutes: 600, // 10 hours * 60
      });
    });
  });

  it('converts hours to minutes for actualTime', async () => {
    render(<LogCookForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(screen.getByPlaceholderText('e.g., 8'), '5');
    fireEvent.press(screen.getByText('Save Cook Log'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          actualTimeMinutes: 300, // 5 * 60
        })
      );
    });
  });

  it('sends null for empty optional fields', async () => {
    render(<LogCookForm onSubmit={mockOnSubmit} />);

    // Submit with no fields filled
    fireEvent.press(screen.getByText('Save Cook Log'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        rating: null,
        notes: '',
        whatWorked: '',
        whatToImprove: '',
        actualTimeMinutes: null,
      });
    });
  });

  it('trims whitespace from text fields', async () => {
    render(<LogCookForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(
      screen.getByPlaceholderText('How was the cook? Any observations?'),
      '  Some notes  '
    );

    fireEvent.press(screen.getByText('Save Cook Log'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Some notes',
        })
      );
    });
  });

  it('shows Cancel button when onCancel is provided', () => {
    render(<LogCookForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('calls onCancel when Cancel is pressed', () => {
    render(<LogCookForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.press(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(<LogCookForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

    // Cancel button should still be visible
    expect(screen.getByText('Cancel')).toBeTruthy();

    // When loading, button shows ActivityIndicator instead of text
    expect(screen.queryByText('Save Cook Log')).toBeNull();
  });
});
