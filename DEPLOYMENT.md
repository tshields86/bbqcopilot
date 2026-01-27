# BBQCopilot Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Web App (Expo Web Export)                   │    │
│  │         https://bbqcopilot.vercel.app (initial)         │    │
│  │         https://bbqcopilot.com (after launch)           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Auth       │  │  PostgreSQL  │  │   Edge Functions     │  │
│  │              │  │   Database   │  │   (Claude API)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Anthropic Claude API                          │
│                   (with spend limits set)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ installed
- Vercel account (https://vercel.com)
- Supabase account (https://supabase.com)
- Anthropic API key (https://console.anthropic.com)
- Apple Developer account ($99/year) - for iOS (can add later)
- Google Play Developer account ($25 one-time) - for Android (can add later)
- Custom domain (optional - can use bbqcopilot.vercel.app initially)

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `bbqcopilot`
4. Database Password: Generate and save securely
5. Region: Choose closest to your users
6. Click "Create new project"

### 1.2 Run Database Migrations

Go to SQL Editor and run the schema from `TECHNICAL_SPEC.md` (all CREATE TABLE statements).

### 1.3 Configure Authentication

1. Go to Authentication → Providers
2. Enable **Email** (enabled by default)
3. Enable **Google**:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

### 1.4 Get API Keys

1. Go to Settings → API
2. Copy:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - `anon` public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → For Edge Functions only (keep secret!)

### 1.5 Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Deploy functions
supabase functions deploy generate-recipe
supabase functions deploy ask-clarification

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=<your-anthropic-key>
```

---

## Step 2: Anthropic API Setup

### 2.1 Get API Key

1. Go to https://console.anthropic.com
2. Create API key
3. Copy and save securely

### 2.2 Model Configuration

BBQCopilot uses a cost-optimized dual-model strategy:

| Task | Model | Model ID | Cost |
|------|-------|----------|------|
| Clarifying questions | Haiku 3 | `claude-3-haiku-20240307` | $0.25/$1.25 per MTok |
| Recipe generation | Haiku 3.5 | `claude-3-5-haiku-20241022` | $0.80/$4.00 per MTok |

**Estimated cost per recipe: ~$0.01**

If recipe quality needs improvement, you can upgrade:
- **Haiku 4.5** (`claude-haiku-4-5-20251001`): $1.00/$5.00 - 25% more expensive
- **Sonnet 4.5** (`claude-sonnet-4-5-20250929`): $3.00/$15.00 - Highest quality, 4x cost

### 2.3 Set Spend Limits (IMPORTANT!)

1. Go to Console → Settings → Limits
2. Set monthly spend limit: `$25` (adjust as needed)
3. Set up usage alerts at 50%, 75%, 90%
4. This prevents runaway costs

---

## Step 3: Vercel Deployment

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Configure Project for Vercel

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npx expo export -p web",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 3.3 Set Environment Variables

In Vercel dashboard (or via CLI):

```bash
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
```

### 3.4 Deploy

```bash
# First deployment (will prompt for configuration)
vercel

# Production deployment
vercel --prod
```

### 3.5 Configure Custom Domain (Optional - Do Later)

Your app will be immediately available at `https://bbqcopilot.vercel.app`

When ready to add a custom domain:
1. Purchase `bbqcopilot.com` from a registrar (Namecheap, Porkbun, etc.)
2. Go to Vercel Dashboard → Project → Settings → Domains
3. Add `bbqcopilot.com`
4. Update DNS records at your registrar:
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

---

## Step 4: Mobile App Deployment

### 4.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 4.2 Configure EAS

```bash
eas build:configure
```

This creates `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 4.3 Build for iOS

```bash
# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### 4.4 Build for Android

```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

---

## Step 5: Post-Deployment Checklist

### Security
- [ ] Supabase RLS policies enabled on all tables
- [ ] Anthropic spend limit configured
- [ ] API keys not exposed in client code
- [ ] HTTPS enforced (Vercel does this automatically)

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Supabase Dashboard bookmarked for DB monitoring
- [ ] Anthropic usage alerts configured

### Testing
- [ ] Test sign up flow (email + Google)
- [ ] Test recipe generation
- [ ] Test rate limiting (hit the limit, see error)
- [ ] Test on mobile web
- [ ] Test iOS app (TestFlight)
- [ ] Test Android app (Internal testing track)

---

## Environment Variables Reference

### Client-Side (Expo)
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Edge Functions
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## Cost Monitoring

### Weekly Check
1. Anthropic Console → Usage (check spend rate)
2. Supabase Dashboard → Reports (check DB size, function invocations)
3. Vercel Dashboard → Usage (check bandwidth)

### Monthly Review
1. Export Anthropic usage report
2. Review user_usage table for patterns
3. Adjust rate limits if needed

---

## Troubleshooting

### "CORS error" on API calls
- Check Supabase Edge Function CORS headers
- Verify Supabase URL is correct in env vars

### "Auth callback failed"
- Check redirect URLs in Supabase Auth settings
- Verify Google OAuth credentials

### "Rate limit exceeded" (Anthropic)
- Check your Anthropic dashboard for current usage
- Increase limit or wait for reset

### Build fails on EAS
- Check `app.json` for valid bundle identifiers
- Ensure all required assets exist
- Run `npx expo doctor` to diagnose

---

## Scaling Considerations

When you outgrow free tiers:

| Trigger | Action |
|---------|--------|
| >500MB database | Upgrade Supabase to Pro ($25/mo) |
| >100GB bandwidth | Upgrade Vercel to Pro ($20/mo) |
| >$50/mo AI costs | Consider recipe caching, adjust rate limits |
| >1000 MAU | Review auth provider limits |

---

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Supabase
- Database: Use point-in-time recovery (Pro plan)
- Edge Functions: Redeploy previous version from git
