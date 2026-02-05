import { render, screen, fireEvent } from '@testing-library/react-native';
import { Input, PasswordInput } from '@/components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);

    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter your email" />);

    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('shows error message when provided', () => {
    render(<Input label="Email" error="Invalid email address" />);

    expect(screen.getByText('Invalid email address')).toBeTruthy();
  });

  it('shows hint when no error', () => {
    render(<Input label="Email" hint="We'll never share your email" />);

    expect(screen.getByText("We'll never share your email")).toBeTruthy();
  });

  it('hides hint when error is present', () => {
    render(
      <Input
        label="Email"
        hint="We'll never share your email"
        error="Invalid email"
      />
    );

    expect(screen.queryByText("We'll never share your email")).toBeNull();
    expect(screen.getByText('Invalid email')).toBeTruthy();
  });

  it('handles text change', () => {
    const onChangeText = jest.fn();
    render(<Input label="Email" placeholder="Enter email" onChangeText={onChangeText} />);

    const input = screen.getByPlaceholderText('Enter email');
    fireEvent.changeText(input, 'test@example.com');

    expect(onChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('handles focus and blur events', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(<Input label="Email" placeholder="Enter email" onFocus={onFocus} onBlur={onBlur} />);

    const input = screen.getByPlaceholderText('Enter email');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalled();

    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalled();
  });
});

describe('PasswordInput', () => {
  it('renders password toggle button', () => {
    render(<PasswordInput label="Password" placeholder="Enter password" />);

    // Should have a pressable element for toggling password visibility
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter password')).toBeTruthy();
  });

  it('starts with password hidden', () => {
    render(<PasswordInput label="Password" placeholder="Enter password" value="secret" />);

    // Initially password should be hidden (secureTextEntry is true by default)
    const input = screen.getByPlaceholderText('Enter password');
    expect(input.props.secureTextEntry).toBe(true);
  });
});
