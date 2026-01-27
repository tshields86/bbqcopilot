# BBQCopilot Technical Specification

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   iOS App   │  │ Android App │  │        Web App          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                              │                                   │
│                    Expo + React Native                          │
│                    (Single Codebase)                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Auth       │  │  PostgreSQL  │  │   Edge Functions     │  │
│  │  (Google,    │  │   Database   │  │   (AI API calls)     │  │
│  │   Email)     │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Anthropic Claude API                        │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │  claude-3-haiku      │  │    claude-3-5-haiku              │ │
│  │  (Clarification)     │  │    (Recipe Generation)           │ │
│  └──────────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Frontend Technical Details

### 2.1 Expo Configuration

```json
// app.json
{
  "expo": {
    "name": "BBQCopilot",
    "slug": "bbqcopilot",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1A1A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.bbqcopilot.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1A1A1A"
      },
      "package": "com.bbqcopilot.app"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/PlayfairDisplay-Regular.ttf"]
        }
      ]
    ],
    "scheme": "bbqcopilot"
  }
}
```

### 2.2 NativeWind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ember: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#C41E3A', // Primary
          600: '#b91c36',
          700: '#9f1a30',
          800: '#861729',
          900: '#6d1422',
        },
        char: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#4A4A4A', // Smoke Gray
          600: '#3d3d3d',
          700: '#2d2d2d',
          800: '#1A1A1A', // Char Black
          900: '#0f0f0f',
        },
        ash: '#F5F5F0',
        copper: '#B87333',
        mesquite: '#5D3A1A',
        success: '#2D5A27',
        warning: '#D4A574',
        error: '#8B2635',
      },
      fontFamily: {
        display: ['PlayfairDisplay', 'serif'],
        body: ['SourceSansPro', 'sans-serif'],
        mono: ['JetBrainsMono', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
```

### 2.3 Expo Router Structure

```
/app
├── _layout.tsx              # Root layout (providers, fonts)
├── index.tsx                # Entry redirect
├── (auth)/
│   ├── _layout.tsx          # Auth layout (no tabs)
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (tabs)/
│   ├── _layout.tsx          # Tab layout
│   ├── index.tsx            # Home dashboard
│   ├── cook/
│   │   ├── index.tsx        # New cook entry
│   │   ├── clarify.tsx      # AI clarification chat
│   │   └── result.tsx       # Recipe result
│   ├── equipment/
│   │   ├── index.tsx        # Equipment list
│   │   ├── [grillId].tsx    # Grill detail
│   │   └── add.tsx          # Add grill
│   ├── recipes/
│   │   ├── index.tsx        # Recipe library
│   │   └── [recipeId].tsx   # Recipe detail
│   └── history/
│       ├── index.tsx        # Cook history
│       └── [logId].tsx      # Log detail
└── onboarding/
    ├── _layout.tsx
    ├── welcome.tsx
    ├── add-grill.tsx
    └── add-accessories.tsx
```

## 3. Backend Technical Details

### 3.1 Supabase Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Grills table
CREATE TABLE grills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  grill_type TEXT NOT NULL CHECK (grill_type IN ('kamado', 'gas', 'charcoal', 'pellet', 'offset', 'kettle', 'electric', 'other')),
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Accessories table
CREATE TABLE accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grill_id UUID REFERENCES grills(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  accessory_type TEXT NOT NULL CHECK (accessory_type IN (
    'rotisserie', 'griddle', 'pizza_stone', 'soapstone', 
    'smoking_stone', 'grill_expander', 'heat_deflector',
    'cold_smoker', 'thermometer', 'cover', 'other'
  )),
  brand TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grill_id UUID REFERENCES grills(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  proteins JSONB NOT NULL DEFAULT '[]',  -- Array of protein objects
  servings INTEGER,
  total_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  recipe_data JSONB NOT NULL,  -- Full AI-generated recipe structure
  ai_conversation JSONB,       -- Conversation history for reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, recipe_id)
);

-- Cook logs table
CREATE TABLE cook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  cooked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  what_worked TEXT,
  what_to_improve TEXT,
  photos TEXT[] DEFAULT '{}',
  weather_conditions JSONB,
  actual_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User usage tracking (for rate limiting)
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,  -- First day of month
  recipes_generated INTEGER DEFAULT 0,
  clarifications_used INTEGER DEFAULT 0,
  last_request_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, period_start)
);

-- Subscription tiers (for future paid plans)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'unlimited')),
  monthly_recipe_limit INTEGER NOT NULL DEFAULT 15,
  daily_recipe_limit INTEGER NOT NULL DEFAULT 3,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grills ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grills: users can only access their own grills
CREATE POLICY "Users can view own grills" ON grills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own grills" ON grills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own grills" ON grills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own grills" ON grills FOR DELETE USING (auth.uid() = user_id);

-- Accessories: users can access accessories for their grills
CREATE POLICY "Users can view accessories for own grills" ON accessories FOR SELECT 
  USING (EXISTS (SELECT 1 FROM grills WHERE grills.id = accessories.grill_id AND grills.user_id = auth.uid()));
CREATE POLICY "Users can insert accessories for own grills" ON accessories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM grills WHERE grills.id = accessories.grill_id AND grills.user_id = auth.uid()));
CREATE POLICY "Users can update accessories for own grills" ON accessories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM grills WHERE grills.id = accessories.grill_id AND grills.user_id = auth.uid()));
CREATE POLICY "Users can delete accessories for own grills" ON accessories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM grills WHERE grills.id = accessories.grill_id AND grills.user_id = auth.uid()));

-- Recipes: users can only access their own recipes
CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Favorites: users can only access their own favorites
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Cook logs: users can only access their own logs
CREATE POLICY "Users can view own cook logs" ON cook_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cook logs" ON cook_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cook logs" ON cook_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cook logs" ON cook_logs FOR DELETE USING (auth.uid() = user_id);

-- User usage: users can view own, but only edge functions can update (via service role)
CREATE POLICY "Users can view own usage" ON user_usage FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_grills_user_id ON grills(user_id);
CREATE INDEX idx_accessories_grill_id ON accessories(grill_id);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_grill_id ON recipes(grill_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id);
CREATE INDEX idx_cook_logs_user_id ON cook_logs(user_id);
CREATE INDEX idx_cook_logs_recipe_id ON cook_logs(recipe_id);
CREATE INDEX idx_user_usage_lookup ON user_usage(user_id, period_start);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3.2 Supabase Edge Functions

#### `/supabase/functions/generate-recipe/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Anthropic from "npm:@anthropic-ai/sdk@0.24.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecipeRequest {
  equipment: {
    grill: {
      name: string
      brand: string
      model: string
      type: string
    }
    accessories: Array<{
      name: string
      type: string
    }>
  }
  request: string
  clarifications: Array<{
    question: string
    answer: string
  }>
  preferences?: {
    skillLevel?: string
    timeAvailable?: string
    servings?: number
    flavorProfile?: string
  }
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetDate: string
}

// Check and update rate limits
async function checkRateLimit(userId: string, supabase: any): Promise<RateLimitResult> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodStartStr = periodStart.toISOString().split('T')[0]
  
  // Get user's subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, monthly_recipe_limit, daily_recipe_limit')
    .eq('user_id', userId)
    .single()
  
  // Default to free tier if no subscription found
  const monthlyLimit = subscription?.monthly_recipe_limit || 15
  const dailyLimit = subscription?.daily_recipe_limit || 3
  
  // Get or create usage record for this month
  const { data: usage, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStartStr)
    .single()
  
  const currentUsage = usage?.recipes_generated || 0
  
  // Check daily limit (count recipes from today)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  
  // Calculate next reset date (first of next month)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  if (currentUsage >= monthlyLimit) {
    return {
      allowed: false,
      remaining: 0,
      limit: monthlyLimit,
      resetDate: nextMonth.toISOString()
    }
  }
  
  return {
    allowed: true,
    remaining: monthlyLimit - currentUsage,
    limit: monthlyLimit,
    resetDate: nextMonth.toISOString()
  }
}

