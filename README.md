# BBQCopilot

AI-powered BBQ recipe app that generates equipment-specific recipes, prep guides, and cook timelines based on your actual grills and accessories.

## Overview

BBQCopilot solves the frustration of searching for generic BBQ recipes that don't account for the significant differences between grill types. Whether you're using a Kamado Joe, Weber Genesis, or an offset smoker, BBQCopilot creates personalized recipes tailored to your exact equipment.

## Features

- **Equipment Profiles** - Register your grills and accessories for personalized recipes
- **AI Recipe Generation** - Get recipes specifically designed for your equipment
- **Cook Timelines** - Step-by-step guides with timing for each phase
- **Cook History** - Track your cooks with notes, ratings, and photos
- **Favorites** - Save recipes you love for quick access
- **Cross-Platform** - Works on iOS, Android, and Web from a single codebase

## Tech Stack

- **Framework:** [Expo](https://expo.dev/) + React Native with [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row Level Security)
- **AI:** [Anthropic Claude API](https://www.anthropic.com/)
- **State Management:** React Context + [TanStack Query](https://tanstack.com/query)
- **Animations:** [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Supabase account
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tshields86/bbqcopilot.git
   cd bbqcopilot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with your Supabase and Anthropic credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

5. Start the development server:
   ```bash
   npm start
   ```

### Running on Devices

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## Project Structure

```
/app                    # Expo Router pages
  /(auth)               # Auth screens (login, register)
  /(tabs)               # Main tab navigation
    /index.tsx          # Home/Dashboard
    /cook.tsx           # New cook flow
    /equipment.tsx      # Equipment management
    /history.tsx        # Cook history
  /_layout.tsx          # Root layout
/components             # Reusable UI components
  /ui                   # Base components (Button, Input, Card, etc.)
  /equipment            # Equipment-related components
  /recipe               # Recipe display components
  /cook                 # Cook planning components
/hooks                  # Custom React hooks
/lib                    # Utilities, API clients, constants
/contexts               # React Context providers
/assets                 # Images, fonts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## Design System

BBQCopilot features a warm, premium design inspired by the craft of BBQ:

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Ember Red | `#C41E3A` | Primary actions, accents |
| Char Black | `#1A1A1A` | Backgrounds |
| Smoke Gray | `#4A4A4A` | Secondary text |
| Ash White | `#F5F5F0` | Cards, light text |
| Copper Glow | `#B87333` | Highlights, success |

### Typography

- **Display:** Playfair Display (headers)
- **Body:** Source Sans 3 (content)
- **Monospace:** JetBrains Mono (timers, temperatures)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key (server-side only) | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `style:` - Formatting changes
- `docs:` - Documentation updates
- `test:` - Test additions/updates
