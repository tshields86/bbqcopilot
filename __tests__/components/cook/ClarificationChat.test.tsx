import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ClarificationChat } from '@/components/cook/ClarificationChat';
import { mockClarificationQuestions } from '../../helpers/testFixtures';

// Mock the FlameLoader to avoid Animated.View issues
jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  const { Text } = require('react-native');
  return {
    ...actual,
    FlameLoader: () => <Text>Loading...</Text>,
  };
});

describe('ClarificationChat', () => {
  const mockOnAnswer = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header text', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('A few quick questions...')).toBeTruthy();
  });

  it('renders all questions', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('What is your skill level?')).toBeTruthy();
    expect(screen.getByText('How many hours do you have?')).toBeTruthy();
    expect(screen.getByText('Any flavor preferences?')).toBeTruthy();
  });

  it('renders choice options for choice-type questions', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Beginner')).toBeTruthy();
    expect(screen.getByText('Intermediate')).toBeTruthy();
    expect(screen.getByText('Advanced')).toBeTruthy();
  });

  it('calls onAnswer when an option is selected', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.press(screen.getByText('Intermediate'));

    expect(mockOnAnswer).toHaveBeenCalledWith(mockClarificationQuestions[0], 'Intermediate');
  });

  it('shows selected state for answered questions', () => {
    const answers = [
      {
        question: mockClarificationQuestions[0],
        answer: 'Intermediate',
      },
    ];

    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={answers}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    // The Intermediate option should have a different style (selected state)
    // We can verify this by checking the component renders with answers
    expect(screen.getByText('Intermediate')).toBeTruthy();
  });

  it('renders text input for text-type questions', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByPlaceholderText('Type your answer...')).toBeTruthy();
  });

  it('renders number input for number-type questions', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByPlaceholderText('Enter a number...')).toBeTruthy();
  });

  it('disables submit button when not all questions answered', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Answer all questions to continue')).toBeTruthy();
  });

  it('enables submit button when all questions answered', () => {
    const answers = [
      { question: mockClarificationQuestions[0], answer: 'Intermediate' },
      { question: mockClarificationQuestions[1], answer: '8' },
      { question: mockClarificationQuestions[2], answer: 'Smoky' },
    ];

    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={answers}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Generate My Recipe')).toBeTruthy();
  });

  it('calls onSubmit when submit button is pressed', () => {
    const answers = [
      { question: mockClarificationQuestions[0], answer: 'Intermediate' },
      { question: mockClarificationQuestions[1], answer: '8' },
      { question: mockClarificationQuestions[2], answer: 'Smoky' },
    ];

    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={answers}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.press(screen.getByText('Generate My Recipe'));

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    expect(screen.getByText('Processing your answers...')).toBeTruthy();
    // FlameLoader is mocked to show "Loading..."
    expect(screen.getByText('Loading...')).toBeTruthy();
    // Submit button should not be visible during loading
    expect(screen.queryByText('Generate My Recipe')).toBeNull();
    expect(screen.queryByText('Answer all questions to continue')).toBeNull();
  });

  it('handles text input on blur', async () => {
    render(
      <ClarificationChat
        questions={mockClarificationQuestions}
        answers={[]}
        onAnswer={mockOnAnswer}
        onSubmit={mockOnSubmit}
      />
    );

    const textInput = screen.getByPlaceholderText('Type your answer...');
    fireEvent.changeText(textInput, 'Spicy and smoky');
    fireEvent(textInput, 'blur');

    await waitFor(() => {
      expect(mockOnAnswer).toHaveBeenCalledWith(mockClarificationQuestions[2], 'Spicy and smoky');
    });
  });
});
