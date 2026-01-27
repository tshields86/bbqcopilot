# BBQCopilot Development Tasks

## Phase 1: Foundation & Core Infrastructure

### 1.1 Project Setup & Configuration
- [ ] Initialize Expo project with TypeScript template
- [ ] Configure Expo Router for file-based routing
- [ ] Install and configure NativeWind (Tailwind for React Native)
- [ ] Set up project directory structure per CLAUDE.md
- [ ] Configure ESLint and Prettier
- [ ] Create base tsconfig.json with strict mode
- [ ] Set up path aliases (@components, @lib, @hooks, etc.)
- [ ] Create .env.example with required environment variables
- [ ] Initialize git repository with .gitignore
- [ ] **Commit:** "feat: initialize expo project with typescript and nativewind"

### 1.2 Design System Implementation
- [ ] Create tailwind.config.js with brand colors and typography
- [ ] Install custom fonts (Playfair Display, Source Sans Pro, JetBrains Mono)
- [ ] Create base UI components:
  - [ ] Button (variants: primary, secondary, ghost, destructive)
  - [ ] Input (text, password, with validation states)
  - [ ] Card (with shadow, border variants)
  - [ ] Badge (status indicators)
  - [ ] Typography components (H1-H4, Body, Caption)
- [ ] Create loading spinner and skeleton components
- [ ] Implement dark mode support (default theme)
- [ ] Create icon component with Lucide icons
- [ ] **Commit:** "feat: implement core design system components"

### 1.3 Supabase Integration
- [ ] Create Supabase project
- [ ] Set up database tables per schema in CLAUDE.md
- [ ] Configure Row Level Security (RLS) policies
- [ ] Enable Google OAuth in Supabase Auth
- [ ] Create supabase client configuration (/lib/supabase.ts)
- [ ] Create TypeScript types from database schema
- [ ] Set up Supabase Edge Functions project structure
- [ ] **Commit:** "feat: configure supabase with auth and database schema"

### 1.4 Authentication Flow
- [ ] Create auth context provider
- [ ] Build login screen with email/password
- [ ] Build login with Google button
- [ ] Build registration screen
- [ ] Implement password reset flow
- [ ] Create protected route wrapper
- [ ] Handle auth state persistence
- [ ] Add loading states during auth
- [ ] **Commit:** "feat: implement complete authentication flow"

---

## Phase 2: Equipment Management

### 2.1 Equipment Data Layer
- [ ] Create equipment types (Grill, Accessory)
- [ ] Create useEquipment hook for CRUD operations
- [ ] Create useGrills hook
- [ ] Create useAccessories hook
- [ ] Implement React Query for server state
- [ ] Add optimistic updates for better UX
- [ ] **Commit:** "feat: implement equipment data layer with react query"

### 2.2 Equipment UI - Grill Management
- [ ] Create grill type selector (kamado, gas, charcoal, pellet, offset)
- [ ] Create brand/model input with common suggestions
- [ ] Build "Add Grill" modal/screen
- [ ] Build grill list view with cards
- [ ] Build grill detail/edit screen
- [ ] Add grill deletion with confirmation
- [ ] Add grill images/icons by type
- [ ] **Commit:** "feat: implement grill management UI"

### 2.3 Equipment UI - Accessory Management
- [ ] Create accessory type selector
- [ ] Build "Add Accessory" modal (linked to grill)
- [ ] Display accessories on grill detail view
- [ ] Create accessory edit/delete functionality
- [ ] Add accessory icons by type
- [ ] **Commit:** "feat: implement accessory management UI"

### 2.4 Onboarding Flow
- [ ] Create onboarding context/state
- [ ] Build welcome screen
- [ ] Build "Add Your First Grill" guided screen
- [ ] Build "Add Accessories" optional step
- [ ] Create skip option with confirmation
- [ ] Navigate to home on completion
- [ ] Store onboarding completion flag
- [ ] **Commit:** "feat: implement new user onboarding flow"

---

## Phase 3: AI Recipe Generation

### 3.1 Anthropic API Integration
- [ ] Create Supabase Edge Function for AI calls
- [ ] Implement Claude API client with streaming
- [ ] Create prompt templates for:
  - [ ] Clarifying questions (Haiku)
  - [ ] Recipe generation (Sonnet)
- [ ] Handle API errors gracefully
- [ ] Implement rate limiting logic
- [ ] Create /lib/anthropic.ts client wrapper
- [ ] **Commit:** "feat: implement anthropic api integration with streaming"

### 3.2 Recipe Generation Flow - Input
- [ ] Create "New Cook" screen
- [ ] Build grill selector (if user has multiple)
- [ ] Create natural language input for cook request
- [ ] Show recent/suggested proteins
- [ ] Add "What do you want to cook?" prompt
- [ ] **Commit:** "feat: create new cook input flow"

### 3.3 Recipe Generation Flow - Clarification
- [ ] Build AI chat interface for clarifying questions
- [ ] Display AI questions one at a time or grouped
- [ ] Create quick-select buttons for common answers:
  - [ ] Skill level (beginner, intermediate, advanced)
  - [ ] Time available (quick, half day, full day)
  - [ ] Serving size
  - [ ] Flavor profile preferences
- [ ] Allow free-text responses
- [ ] Show typing indicator during AI response
- [ ] **Commit:** "feat: implement clarification conversation UI"

### 3.4 Recipe Generation Flow - Results
- [ ] Build recipe display component:
  - [ ] Title and overview
  - [ ] Ingredients list
  - [ ] Equipment needed
  - [ ] Full prep instructions
  - [ ] Cook timeline (key feature!)
