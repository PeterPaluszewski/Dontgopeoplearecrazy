# GitHub Actions for Unity - Setup Guide

## Overview

This project uses GitHub Actions to automatically:
- ✅ Run tests on every push/PR
- ✅ Generate code coverage reports
- ✅ Build the game for multiple platforms
- ✅ Create release builds on tags

## Workflows

### 1. `unity-tests.yml` - Continuous Testing
**Triggers:** Every push to `main` and `pejp/main_scene`, all PRs to `main`

**What it does:**
- Runs EditMode tests (fast, no Unity runtime)
- Runs PlayMode tests (full Unity environment)
- Generates code coverage reports
- Uploads test results and coverage as artifacts
- Creates coverage badges

**Results visible:**
- GitHub Actions tab
- PR checks
- Test results attached to each run

### 2. `unity-build.yml` - Automated Builds
**Triggers:** Pushes to `main` and version tags (e.g., `v1.0.0`)

**What it does:**
- Builds for Windows 64-bit
- Builds for Linux 64-bit
- (Optional) Mac builds
- Uploads build artifacts

## Setup Instructions

### Step 1: Activate Unity License

You need to add Unity credentials to GitHub Secrets:

1. **Go to your GitHub repository**
2. **Settings > Secrets and variables > Actions**
3. **Click "New repository secret"**

Add these three secrets:

#### For Personal License (Free):

Run this locally to get your license file:
```bash
# Request activation file
Unity.exe -quit -batchmode -createManualActivationFile

# Upload the .alf file to: https://license.unity3d.com/manual
# Download the .ulf license file

# Convert to base64 for GitHub
# On Windows PowerShell:
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("Unity_v2022.x.ulf"))

# On Linux/Mac:
base64 Unity_v2022.x.ulf
```

Then add secrets:
- `UNITY_LICENSE`: The base64 string from above
- `UNITY_EMAIL`: Your Unity account email
- `UNITY_PASSWORD`: Your Unity account password

#### For Pro License:

Add secrets:
- `UNITY_SERIAL`: Your Unity serial number
- `UNITY_EMAIL`: Your Unity account email  
- `UNITY_PASSWORD`: Your Unity account password

And update the workflows to use `unityVersion` parameter.

### Step 2: Commit Workflows

```bash
git add .github/workflows/
git commit -m "Add GitHub Actions CI/CD workflows"
git push
```

### Step 3: Check Results

- Go to **Actions** tab in GitHub
- You'll see workflows running
- Click on any run to see logs
- Download artifacts (test results, builds) from completed runs

## Viewing Test Results

### In GitHub
1. Go to **Actions** tab
2. Click on a workflow run
3. See test results in the summary
4. Download "Test Results" artifact for XML reports

### Locally with Artifacts
```bash
# Download artifact from GitHub Actions
# Extract and view HTML reports
```

## Code Coverage

Coverage reports show:
- Lines covered by tests
- Branches covered
- Overall percentage

**View coverage:**
1. Actions tab > Workflow run
2. Download "Coverage Results" artifact
3. Open `index.html` in browser

## Build Artifacts

When builds complete:
1. Go to Actions > Build workflow
2. Download "Build-StandaloneWindows64" (or Linux/Mac)
3. Extract and run the game

## Continuous Integration Best Practices

### 1. Run Tests Locally First
```bash
# Before pushing, verify tests pass in Unity Test Runner
```

### 2. Watch for Failures
- GitHub will email you if builds/tests fail
- Fix quickly to keep main branch green
- PRs should not be merged with failing tests

### 3. Use PRs for Development
- Create feature branches
- Open PR to main
- Tests run automatically
- Merge when green ✅

### 4. Version Tags for Releases
```bash
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0
```
This triggers a build you can distribute!

## Cost Considerations

**GitHub Actions Free Tier:**
- 2,000 minutes/month for private repos
- Unlimited for public repos

**Unity builds use about:**
- EditMode tests: ~2-3 minutes
- PlayMode tests: ~5-10 minutes  
- Windows build: ~15-20 minutes
- Total per push: ~20-30 minutes

**Tips to save minutes:**
- Use caching (already configured)
- Run tests on feature branches, builds only on main
- Use self-hosted runners for unlimited minutes

## Troubleshooting

### "License activation failed"
- Verify secrets are set correctly
- Check Unity email/password are correct
- Personal license: Use base64 encoded .ulf file

### "Tests fail in CI but pass locally"
- Check Unity version matches (2022.3.x)
- Look at test logs in Actions tab
- May need to adjust test timeouts

### "Build takes too long"
- Enable better caching
- Remove unused asset packages
- Build only for needed platforms

## Advanced: Self-Hosted Runners

For unlimited minutes, set up a self-hosted runner:

1. **Settings > Actions > Runners > New self-hosted runner**
2. Follow setup instructions for your OS
3. Update workflows to use: `runs-on: self-hosted`

Benefits:
- Unlimited build minutes
- Faster builds (local hardware)
- No secret management needed

## Status Badges

Add to your README.md:

```markdown
![Tests](https://github.com/PeterPaluszewski/Dontgopeoplearecrazy/actions/workflows/unity-tests.yml/badge.svg)
![Build](https://github.com/PeterPaluszewski/Dontgopeoplearecrazy/actions/workflows/unity-build.yml/badge.svg)
```

Shows build/test status on your repo page!
