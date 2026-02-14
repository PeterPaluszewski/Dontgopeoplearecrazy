# CI/CD Integration Test Setup

## Required GitHub Secrets

To run integration tests before deployment, configure these secrets in your GitHub repository:

### Supabase Secrets
1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_ANON_KEY` - Public anonymous key
3. `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)

### Test User Credentials
4. `TEST_USER_EMAIL` - Email for dedicated test account
5. `TEST_USER_PASSWORD` - Password for test account

### Optional: Deployment
6. `VERCEL_TOKEN` - Vercel deployment token
7. `VERCEL_ORG_ID` - Your Vercel organization ID
8. `VERCEL_PROJECT_ID` - Your Vercel project ID
9. `CODECOV_TOKEN` - (Optional) For coverage reports

## Setting Up GitHub Secrets

### Via GitHub UI:
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret one by one

### Via GitHub CLI:
```bash
# Install GitHub CLI: https://cli.github.com/

# Login
gh auth login

# Set secrets
gh secret set SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "your-anon-key-here"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-service-role-key-here"
gh secret set TEST_USER_EMAIL --body "test@example.com"
gh secret set TEST_USER_PASSWORD --body "secure-test-password"
```

## Creating a Test User

### Option 1: Via Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Create user with `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`

### Option 2: Via SQL
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('secure-test-password', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);
```

### Option 3: Via Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create test user (requires custom function)
```

## Workflow Behavior

### On Pull Request:
1. ✅ Run unit tests (always)
2. ✅ Run integration tests (if secrets available)
3. ❌ Don't deploy

### On Push to Main:
1. ✅ Run unit tests
2. ✅ Run integration tests
3. ✅ Deploy to production (only if tests pass)

### Manual Trigger:
You can manually trigger the workflow from GitHub Actions tab.

## Testing Locally

Before pushing, test integration tests locally:

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="secure-password"

# Run integration tests
SKIP_INTEGRATION_TESTS=false npm test -- src/lib/__tests__/save-load.integration.test.ts
```

## Security Considerations

### ✅ Best Practices:
- Use a dedicated test account (not your personal account)
- Limit test user permissions via RLS policies
- Test user should only access test data
- Rotate test credentials periodically
- Don't commit secrets to git

### 🔒 RLS Policy for Test User:
```sql
-- Allow test user to create/read/update/delete only their own data
CREATE POLICY "Test user data isolation"
ON game_states
FOR ALL
USING (auth.uid() = user_id);
```

## Troubleshooting

### "Integration tests skipped"
- Check that `SKIP_INTEGRATION_TESTS=false` is set
- Verify secrets are configured in GitHub

### "Authentication failed"
- Verify test user exists in Supabase
- Check email/password are correct
- Ensure user's email is confirmed

### "Permission denied" errors
- Check RLS policies
- Verify test user has correct permissions
- Check service role key is valid

### Tests fail locally but pass in CI (or vice versa)
- Different database state
- Check environment variables match
- Verify you're using same Supabase project

## Monitoring

View test results and logs:
1. Go to **Actions** tab in GitHub
2. Click on a workflow run
3. Expand "Run integration tests" step
4. View logs and test output

## Cost Implications

Running integration tests in CI:
- Uses Supabase database operations (usually within free tier)
- GitHub Actions minutes (free for public repos, limited for private)
- Consider using branch protection rules to limit test frequency

## Alternative: Separate Test Database

For production apps, consider:
1. Create a separate Supabase project for testing
2. Use different secrets for test vs production
3. Seed test database with known data
4. Reset test database between runs

```yaml
# .github/workflows/integration-tests.yml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
```