// Increment usage counter
async function incrementUsage(userId: string, supabase: any): Promise<void> {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodStartStr = periodStart.toISOString().split('T')[0]
  
  // Upsert usage record
  await supabase.rpc('increment_recipe_usage', {
    p_user_id: userId,
    p_period_start: periodStartStr
  })
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role for usage tracking
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Check rate limit
    const rateLimit = await checkRateLimit(user.id, supabase)
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: `You've used all ${rateLimit.limit} recipes this month. Limit resets on ${new Date(rateLimit.resetDate).toLocaleDateString()}.`,
          resetDate: rateLimit.resetDate,
          limit: rateLimit.limit,
          remaining: 0
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetDate
          } 
        }
      )
    }
    
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!
    })

    const { equipment, request, clarifications, preferences }: RecipeRequest = await req.json()

    // Build the prompt
    const systemPrompt = `You are BBQCopilot, an expert BBQ pitmaster and recipe generator. You create detailed, equipment-specific recipes tailored to the user's exact grill and accessories.

Your responses should be structured as JSON with the following format:
{
  "title": "Recipe title",
  "description": "Brief appetizing description",
  "proteins": [{"name": "brisket", "weight": "12 lbs", "quantity": 1}],
  "servings": 8,
  "totalTimeMinutes": 720,
  "difficulty": "medium",
  "ingredients": [
    {"item": "ingredient name", "amount": "quantity", "notes": "optional notes"}
  ],
  "equipmentNeeded": ["list of equipment from user's inventory to use"],
  "prepInstructions": [
    {"step": 1, "title": "Step title", "description": "Detailed instructions", "timeMinutes": 30}
  ],
  "cookTimeline": [
    {
      "time": "5:00 AM",
      "relativeHours": -12,
      "action": "Action title",
      "details": "Detailed instructions for this step",
      "temperature": "225°F",
      "duration": "6 hours",
      "checkpoints": ["What to look for"]
    }
  ],
  "tips": ["Pro tips specific to their equipment"],
  "servingSuggestions": ["Side dish ideas", "Beverage pairings"]
}

Key guidelines:
1. Always tailor instructions to their specific grill type (kamado vs gas vs offset, etc.)
2. Include specific temperature management advice for their grill
3. Account for their available accessories
4. Provide realistic time estimates
5. Include rest times and carryover cooking
6. For long cooks, include a timeline starting from target eating time and working backwards`

    const userMessage = `
Equipment Profile:
- Grill: ${equipment.grill.brand} ${equipment.grill.model} (${equipment.grill.type} style)
- Accessories: ${equipment.accessories.map(a => a.name).join(', ') || 'None specified'}

Cook Request: ${request}

${clarifications.length > 0 ? `
Additional Details:
${clarifications.map(c => `Q: ${c.question}\nA: ${c.answer}`).join('\n\n')}
` : ''}

${preferences ? `
Preferences:
- Skill Level: ${preferences.skillLevel || 'Not specified'}
- Time Available: ${preferences.timeAvailable || 'Flexible'}
- Servings: ${preferences.servings || 'Not specified'}
- Flavor Profile: ${preferences.flavorProfile || 'Classic BBQ'}
` : ''}

Please generate a detailed, equipment-specific recipe with a complete cook timeline.`

    // Increment usage BEFORE making the API call (to prevent race conditions)
    await incrementUsage(user.id, supabase)

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4096,
          stream: true,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
        'X-RateLimit-Reset': rateLimit.resetDate
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

