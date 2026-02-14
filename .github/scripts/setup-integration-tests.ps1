# Setup script for CI/CD integration tests (PowerShell version)
# This script helps you configure GitHub secrets for automated testing

$ErrorActionPreference = "Stop"

Write-Host "Integration Test Setup for CI/CD" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
try {
    $null = gh --version
} catch {
    Write-Host "ERROR: GitHub CLI not found. Please install it:" -ForegroundColor Red
    Write-Host "   https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
try {
    $null = gh auth status 2>&1
} catch {
    Write-Host "Please login to GitHub CLI first:" -ForegroundColor Yellow
    gh auth login
}

Write-Host "This script will set the following GitHub secrets:" -ForegroundColor Green
Write-Host "   - SUPABASE_URL"
Write-Host "   - SUPABASE_ANON_KEY"
Write-Host "   - SUPABASE_SERVICE_ROLE_KEY"
Write-Host "   - TEST_USER_EMAIL"
Write-Host "   - TEST_USER_PASSWORD"
Write-Host ""

$continue = Read-Host "Continue? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

# Get Supabase URL
Write-Host ""
Write-Host "Supabase Project URL" -ForegroundColor Cyan
$SUPABASE_URL = Read-Host "Enter your Supabase URL (e.g. https://xyz.supabase.co)"

if ([string]::IsNullOrWhiteSpace($SUPABASE_URL)) {
    Write-Host "❌ URL cannot be empty" -ForegroundColor Red
    exit 1
}

# Get Supabase Anon Key
Write-Host ""
Write-Host "Supabase Anonymous Key" -ForegroundColor Cyan
Write-Host "   Find this in: Supabase Dashboard → Settings → API → anon/public" -ForegroundColor Gray
$SUPABASE_ANON_KEY = Read-Host "Enter your anon key"

if ([string]::IsNullOrWhiteSpace($SUPABASE_ANON_KEY)) {
    Write-Host "❌ Anon key cannot be empty" -ForegroundColor Red
    exit 1
}

# Get Supabase Service Role Key
Write-Host ""
Write-Host "Supabase Service Role Key" -ForegroundColor Cyan
Write-Host "   Find this in: Supabase Dashboard → Settings → API → service_role" -ForegroundColor Gray
Write-Host "   WARNING: This key has admin access. Keep it secret!" -ForegroundColor Yellow
$SUPABASE_SERVICE_ROLE_KEY = Read-Host "Enter your service role key"

if ([string]::IsNullOrWhiteSpace($SUPABASE_SERVICE_ROLE_KEY)) {
    Write-Host "❌ Service role key cannot be empty" -ForegroundColor Red
    exit 1
}

# Get test user credentials
Write-Host ""
Write-Host "Test User Credentials" -ForegroundColor Cyan
Write-Host "   Create a dedicated test account for CI/CD" -ForegroundColor Gray
$TEST_USER_EMAIL = Read-Host "Enter test user email"

if ([string]::IsNullOrWhiteSpace($TEST_USER_EMAIL)) {
    Write-Host "❌ Email cannot be empty" -ForegroundColor Red
    exit 1
}

$TEST_USER_PASSWORD = Read-Host "Enter test user password" -AsSecureString
$TEST_USER_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($TEST_USER_PASSWORD)
)

if ([string]::IsNullOrWhiteSpace($TEST_USER_PASSWORD_PLAIN)) {
    Write-Host "❌ Password cannot be empty" -ForegroundColor Red
    exit 1
}

# Confirm before setting secrets
Write-Host ""
Write-Host "Ready to set GitHub secrets" -ForegroundColor Green
$repoInfo = gh repo view --json nameWithOwner | ConvertFrom-Json
Write-Host "   Repository: $($repoInfo.nameWithOwner)" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Set these secrets now? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

# Set secrets
Write-Host ""
Write-Host "Setting secrets..." -ForegroundColor Cyan

gh secret set SUPABASE_URL --body $SUPABASE_URL
Write-Host "[OK] SUPABASE_URL set" -ForegroundColor Green

gh secret set SUPABASE_ANON_KEY --body $SUPABASE_ANON_KEY
Write-Host "[OK] SUPABASE_ANON_KEY set" -ForegroundColor Green

gh secret set SUPABASE_SERVICE_ROLE_KEY --body $SUPABASE_SERVICE_ROLE_KEY
Write-Host "[OK] SUPABASE_SERVICE_ROLE_KEY set" -ForegroundColor Green

gh secret set TEST_USER_EMAIL --body $TEST_USER_EMAIL
Write-Host "[OK] TEST_USER_EMAIL set" -ForegroundColor Green

gh secret set TEST_USER_PASSWORD --body $TEST_USER_PASSWORD_PLAIN
Write-Host "[OK] TEST_USER_PASSWORD set" -ForegroundColor Green

Write-Host ""
Write-Host "Success! Integration tests are now configured for CI/CD" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Ensure test user ($TEST_USER_EMAIL) exists in Supabase"
Write-Host "   2. Push code to trigger the workflow"
Write-Host "   3. View results in GitHub Actions tab"
Write-Host ""
Write-Host "Test locally first:" -ForegroundColor Cyan
Write-Host "   `$env:NEXT_PUBLIC_SUPABASE_URL=`"$SUPABASE_URL`""
Write-Host "   `$env:NEXT_PUBLIC_SUPABASE_ANON_KEY=`"$SUPABASE_ANON_KEY`""
Write-Host "   `$env:TEST_USER_EMAIL=`"$TEST_USER_EMAIL`""
Write-Host "   `$env:TEST_USER_PASSWORD=`"<your-password>`""
Write-Host "   `$env:SKIP_INTEGRATION_TESTS=`"false`"; npm test -- src/lib/__tests__/save-load.integration.test.ts"
Write-Host ""
