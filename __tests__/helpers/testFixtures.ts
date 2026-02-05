import type {
  Grill,
  Accessory,
  Recipe,
  RecipeData,
  TimelineStep,
  CookLog,
  Profile,
  ClarificationQuestion,
  UsageStatus,
  UserUsage,
  Favorite,
} from '@/lib/types';

// ─── Users ───────────────────────────────────────────────

export const mockUser = {
  id: 'user-123',
  email: 'test@bbqcopilot.com',
};

export const mockSession = {
  access_token: 'mock-jwt-token',
  user: mockUser,
};

// ─── Profiles ────────────────────────────────────────────

export const mockProfile: Profile = {
  id: 'profile-1',
  user_id: 'user-123',
  display_name: 'Pitmaster Pete',
  skill_level: 'intermediate',
  onboarding_completed: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockNewProfile: Profile = {
  id: 'profile-2',
  user_id: 'user-456',
  display_name: null,
  skill_level: null,
  onboarding_completed: false,
  created_at: '2024-06-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

// ─── Accessories ─────────────────────────────────────────

export const mockAccessory: Accessory = {
  id: 'acc-1',
  grill_id: 'grill-1',
  name: 'Joetisserie',
  accessory_type: 'rotisserie',
  brand: 'Kamado Joe',
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockAccessory2: Accessory = {
  id: 'acc-2',
  grill_id: 'grill-1',
  name: 'DoJoe Pizza Stone',
  accessory_type: 'pizza_stone',
  brand: 'Kamado Joe',
  notes: null,
  created_at: '2024-01-02T00:00:00Z',
};

// ─── Grills ──────────────────────────────────────────────

export const mockGrill: Grill = {
  id: 'grill-1',
  user_id: 'user-123',
  name: 'Big Joe III',
  brand: 'Kamado Joe',
  model: 'Big Joe III',
  grill_type: 'kamado',
  notes: null,
  is_primary: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  accessories: [mockAccessory, mockAccessory2],
};

export const mockGrill2: Grill = {
  id: 'grill-2',
  user_id: 'user-123',
  name: 'Weber Genesis',
  brand: 'Weber',
  model: 'Genesis SPX-335',
  grill_type: 'gas',
  notes: 'Backup grill',
  is_primary: false,
  created_at: '2024-02-01T00:00:00Z',
  updated_at: '2024-02-01T00:00:00Z',
  accessories: [],
};

// ─── Timeline Steps ──────────────────────────────────────

export const mockTimelineSteps: TimelineStep[] = [
  {
    time: '6:00 AM',
    relativeHours: -12,
    action: 'Start the fire',
    details: 'Light your charcoal and bring the kamado to 225°F',
    temperature: '225°F',
    duration: '30 minutes',
  },
  {
    time: '6:30 AM',
    relativeHours: -11.5,
    action: 'Put brisket on',
    details: 'Place brisket fat side up on the grill grate',
    temperature: '225°F',
    duration: '8 hours',
  },
  {
    time: '2:30 PM',
    relativeHours: -3.5,
    action: 'Wrap the brisket',
    details: 'Wrap in butcher paper when bark is set and internal temp hits 165°F',
    temperature: '250°F',
  },
  {
    time: '5:30 PM',
    relativeHours: -0.5,
    action: 'Rest the brisket',
    details: 'Remove from grill and rest for at least 30 minutes',
  },
  {
    time: '6:00 PM',
    relativeHours: 0,
    action: 'Serve',
    details: 'Slice against the grain and serve',
  },
];

// ─── Recipes ─────────────────────────────────────────────

export const mockRecipeData: RecipeData = {
  title: 'Smoked Brisket',
  description: 'Low and slow smoked brisket on the Kamado Joe',
  proteins: [{ name: 'Brisket', weight: '12 lbs', quantity: 1 }],
  servings: 8,
  totalTimeMinutes: 780,
  difficulty: 'hard',
  ingredients: [
    { item: 'Whole packer brisket', amount: '12 lbs' },
    { item: 'Kosher salt', amount: '2 tbsp' },
    { item: 'Black pepper', amount: '2 tbsp' },
  ],
  equipmentNeeded: ['Kamado Joe Big Joe III', 'Heat deflector', 'Meat thermometer'],
  prepInstructions: [
    {
      step: 1,
      title: 'Trim the brisket',
      description: 'Trim excess fat to 1/4 inch thickness',
      timeMinutes: 20,
    },
    {
      step: 2,
      title: 'Season',
      description: 'Apply salt and pepper generously',
      timeMinutes: 5,
    },
  ],
  cookTimeline: mockTimelineSteps,
  tips: ['Use a leave-in thermometer', 'Cook to feel, not just temp'],
  servingSuggestions: ['Serve with pickles and white bread'],
  targetEatingTime: '6:00 PM',
};

export const mockRecipe: Recipe = {
  id: 'recipe-1',
  user_id: 'user-123',
  grill_id: 'grill-1',
  title: 'Smoked Brisket',
  description: 'Low and slow smoked brisket',
  proteins: [{ name: 'Brisket', weight: '12 lbs', quantity: 1 }],
  servings: 8,
  total_time_minutes: 780,
  difficulty: 'hard',
  recipe_data: mockRecipeData,
  ai_conversation: null,
  created_at: '2024-03-01T00:00:00Z',
  updated_at: '2024-03-01T00:00:00Z',
  grill: mockGrill,
};

export const mockRecipe2: Recipe = {
  id: 'recipe-2',
  user_id: 'user-123',
  grill_id: 'grill-2',
  title: 'Grilled Chicken',
  description: 'Simple grilled chicken thighs',
  proteins: [{ name: 'Chicken thighs', weight: '3 lbs', quantity: 8 }],
  servings: 4,
  total_time_minutes: 45,
  difficulty: 'easy',
  recipe_data: {
    ...mockRecipeData,
    title: 'Grilled Chicken',
    proteins: [{ name: 'Chicken thighs', weight: '3 lbs', quantity: 8 }],
    totalTimeMinutes: 45,
    difficulty: 'easy',
    cookTimeline: [
      {
        time: '5:30 PM',
        relativeHours: -0.5,
        action: 'Preheat grill',
        details: 'Heat to 400°F',
        temperature: '400°F',
      },
      {
        time: '6:00 PM',
        relativeHours: 0,
        action: 'Serve',
        details: 'Serve immediately',
      },
    ],
  },
  ai_conversation: null,
  created_at: '2024-04-01T00:00:00Z',
  updated_at: '2024-04-01T00:00:00Z',
  grill: mockGrill2,
};

// ─── Cook Logs ───────────────────────────────────────────

export const mockCookLog: CookLog = {
  id: 'log-1',
  user_id: 'user-123',
  recipe_id: 'recipe-1',
  cooked_at: '2024-03-15T18:00:00Z',
  rating: 4,
  notes: 'Turned out great!',
  what_worked: 'Low and slow approach',
  what_to_improve: 'More pepper next time',
  photos: [],
  weather_conditions: { temperature: 72, conditions: 'Sunny', wind: 'Light' },
  actual_time_minutes: 800,
  created_at: '2024-03-15T18:00:00Z',
  recipe: mockRecipe,
};

export const mockCookLog2: CookLog = {
  id: 'log-2',
  user_id: 'user-123',
  recipe_id: 'recipe-1',
  cooked_at: '2024-04-20T18:00:00Z',
  rating: 5,
  notes: 'Best one yet',
  what_worked: null,
  what_to_improve: null,
  photos: [],
  weather_conditions: null,
  actual_time_minutes: null,
  created_at: '2024-04-20T18:00:00Z',
};

export const mockCookLogNoRating: CookLog = {
  id: 'log-3',
  user_id: 'user-123',
  recipe_id: 'recipe-2',
  cooked_at: '2024-05-01T18:00:00Z',
  rating: null,
  notes: null,
  what_worked: null,
  what_to_improve: null,
  photos: [],
  weather_conditions: null,
  actual_time_minutes: null,
  created_at: '2024-05-01T18:00:00Z',
};

// ─── Favorites ───────────────────────────────────────────

export const mockFavorite: Favorite = {
  id: 'fav-1',
  user_id: 'user-123',
  recipe_id: 'recipe-1',
  created_at: '2024-03-01T00:00:00Z',
};

// ─── Clarification Questions ─────────────────────────────

export const mockClarificationQuestions: ClarificationQuestion[] = [
  {
    id: 'skill_level',
    question: 'What is your skill level?',
    type: 'choice',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
  {
    id: 'q-2',
    question: 'How many hours do you have?',
    type: 'number',
  },
  {
    id: 'q-3',
    question: 'Any flavor preferences?',
    type: 'text',
  },
];

// ─── Usage ───────────────────────────────────────────────

export const mockUsageStatus: UsageStatus = {
  used: 5,
  limit: 15,
  remaining: 10,
  tier: 'free',
  resetDate: '2024-04-01T00:00:00Z',
  isLimited: true,
};

export const mockUsageApproachingLimit: UsageStatus = {
  used: 13,
  limit: 15,
  remaining: 2,
  tier: 'free',
  resetDate: '2024-04-01T00:00:00Z',
  isLimited: true,
};

export const mockUsageAtLimit: UsageStatus = {
  used: 15,
  limit: 15,
  remaining: 0,
  tier: 'free',
  resetDate: '2024-04-01T00:00:00Z',
  isLimited: true,
};

export const mockUsageUnlimited: UsageStatus = {
  used: 100,
  limit: Infinity,
  remaining: Infinity,
  tier: 'unlimited',
  resetDate: '2024-04-01T00:00:00Z',
  isLimited: false,
};

export const mockUserUsage: UserUsage = {
  id: 'usage-1',
  user_id: 'user-123',
  period_start: '2024-03-01',
  recipes_generated: 5,
  clarifications_used: 12,
  last_request_at: '2024-03-15T10:00:00Z',
  created_at: '2024-03-01T00:00:00Z',
};