#### `/supabase/functions/_shared/increment_usage.sql`

```sql
-- Create a function to safely increment usage (call this during Supabase setup)
CREATE OR REPLACE FUNCTION increment_recipe_usage(p_user_id UUID, p_period_start DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO user_usage (user_id, period_start, recipes_generated, last_request_at)
  VALUES (p_user_id, p_period_start, 1, NOW())
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET 
    recipes_generated = user_usage.recipes_generated + 1,
    last_request_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `/supabase/functions/ask-clarification/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Anthropic from "npm:@anthropic-ai/sdk@0.24.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!
    })

    const { userInput, equipment, existingAnswers } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: `You are BBQCopilot's BBQ assistant. Based on the user's cook request, generate 1-3 clarifying questions to help create the perfect recipe. 

Return JSON format:
{
  "questions": [
    {
      "id": "skill_level",
      "question": "What's your BBQ experience level?",
      "type": "choice",
      "options": ["Beginner", "Intermediate", "Advanced"]
    },
    {
      "id": "time",
      "question": "How much time do you have?",
      "type": "choice",
      "options": ["2-3 hours", "4-6 hours", "Full day (8+ hours)"]
    }
  ],
  "ready": false
}

Set "ready": true when you have enough information and don't need more questions.
Common questions to consider:
- Skill level (if not obvious)
- Time available
- Number of servings
- Flavor preferences (sweet, spicy, traditional, etc.)
- Any dietary restrictions

Don't ask redundant questions if the answer is obvious from context.`,
      messages: [{
        role: 'user',
        content: `User's request: "${userInput}"
Equipment: ${equipment.grill.brand} ${equipment.grill.model}
${existingAnswers?.length > 0 ? `Already answered: ${JSON.stringify(existingAnswers)}` : ''}`
      }]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return new Response(content.text, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Unexpected response format')
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

## 4. TypeScript Types

```typescript
// /lib/types.ts

// Database types
export interface Profile {
  id: string
  user_id: string
  display_name: string | null
  skill_level: 'beginner' | 'intermediate' | 'advanced' | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Grill {
  id: string
  user_id: string
  name: string
  brand: string | null
  model: string | null
  grill_type: GrillType
  notes: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
  accessories?: Accessory[]
}

export type GrillType = 
  | 'kamado' 
  | 'gas' 
  | 'charcoal' 
  | 'pellet' 
  | 'offset' 
  | 'kettle' 
  | 'electric' 
  | 'other'

export interface Accessory {
  id: string
  grill_id: string
  name: string
  accessory_type: AccessoryType
  brand: string | null
  notes: string | null
  created_at: string
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
  | 'other'

export interface Recipe {
  id: string
  user_id: string
  grill_id: string | null
  title: string
  description: string | null
  proteins: ProteinItem[]
  servings: number | null
  total_time_minutes: number | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  recipe_data: RecipeData
  ai_conversation: ConversationMessage[] | null
  created_at: string
  updated_at: string
  grill?: Grill
  is_favorite?: boolean
}

export interface ProteinItem {
  name: string
  weight: string
  quantity: number
}

export interface RecipeData {
  title: string
  description: string
  proteins: ProteinItem[]
  servings: number
  totalTimeMinutes: number
  difficulty: string
  ingredients: Ingredient[]
  equipmentNeeded: string[]
  prepInstructions: PrepStep[]
  cookTimeline: TimelineStep[]
  tips: string[]
  servingSuggestions: string[]
}

export interface Ingredient {
  item: string
  amount: string
  notes?: string
}

export interface PrepStep {
  step: number
  title: string
  description: string
  timeMinutes: number
}

export interface TimelineStep {
  time: string
  relativeHours: number
  action: string
  details: string
  temperature?: string
  duration?: string
  checkpoints?: string[]
}

export interface CookLog {
  id: string
  user_id: string
  recipe_id: string | null
  cooked_at: string
  rating: number | null
  notes: string | null
  what_worked: string | null
  what_to_improve: string | null
  photos: string[]
  weather_conditions: WeatherConditions | null
  actual_time_minutes: number | null
  created_at: string
  recipe?: Recipe
}

export interface WeatherConditions {
  temperature: number
  conditions: string
  wind: string
}

export interface Favorite {
  id: string
  user_id: string
  recipe_id: string
  created_at: string
}

// AI-related types
export interface ClarificationQuestion {
  id: string
  question: string
  type: 'choice' | 'text' | 'number'
  options?: string[]
}

export interface ClarificationResponse {
  questions: ClarificationQuestion[]
  ready: boolean
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

// UI State types
export interface NewCookState {
  selectedGrill: Grill | null
  userInput: string
  clarifications: Array<{
    question: ClarificationQuestion
    answer: string
  }>
  generatedRecipe: RecipeData | null
  isGenerating: boolean
  error: string | null
}

// Usage & Subscription types
export interface UserUsage {
  id: string
  user_id: string
  period_start: string
  recipes_generated: number
  clarifications_used: number
  last_request_at: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier: 'free' | 'pro' | 'unlimited'
  monthly_recipe_limit: number
  daily_recipe_limit: number
  started_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface UsageStatus {
  used: number
  limit: number
  remaining: number
  tier: 'free' | 'pro' | 'unlimited'
  resetDate: string
  isLimited: boolean
}

export interface RateLimitError {
  error: 'Rate limit exceeded'
  message: string
  resetDate: string
  limit: number
  remaining: number
}
```

## 5. Key Implementation Patterns

### 5.1 Supabase Client Setup

```typescript
// /lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage for React Native
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key)
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
      return
    }
    await SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
      return
    }
    await SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### 5.2 Auth Context

```typescript
// /contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    loading,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    },
    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'bbqcopilot://auth/callback',
        },
      })
      if (error) throw error
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### 5.3 Equipment Hook

