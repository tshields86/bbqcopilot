-- BBQCopilot Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABLES
-- ===========================================

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
  proteins JSONB NOT NULL DEFAULT '[]',
  servings INTEGER,
  total_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  recipe_data JSONB NOT NULL,
  ai_conversation JSONB,
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
  period_start DATE NOT NULL,
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

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

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

-- ===========================================
-- INDEXES
-- ===========================================

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

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

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

-- Function to safely increment usage (used by Edge Functions via service role)
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

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_grills_updated_at
  BEFORE UPDATE ON grills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
