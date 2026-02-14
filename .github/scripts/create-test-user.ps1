# Create Test User in Supabase
# Run this to create a test user for integration tests

$email = "peter@paluszewski.dk"
$password = Read-Host "Enter password for test user" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "Creating test user in Supabase..." -ForegroundColor Cyan
Write-Host ""

# Instructions for creating user in Supabase
Write-Host "Option 1: Via Supabase Dashboard (Recommended)" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "1. Go to: https://supabase.com/dashboard/project/qskyjnpserwxsqrosiym/auth/users"
Write-Host "2. Click 'Add user' button"
Write-Host "3. Enter:"
Write-Host "   Email: $email"
Write-Host "   Password: <the password you just entered>"
Write-Host "   Auto Confirm User: YES (check this box)"
Write-Host "4. Click 'Create user'"
Write-Host ""

Write-Host "Option 2: Via SQL Editor" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow
Write-Host "Go to SQL Editor and run:"
Write-Host ""
Write-Host "-- Create test user" -ForegroundColor Gray
Write-Host "INSERT INTO auth.users (" -ForegroundColor Gray
Write-Host "  instance_id, id, aud, role, email," -ForegroundColor Gray
Write-Host "  encrypted_password, email_confirmed_at," -ForegroundColor Gray
Write-Host "  raw_app_meta_data, raw_user_meta_data," -ForegroundColor Gray
Write-Host "  created_at, updated_at, confirmation_token," -ForegroundColor Gray
Write-Host "  recovery_token" -ForegroundColor Gray
Write-Host ") VALUES (" -ForegroundColor Gray
Write-Host "  '00000000-0000-0000-0000-000000000000'," -ForegroundColor Gray
Write-Host "  gen_random_uuid()," -ForegroundColor Gray
Write-Host "  'authenticated'," -ForegroundColor Gray
Write-Host "  'authenticated'," -ForegroundColor Gray
Write-Host "  '$email'," -ForegroundColor Gray
Write-Host "  crypt('$passwordPlain', gen_salt('bf'))," -ForegroundColor Gray
Write-Host "  now()," -ForegroundColor Gray
Write-Host "  '{\"provider\":\"email\",\"providers\":[\"email\"]}'::jsonb," -ForegroundColor Gray
Write-Host "  '{}'::jsonb," -ForegroundColor Gray
Write-Host "  now()," -ForegroundColor Gray
Write-Host "  now()," -ForegroundColor Gray
Write-Host "  ''," -ForegroundColor Gray
Write-Host "  ''" -ForegroundColor Gray
Write-Host ");" -ForegroundColor Gray
Write-Host ""

Write-Host "After creating the user, run the integration tests again:" -ForegroundColor Cyan
Write-Host "`$env:TEST_USER_EMAIL=`"$email`"" -ForegroundColor Gray
Write-Host "`$env:TEST_USER_PASSWORD=`"$passwordPlain`"" -ForegroundColor Gray
Write-Host "`$env:SKIP_INTEGRATION_TESTS=`"false`"" -ForegroundColor Gray
Write-Host "npm test -- src/lib/__tests__/save-load.integration.test.ts" -ForegroundColor Gray
Write-Host ""
