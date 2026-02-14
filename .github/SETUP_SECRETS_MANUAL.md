# GitHub Secrets Setup (Manual via Web UI)

Since GitHub CLI is not installed, you can set these secrets manually through GitHub's web interface:

## Steps:

### 1. Go to GitHub Repository Settings
Navigate to: https://github.com/PeterPaluszewski/Dontgopeoplearecrazy/settings/secrets/actions

### 2. Click "New repository secret"

### 3. Add these 5 secrets one by one:

#### Secret 1: SUPABASE_URL
- Name: `SUPABASE_URL`
- Value: Your Supabase project URL
- Example: `https://abcdefghijklm.supabase.co`
- Find it: Supabase Dashboard → Settings → API → Project URL

#### Secret 2: SUPABASE_ANON_KEY
- Name: `SUPABASE_ANON_KEY`
- Value: Your Supabase anonymous/public key
- Find it: Supabase Dashboard → Settings → API → Project API keys → anon/public

#### Secret 3: SUPABASE_SERVICE_ROLE_KEY
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your Supabase service role key
- Find it: Supabase Dashboard → Settings → API → Project API keys → service_role
- **WARNING**: This key has admin access - keep it secret!

#### Secret 4: TEST_USER_EMAIL
- Name: `TEST_USER_EMAIL`
- Value: Email of your test account
- Example: `test@example.com`
- **Note**: Create this user in Supabase first! (Authentication → Users → Add user)

#### Secret 5: TEST_USER_PASSWORD
- Name: `TEST_USER_PASSWORD`
- Value: Password for your test account
- Use a secure password
- Must match the password you set in Supabase

## Verify Setup

After adding all secrets:
1. Go to: https://github.com/PeterPaluszewski/Dontgopeoplearecrazy/settings/secrets/actions
2. You should see all 5 secrets listed (values are hidden)
3. Push code to trigger the workflow
4. Check: https://github.com/PeterPaluszewski/Dontgopeoplearecrazy/actions

## Test Locally First

Before pushing, test integration tests locally:

```powershell
# Set environment variables (use your actual values)
$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
$env:TEST_USER_EMAIL="test@example.com"
$env:TEST_USER_PASSWORD="your-test-password"
$env:SKIP_INTEGRATION_TESTS="false"

# Run integration tests
npm test -- src/lib/__tests__/save-load.integration.test.ts
```

## Optional: Install GitHub CLI

To use the automated script in the future:

### Windows (PowerShell):
```powershell
winget install GitHub.cli
```

### Or download from:
https://cli.github.com/

After installing, restart your terminal and run:
```powershell
gh auth login
```

Then you can use the setup script:
```powershell
.\.github\scripts\setup-integration-tests.ps1
```

## Troubleshooting

### "Can't find test user"
- Go to Supabase Dashboard → Authentication → Users
- Click "Add user" (not "Invite user")
- Enter the same email/password you set in GitHub secrets
- Confirm the user's email is verified

### "Integration tests skipped in GitHub Actions"
- Make sure all 5 secrets are set
- Check spelling matches exactly (case-sensitive)
- Look at workflow run logs: https://github.com/PeterPaluszewski/Dontgopeoplearecrazy/actions

### "Tests fail with authentication error"
- Verify test user exists in Supabase
- Check password matches between Supabase and GitHub secret
- Ensure user's email is confirmed in Supabase