- [ ] Implement streaming text display
- [ ] Add "Save Recipe" button
- [ ] Add "Start Cook" button
- [ ] Create share functionality (future-ready)
- [ ] **Commit:** "feat: implement recipe display with timeline"

### 3.5 Multi-Protein Support
- [ ] Allow adding multiple proteins to single cook
- [ ] Adjust prompts to handle multi-protein requests
- [ ] Display combined timeline with protein labels
- [ ] Handle staggered start times
- [ ] **Commit:** "feat: add multi-protein cook planning support"

### 3.6 Usage Tracking & Rate Limiting
- [ ] Create user_usage and subscriptions tables in Supabase
- [ ] Create increment_recipe_usage SQL function
- [ ] Implement useUsage hook to fetch current usage
- [ ] Create UsageBanner component showing remaining recipes
- [ ] Build UsageLimitModal for when limit is reached
- [ ] Display usage in account/settings screen
- [ ] Add rate limit headers handling in API client
- [ ] Show friendly error when rate limited (with reset date)
- [ ] Create upgrade prompt UI (for future paid tier)
- [ ] **Commit:** "feat: implement usage tracking and rate limiting UI"

---

## Phase 4: Recipe Management & History

### 4.1 Recipe Storage
- [ ] Create recipes table integration
- [ ] Implement save recipe functionality
- [ ] Create recipe types for stored data
- [ ] Build useRecipes hook
- [ ] **Commit:** "feat: implement recipe storage layer"

### 4.2 Favorites System
- [ ] Create favorites table integration
- [ ] Add favorite/unfavorite toggle on recipes
- [ ] Build favorites list view
- [ ] Add favorite indicator on recipe cards
- [ ] **Commit:** "feat: implement favorites system"

### 4.3 Cook History
- [ ] Create cook_logs table integration
- [ ] Build "Log This Cook" flow after completion
- [ ] Add notes input
- [ ] Add rating (1-5 flames/stars)
- [ ] Build cook history list view
- [ ] Show history on recipe detail
- [ ] **Commit:** "feat: implement cook history logging"

### 4.4 Recipe Search & Filter
- [ ] Build search input on recipes screen
- [ ] Filter by protein type
- [ ] Filter by grill
- [ ] Sort by date, rating
- [ ] **Commit:** "feat: add recipe search and filtering"

---

## Phase 5: Polish & Production Readiness

### 5.1 Home Dashboard
- [ ] Build home screen layout
- [ ] Show quick actions (New Cook, Favorites)
- [ ] Display recent cooks
- [ ] Show equipment summary
- [ ] Add motivational BBQ tips/quotes
- [ ] **Commit:** "feat: build home dashboard"

### 5.2 Navigation & Layout
- [ ] Implement bottom tab navigation
- [ ] Create consistent header component
- [ ] Add pull-to-refresh on lists
- [ ] Implement proper back navigation
- [ ] Add haptic feedback on key interactions
- [ ] **Commit:** "feat: polish navigation and layout"

### 5.3 Animations & Micro-interactions
- [ ] Add page transition animations
- [ ] Implement list item stagger animations
- [ ] Add button press feedback
- [ ] Create loading state animations
- [ ] Add success/completion animations
- [ ] **Commit:** "feat: add animations and micro-interactions"

### 5.4 Error Handling & Edge Cases
- [ ] Create global error boundary
- [ ] Build error display components
- [ ] Handle network failures gracefully
- [ ] Add retry mechanisms
- [ ] Implement offline detection
- [ ] Show appropriate empty states
- [ ] **Commit:** "feat: implement comprehensive error handling"

### 5.5 Testing
- [ ] Write unit tests for utility functions
- [ ] Write component tests for UI components
- [ ] Test authentication flows
- [ ] Test recipe generation flow
- [ ] Test equipment CRUD operations
- [ ] **Commit:** "test: add unit and component tests"

### 5.6 Performance Optimization
- [ ] Implement image lazy loading
- [ ] Add list virtualization for long lists
- [ ] Optimize re-renders with React.memo
- [ ] Profile and fix any jank
- [ ] Reduce bundle size
- [ ] **Commit:** "perf: optimize performance"

### 5.7 Deployment Preparation
- [ ] Set up app icons and splash screens
- [ ] Configure app.json for production
- [ ] Set up EAS Build for iOS/Android
- [ ] Configure web deployment (Vercel/Netlify)
- [ ] Write deployment documentation
- [ ] **Commit:** "chore: prepare for production deployment"

---

## Phase 6: Future Features (Post-MVP)

### 6.1 Shopping Lists
- [ ] Generate shopping list from recipe
- [ ] Allow editing quantities
- [ ] Check off items while shopping
- [ ] Share shopping list

### 6.2 Weather Integration
- [ ] Integrate Open-Meteo API (free)
- [ ] Show current conditions on cook screen
- [ ] Adjust recommendations based on weather
- [ ] Wind/rain warnings

### 6.3 Recipe Caching
- [ ] Implement recipe cache by equipment+protein combo
- [ ] Cache invalidation strategy
- [ ] Display cache hit to user (faster results)

### 6.4 Community Features
- [ ] Share recipes publicly
- [ ] Browse community recipes
- [ ] Rate and review community recipes
- [ ] Follow other pitmasters

---

## Progress Tracking

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Foundation | Not Started | 0% |
| Phase 2: Equipment | Not Started | 0% |
| Phase 3: AI Recipes | Not Started | 0% |
| Phase 4: History | Not Started | 0% |
| Phase 5: Polish | Not Started | 0% |
| Phase 6: Future | Backlog | - |
