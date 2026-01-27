// Database types
export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Grill {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  grill_type: GrillType;
  notes: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  accessories?: Accessory[];
}

export type GrillType =
  | 'kamado'
  | 'gas'
  | 'charcoal'
  | 'pellet'
  | 'offset'
  | 'kettle'
  | 'electric'
  | 'other';

export interface Accessory {
  id: string;
  grill_id: string;
  name: string;
  accessory_type: AccessoryType;
  brand: string | null;
  notes: string | null;
  created_at: string;
}

export type AccessoryType =
  | 'rotisserie'
  | 'griddle'
  | 'pizza_stone'
  | 'soapstone'
  | 'smoking_stone'
  | 'grill_expander'
  | 'heat_deflector'
  | 'cold_smoker'
  | 'thermometer'
  | 'cover'
  | 'other';

export interface Recipe {
  id: string;
  user_id: string;
  grill_id: string | null;
  title: string;
  description: string | null;
  proteins: ProteinItem[];
  servings: number | null;
  total_time_minutes: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  recipe_data: RecipeData;
  ai_conversation: ConversationMessage[] | null;
  created_at: string;
  updated_at: string;
  grill?: Grill;
  is_favorite?: boolean;
}

export interface ProteinItem {
  name: string;
  weight: string;
  quantity: number;
}

export interface RecipeData {
  title: string;
  description: string;
  proteins: ProteinItem[];
  servings: number;
  totalTimeMinutes: number;
  difficulty: string;
  ingredients: Ingredient[];
  equipmentNeeded: string[];
  prepInstructions: PrepStep[];
  cookTimeline: TimelineStep[];
  tips: string[];
  servingSuggestions: string[];
}

export interface Ingredient {
  item: string;
  amount: string;
  notes?: string;
}

export interface PrepStep {
  step: number;
  title: string;
  description: string;
  timeMinutes: number;
}

export interface TimelineStep {
  time: string;
  relativeHours: number;
  action: string;
  details: string;
  temperature?: string;
  duration?: string;
  checkpoints?: string[];
}

export interface CookLog {
  id: string;
  user_id: string;
  recipe_id: string | null;
  cooked_at: string;
  rating: number | null;
  notes: string | null;
  what_worked: string | null;
  what_to_improve: string | null;
  photos: string[];
  weather_conditions: WeatherConditions | null;
  actual_time_minutes: number | null;
  created_at: string;
  recipe?: Recipe;
}

export interface WeatherConditions {
  temperature: number;
  conditions: string;
  wind: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

// AI-related types
export interface ClarificationQuestion {
  id: string;
  question: string;
  type: 'choice' | 'text' | 'number';
  options?: string[];
}

export interface ClarificationResponse {
  questions: ClarificationQuestion[];
  ready: boolean;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// UI State types
export interface NewCookState {
  selectedGrill: Grill | null;
  userInput: string;
  clarifications: Array<{
    question: ClarificationQuestion;
    answer: string;
  }>;
  generatedRecipe: RecipeData | null;
  isGenerating: boolean;
  error: string | null;
}

// Usage & Subscription types
export interface UserUsage {
  id: string;
  user_id: string;
  period_start: string;
  recipes_generated: number;
  clarifications_used: number;
  last_request_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'unlimited';
  monthly_recipe_limit: number;
  daily_recipe_limit: number;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  tier: 'free' | 'pro' | 'unlimited';
  resetDate: string;
  isLimited: boolean;
}

export interface RateLimitError {
  error: 'Rate limit exceeded';
  message: string;
  resetDate: string;
  limit: number;
  remaining: number;
}