```typescript
// /hooks/useEquipment.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Grill, Accessory } from '@/lib/types'

export function useGrills() {
  return useQuery({
    queryKey: ['grills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grills')
        .select('*, accessories(*)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Grill[]
    },
  })
}

export function useAddGrill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (grill: Omit<Grill, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('grills')
        .insert(grill)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grills'] })
    },
  })
}

export function useAddAccessory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accessory: Omit<Accessory, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('accessories')
        .insert(accessory)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grills'] })
    },
  })
}
```

### 5.4 Usage Hook

```typescript
// /hooks/useUsage.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { UsageStatus, UserUsage, Subscription } from '@/lib/types'

export function useUsage() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['usage', user?.id],
    queryFn: async (): Promise<UsageStatus> => {
      if (!user) throw new Error('Not authenticated')
      
      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const periodStartStr = periodStart.toISOString().split('T')[0]
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      
      // Get subscription (or default to free tier)
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      const tier = subscription?.tier || 'free'
      const limit = subscription?.monthly_recipe_limit || 15
      
      // Get current month's usage
      const { data: usage } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_start', periodStartStr)
        .single()
      
      const used = usage?.recipes_generated || 0
      
      return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        tier,
        resetDate: nextMonth.toISOString(),
        isLimited: tier === 'free'
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  })
}
```

