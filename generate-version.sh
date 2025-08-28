#!/bin/bash

# Generate version.json file with build information
# This runs outside the container to avoid installing git inside

COMMIT_SHA=${COMMIT_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo "dev")}
BUILD_DATE=${BUILD_DATE:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}
VERSION=${VERSION:-"local"}

echo "Generating version.json with:"
echo "  Commit SHA: $COMMIT_SHA"
echo "  Build Date: $BUILD_DATE"  
echo "  Version: $VERSION"

cat > version.json << EOF
{
  "commitSha": "$COMMIT_SHA",
  "buildDate": "$BUILD_DATE",
  "version": "$VERSION"
}
EOF

echo "Version file generated successfully."