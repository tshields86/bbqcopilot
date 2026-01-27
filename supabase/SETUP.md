# Supabase Setup Guide

This guide walks you through setting up Supabase for BBQCopilot.

## 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name:** `bbqcopilot`
   - **Database Password:** Generate and save securely
   - **Region:** Choose closest to your users
4. Click "Create new project" and wait for setup

## 2. Run Database Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `migrations/00001_initial_schema.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute

This creates:
- All tables (profiles, grills, accessories, recipes, etc.)
- Row Level Security policies
- Indexes for performance
- Triggers for automatic profile creation
- Helper functions for usage tracking

## 3. Configure Authentication

### Email Auth (enabled by default)
No additional setup needed.

### Google OAuth (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure consent screen if prompted
6. Select **Web application** as application type
7. Add authorized redirect URI:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
8. Copy **Client ID** and **Client Secret**

9. In Supabase:
   - Go to **Authentication** → **Providers**
   - Find **Google** and enable it
   - Paste your Client ID and Client Secret
   - Save

## 4. Get API Keys

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy these values:

| Key | Environment Variable |
|-----|---------------------|
| Project URL | `EXPO_PUBLIC_SUPABASE_URL` |
| `anon` public key | `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | For Edge Functions only (keep secret!) |

## 5. Deploy Edge Functions

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login and Link

```bash
# Login to Supabase
supabase login

# Link to your project (find project-ref in Settings → General)
supabase link --project-ref <your-project-ref>
```

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy generate-recipe
supabase functions deploy ask-clarification
```

### Set Secrets

```bash
# Set your Anthropic API key
supabase secrets set ANTHROPIC_API_KEY=<your-anthropic-key>
```

## 6. Update App Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## 7. Test the Setup

1. Start the app: `npm start`
2. Try signing up with email
3. Check the Supabase dashboard:
   - **Authentication** → **Users** should show your new user
   - **Table Editor** → **profiles** should have a row for the user

## Troubleshooting

### "Permission denied" errors
- Verify RLS policies were created correctly
- Check that the user is authenticated

### "Function not found" errors
- Make sure Edge Functions are deployed: `supabase functions list`
- Check function logs: `supabase functions logs <function-name>`

### Authentication callback issues
- Verify redirect URLs in Supabase Auth settings
- For mobile, ensure `bbqcopilot://` scheme is in `app.json`

### Rate limiting not working
- Ensure `increment_recipe_usage` function exists
- Check user_usage table has correct permissions

## Local Development with Supabase CLI

For local development:

```bash
# Start local Supabase
supabase start

# Your local credentials will be displayed
# Update .env with local values for development

# Stop when done
supabase stop
```

## Database Schema Changes

When making schema changes:

1. Create a new migration file:
   ```bash
   supabase migration new <migration-name>
   ```

2. Add your SQL to the new file in `migrations/`

3. Apply locally:
   ```bash
   supabase db reset
   ```

4. Deploy to production:
   ```bash
   supabase db push
   ```
