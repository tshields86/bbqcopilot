import { render, screen, fireEvent } from '@testing-library/react-native';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and message', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Delete Item')).toBeTruthy();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeTruthy();
  });

  it('renders default button labels', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Cancel')).toBeTruthy();
    expect(screen.getByText('Confirm')).toBeTruthy();
  });

  it('uses custom button labels when provided', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
      />
    );

    expect(screen.getByText('Yes, Delete')).toBeTruthy();
    expect(screen.getByText('No, Keep')).toBeTruthy();
  });

  it('calls onClose when Cancel is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.press(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onConfirm when Confirm is pressed', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.press(screen.getByText('Confirm'));

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('shows loading state on confirm button', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    // When loading, Confirm button shows ActivityIndicator instead of text
    expect(screen.queryByText('Confirm')).toBeNull();
  });

  it('does not render when visible is false', () => {
    render(<ConfirmDialog {...defaultProps} visible={false} />);

    expect(screen.queryByText('Delete Item')).toBeNull();
  });
});
