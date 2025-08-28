# GitHub Actions Setup Guide

This guide helps you set up automated Docker container builds using GitHub Actions.

## Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **GitHub Container Registry**: Enabled automatically with GitHub Actions

## Setup Steps

### 1. Push Code to GitHub
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Add weather app with GitHub Actions automation"

# Add GitHub remote (replace USER/REPO with your details)
git remote add origin https://github.com/USER/REPO.git

# Push to main branch
git push -u origin main
```

### 2. Enable GitHub Container Registry
- Go to your repository on GitHub.com
- Navigate to Settings → Actions → General
- Under "Workflow permissions", select "Read and write permissions"
- Check "Allow GitHub Actions to create and approve pull requests"

### 3. Update Repository URLs
Edit the following files to replace `USER/REPO` with your GitHub username and repository name:

**README.md**:
- Line 3-4: Update badge URLs
- Lines 204-205: Update Docker image references

### 4. Workflow Triggers

The workflows will automatically trigger on:
- **Pushes** to `main` or `develop` branches
- **Pull requests** to `main` branch

## Workflow Details

### Docker Build Workflow
**File**: `.github/workflows/docker-build.yml`

**Features**:
- Multi-architecture builds (AMD64, ARM64)
- Automatic image tagging (branch name, SHA, latest)
- Build caching for faster builds
- Pushes to GitHub Container Registry

**Image Naming**:
- `ghcr.io/USER/REPO:main` (latest from main branch)
- `ghcr.io/USER/REPO:develop` (from develop branch)
- `ghcr.io/USER/REPO:sha-abc123` (specific commit)

### Docker Compose Test Workflow
**File**: `.github/workflows/docker-compose-test.yml`

**Tests**:
- Container builds successfully
- Application starts and responds to health checks
- API endpoints return valid responses
- Web interface serves correctly

## Using Built Images

### Option 1: Docker Run
```bash
# Pull and run latest image
docker run -p 8080:3000 ghcr.io/USER/REPO:latest
```

### Option 2: Update Docker Compose
Edit `docker-compose.yml`:
```yaml
services:
  weather-app:
    # Comment out the build line:
    # build: .
    
    # Add image reference:
    image: ghcr.io/USER/REPO:latest
    
    ports:
      - "8080:3000"
    # ... rest of configuration
```

## Monitoring Builds

1. **Actions Tab**: Go to your GitHub repository → Actions tab
2. **Build Status**: Check workflow run status and logs
3. **Container Registry**: View published images in Packages tab

## Troubleshooting

### Build Fails
- Check Actions tab for detailed error logs
- Ensure Dockerfile builds successfully locally
- Verify all dependencies are included

### Permission Errors
- Confirm "Read and write permissions" are enabled in repository settings
- Check that GITHUB_TOKEN has package write permissions

### Container Registry Issues
- Verify container registry is enabled for your account
- Check image naming conventions match the workflow

## Security Notes

- Workflows use GITHUB_TOKEN (automatically provided)
- No manual secrets required for basic functionality
- Images are public by default (change in repository packages settings)
- Builds run in isolated GitHub runners

## Next Steps

After setup:
1. Make a code change and push to trigger the workflow
2. Monitor the Actions tab for build progress  
3. Check the Packages tab to see your published container image
4. Test deploying the published image instead of building locally