#!/bin/bash

# Setup script for CI/CD integration tests
# This script helps you configure GitHub secrets for automated testing

set -e

echo "🧪 Integration Test Setup for CI/CD"
echo "===================================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it:"
    echo "   https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub CLI first:"
    gh auth login
fi

echo "📝 This script will set the following GitHub secrets:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - TEST_USER_EMAIL"
echo "   - TEST_USER_PASSWORD"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Get Supabase URL
echo ""
echo "📍 Supabase Project URL"
read -p "Enter your Supabase URL (e.g., https://xyz.supabase.co): " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ URL cannot be empty"
    exit 1
fi

# Get Supabase Anon Key
echo ""
echo "🔑 Supabase Anonymous Key"
echo "   Find this in: Supabase Dashboard → Settings → API → anon/public"
read -p "Enter your anon key: " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Anon key cannot be empty"
    exit 1
fi

# Get Supabase Service Role Key
echo ""
echo "🔐 Supabase Service Role Key"
echo "   Find this in: Supabase Dashboard → Settings → API → service_role"
echo "   ⚠️  WARNING: This key has admin access. Keep it secret!"
read -p "Enter your service role key: " SUPABASE_SERVICE_ROLE_KEY

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Service role key cannot be empty"
    exit 1
fi

# Get test user credentials
echo ""
echo "👤 Test User Credentials"
echo "   Create a dedicated test account for CI/CD"
read -p "Enter test user email: " TEST_USER_EMAIL

if [ -z "$TEST_USER_EMAIL" ]; then
    echo "❌ Email cannot be empty"
    exit 1
fi

read -s -p "Enter test user password: " TEST_USER_PASSWORD
echo ""

if [ -z "$TEST_USER_PASSWORD" ]; then
    echo "❌ Password cannot be empty"
    exit 1
fi

# Confirm before setting secrets
echo ""
echo "📤 Ready to set GitHub secrets"
echo "   Repository: $(gh repo view --json nameWithOwner -q .nameWithOwner)"
echo ""
read -p "Set these secrets now? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Set secrets
echo ""
echo "⚙️  Setting secrets..."

gh secret set SUPABASE_URL --body "$SUPABASE_URL"
echo "✅ SUPABASE_URL set"

gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"
echo "✅ SUPABASE_ANON_KEY set"

gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SUPABASE_SERVICE_ROLE_KEY"
echo "✅ SUPABASE_SERVICE_ROLE_KEY set"

gh secret set TEST_USER_EMAIL --body "$TEST_USER_EMAIL"
echo "✅ TEST_USER_EMAIL set"

gh secret set TEST_USER_PASSWORD --body "$TEST_USER_PASSWORD"
echo "✅ TEST_USER_PASSWORD set"

echo ""
echo "✨ Success! Integration tests are now configured for CI/CD"
echo ""
echo "📋 Next steps:"
echo "   1. Ensure test user ($TEST_USER_EMAIL) exists in Supabase"
echo "   2. Push code to trigger the workflow"
echo "   3. View results in GitHub Actions tab"
echo ""
echo "💡 Test locally first:"
echo "   export NEXT_PUBLIC_SUPABASE_URL=\"$SUPABASE_URL\""
echo "   export NEXT_PUBLIC_SUPABASE_ANON_KEY=\"$SUPABASE_ANON_KEY\""
echo "   export TEST_USER_EMAIL=\"$TEST_USER_EMAIL\""
echo "   export TEST_USER_PASSWORD=\"<your-password>\""
echo "   SKIP_INTEGRATION_TESTS=false npm test -- src/lib/__tests__/save-load.integration.test.ts"
echo ""
