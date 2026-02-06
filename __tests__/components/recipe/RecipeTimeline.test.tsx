import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { RecipeTimeline } from '@/components/recipe/RecipeTimeline';
import { mockTimelineSteps } from '../../helpers/testFixtures';

describe('RecipeTimeline', () => {
  const mockOnEatingTimeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the timeline header', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    expect(screen.getByText('Target Serving Time')).toBeTruthy();
    expect(screen.getByText('Cook Timeline')).toBeTruthy();
  });

  it('displays all timeline steps', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    // Check for step actions (from fixture)
    expect(screen.getByText('Start the fire')).toBeTruthy();
    expect(screen.getByText('Put brisket on')).toBeTruthy();
    expect(screen.getByText('Wrap the brisket')).toBeTruthy();
    expect(screen.getByText('Rest the brisket')).toBeTruthy();
    expect(screen.getByText('Serve')).toBeTruthy();
  });

  it('displays step details', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    // Details from the fixture
    expect(screen.getByText('Light your charcoal and bring the kamado to 225°F')).toBeTruthy();
  });

  it('displays step times', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    // The times from the fixture
    expect(screen.getByText('6:00 AM')).toBeTruthy();
    expect(screen.getByText('6:30 AM')).toBeTruthy();
  });

  it('displays temperature when provided', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    // Multiple steps have 225°F, so use getAllByText
    const temps225 = screen.getAllByText('225°F');
    expect(temps225.length).toBeGreaterThan(0);

    // One step has 250°F (from fixture)
    expect(screen.getByText('250°F')).toBeTruthy();
  });

  it('displays duration when provided', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    expect(screen.getByText('30 minutes')).toBeTruthy();
    expect(screen.getByText('8 hours')).toBeTruthy();
  });

  it('displays checkpoints when provided', () => {
    // Add a timeline with checkpoints for this test
    const timelineWithCheckpoints = [
      {
        ...mockTimelineSteps[0],
        checkpoints: ['Bark has formed', 'Internal temp reaches 165°F'],
      },
      ...mockTimelineSteps.slice(1),
    ];

    render(<RecipeTimeline timeline={timelineWithCheckpoints} />);

    expect(screen.getByText('What to look for:')).toBeTruthy();
    expect(screen.getByText(/Bark has formed/)).toBeTruthy();
  });

  it('uses initialEatingTime when provided', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} initialEatingTime="7:00 PM" />);

    expect(screen.getByText('7:00 PM')).toBeTruthy();
  });

  it('opens time picker when eating time is pressed', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    fireEvent.press(screen.getByText('Adjust'));

    expect(screen.getByText('Adjust Serving Time')).toBeTruthy();
  });

  it('shows quick select time options in picker', async () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    fireEvent.press(screen.getByText('Adjust'));

    await waitFor(() => {
      expect(screen.getByText('12 PM')).toBeTruthy();
      expect(screen.getByText('5 PM')).toBeTruthy();
      expect(screen.getByText('6 PM')).toBeTruthy();
      expect(screen.getByText('7 PM')).toBeTruthy();
    });
  });

  it('shows cancel and update buttons in picker', async () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    fireEvent.press(screen.getByText('Adjust'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeTruthy();
      expect(screen.getByText('Update Times')).toBeTruthy();
    });
  });

  it('closes picker when Cancel is pressed', async () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    fireEvent.press(screen.getByText('Adjust'));

    await waitFor(() => {
      expect(screen.getByText('Adjust Serving Time')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Adjust Serving Time')).toBeNull();
    });
  });

  it('calls onEatingTimeChange when time is updated', async () => {
    render(
      <RecipeTimeline timeline={mockTimelineSteps} onEatingTimeChange={mockOnEatingTimeChange} />
    );

    fireEvent.press(screen.getByText('Adjust'));

    await waitFor(() => {
      expect(screen.getByText('Update Times')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Update Times'));

    await waitFor(() => {
      expect(mockOnEatingTimeChange).toHaveBeenCalled();
    });
  });

  it('displays relative time formatting', () => {
    render(<RecipeTimeline timeline={mockTimelineSteps} />);

    // Check for relative time indicators
    // The first step should show something like "12 hours before serving"
    // The last step (relativeHours: 0) should show "Serving time"
    expect(screen.getByText('Serving time')).toBeTruthy();
  });
});
