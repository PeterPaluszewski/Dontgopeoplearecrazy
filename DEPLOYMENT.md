# Deployment Guide test2

## Prerequisites

- GitHub account with repository: `PeterPaluszewski/Dontgopeoplearecrazy`
- Vercel account (sign up at https://vercel.com)
- Supabase project with production database

## Step 1: Push Code to GitHub

```bash
git push -u origin save-load
```

Or merge to your main deployment branch (develop/main) and push:

```bash
git checkout develop
git merge save-load
git push origin develop
```

## Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `PeterPaluszewski/Dontgopeoplearecrazy`
4. Vercel will auto-detect Next.js configuration

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

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

## Step 4: Configure Supabase for Production

### Update Authentication Redirect URLs:

1. In Supabase dashboard, go to Authentication → URL Configuration
2. Add your Vercel deployment URL to "Site URL" and "Redirect URLs":
   - `https://your-app-name.vercel.app`
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-app-name.vercel.app/**` (wildcard)

### Enable RLS Policies:

Ensure all tables have RLS enabled and proper policies:

```sql
-- Already configured in your database:
-- ✓ locations (public read access)
-- ✓ items (public read access)
-- ✓ game_events (public read access)
-- ✓ game_states (user-specific access)
```

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Vercel will:
   - Install dependencies (`npm install`)
   - Run type checking
   - Build the Next.js app (`npm run build`)
   - Deploy to production

Build time: ~2-3 minutes

## Step 6: Verify Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://your-app-name.vercel.app`)
2. Test authentication:
   - Register a new account
   - Login with existing account
3. Test game functionality:
   - Load game page
   - View globe with locations
   - Travel between cities
   - Save/load game state
4. Check browser console for errors

## Step 7: Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Add custom domain to Supabase redirect URLs

## Troubleshooting

### Authentication Not Working

- Check Supabase redirect URLs include your Vercel domain
- Verify environment variables are set correctly
- Check browser console for errors

### Database Connection Errors

- Verify Supabase URL and anon key are correct
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
