# Deployment Guide

## ✅ Deployed Successfully!

**Live Site:** https://dontgopeoplearecrazy.vercel.app

This app has been successfully deployed to Vercel using both:

- ✅ Vercel CLI (manual deployment)
- ✅ GitHub integration (automatic deployments)

---

## Deployment Methods

### Method 1: Vercel CLI (Recommended for First Deploy)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Advantages:**

- Bypasses GitHub integration issues
- Works with private repositories on free tier
- Faster for quick deployments

### Method 2: GitHub Integration (Automatic Deployments)

Once initially deployed with CLI, automatic deployments work when:

1. Code is pushed to the `develop` branch
2. Vercel automatically builds and deploys
3. Preview deployments for other branches

**Note:** For private repositories on Hobby tier, you may need to:

- Make repository public, OR
- Deploy via CLI, OR
- Upgrade to Vercel Pro

---

## Prerequisites

- GitHub account with repository: `PeterPaluszewski/Dontgopeoplearecrazy`
- Vercel account (sign up at https://vercel.com)
- Supabase project with production database

## Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these variables for Production, Preview, and Development:

### Required Variables:

- **NEXT_PUBLIC_SUPABASE_URL**
  - Value: Your Supabase project URL (from Supabase dashboard)
  - Example: `https://xxxxxxxxxxxxx.supabase.co`

- **NEXT_PUBLIC_SUPABASE_ANON_KEY**
  - Value: Your Supabase anon/public key (from Supabase dashboard)
  - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### How to find Supabase credentials:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" → Use for `NEXT_PUBLIC_SUPABASE_URL`
5. Copy "anon public" key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Supabase Configuration for Production

### ✅ Update Authentication Redirect URLs:

1. In Supabase dashboard, go to Authentication → URL Configuration
2. Set **Site URL** to: `https://dontgopeoplearecrazy.vercel.app`
3. Add **Redirect URLs**:
   - `https://dontgopeoplearecrazy.vercel.app/**`
   - `https://dontgopeoplearecrazy.vercel.app/auth/callback`
   - `http://localhost:3000/**` (for local development)

### Email Verification Setup:

For production emails to work:

1. Go to Authentication → Email Templates
2. Verify the confirmation email uses your Vercel domain
3. **Optional:** Disable email confirmation in Auth settings for testing

### Database Tables (Already Configured):

```sql
-- ✓ locations (public read access)
-- ✓ items (public read access)
-- ✓ game_events (public read access)
-- ✓ game_states (user-specific access with RLS)
```

---

## Verification Checklist

After deployment:

- ✅ Site accessible at production URL
- ✅ Authentication (register/login) works
- ✅ Globe visualization renders correctly
- ✅ Location markers visible and clickable
- ✅ Travel system functional (cost calculation, events)
- ✅ Save/load system persists game state
- ✅ All 148 tests passing in production build
- ✅ No console errors on page load

---

## Troubleshooting

### Private Repository Deployment Issue

**Problem**: "You cannot deploy to a Hobby team from a private repository"

**Solution**: Use Vercel CLI instead of GitHub integration:

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Secret Reference Errors

**Problem**: "Environment Variable references Secret which does not exist"

**Solution**: Set environment variables directly in Vercel dashboard, not as secret references in vercel.json:

- Go to Project Settings → Environment Variables
- Add variables without `@` prefix
- Redeploy

### Authentication Not Working

- Check Supabase redirect URLs include your Vercel domain
- Verify environment variables are set correctly in Vercel
- Check browser console for errors

### Database Connection Errors

- Verify Supabase URL and anon key are correct
- Check RLS policies allow authenticated access
- Ensure game_states table exists with correct schema
- Check RLS policies allow public read access for locations/items
- Ensure game_states table exists with proper schema

### Build Failures

- Run `npm run build` locally to check for errors
- Check Vercel build logs for specific error messages
- Verify all environment variables are set

### 3D Globe Not Loading

- This is expected on first load (Three.js is dynamically imported)
- Check browser console for WebGL errors
- Try a different browser if issues persist

## Continuous Deployment

Once connected, Vercel automatically:

- Deploys on every push to your main branch
- Creates preview deployments for pull requests
- Runs pre-commit checks (lint, format, type-check, tests)

## Performance Optimization

Current bundle size: ~350KB (within targets)

To monitor performance:

1. Enable Vercel Analytics in project settings
2. Check Core Web Vitals in Vercel dashboard
3. Monitor API response times in Supabase dashboard

## Rollback

If deployment has issues:

1. Go to Vercel dashboard → Deployments
2. Find a working previous deployment
3. Click "..." → "Promote to Production"

## Support

- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