### 5.5 Usage Banner Component

```typescript
// /components/ui/UsageBanner.tsx
import { View, Text, Pressable } from 'react-native'
import { useUsage } from '@/hooks/useUsage'
import { Flame } from 'lucide-react-native'

export function UsageBanner() {
  const { data: usage, isLoading } = useUsage()
  
  if (isLoading || !usage) return null
  
  // Don't show if unlimited or plenty remaining
  if (!usage.isLimited || usage.remaining > 5) return null
  
  const isWarning = usage.remaining <= 5 && usage.remaining > 0
  const isExhausted = usage.remaining === 0
  
  return (
    <View className={`px-4 py-3 ${isExhausted ? 'bg-error/10' : 'bg-warning/10'}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Flame 
            size={18} 
            color={isExhausted ? '#8B2635' : '#D4A574'} 
          />
          <Text className={`font-body ${isExhausted ? 'text-error' : 'text-warning'}`}>
            {isExhausted 
              ? 'Recipe limit reached' 
              : `${usage.remaining} recipes left this month`
            }
          </Text>
        </View>
        <Pressable className="bg-ember-500 px-3 py-1 rounded-button">
          <Text className="text-white font-body text-sm">Upgrade</Text>
        </Pressable>
      </View>
    </View>
  )
}
```

### 5.6 Rate Limit Error Handler

```typescript
// /lib/api.ts
import { RateLimitError } from '@/lib/types'

export function isRateLimitError(error: unknown): error is RateLimitError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    (error as any).error === 'Rate limit exceeded'
  )
}

export function formatResetDate(resetDate: string): string {
  const date = new Date(resetDate)
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  })
}
```

## 6. Security Considerations

1. **API Keys**: Never expose `ANTHROPIC_API_KEY` to client. All AI calls go through Supabase Edge Functions.
2. **Row Level Security**: All tables have RLS enabled. Users can only access their own data.
3. **Input Validation**: Validate all user inputs before sending to AI to prevent prompt injection.
4. **Rate Limiting**: Implement rate limiting on Edge Functions to prevent abuse.
5. **Secure Storage**: Use Expo SecureStore for tokens on mobile devices.

## 7. Performance Considerations

1. **Lazy Loading**: Load recipe data on-demand, not all at once.
2. **Image Optimization**: Use appropriate image sizes and formats.
3. **Query Caching**: React Query caches responses; configure stale times appropriately.
4. **Streaming**: Stream AI responses to improve perceived performance.
5. **Bundle Splitting**: Use dynamic imports for heavy screens.
