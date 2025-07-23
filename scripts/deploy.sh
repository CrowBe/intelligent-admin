#!/bin/bash

# Deployment script
set -e

echo "🚀 Deploying Intelligent Assistant..."

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "❌ Deployment only allowed from 'main' or 'develop' branch. Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Run build process
echo "🏗️  Running build process..."
./scripts/build.sh

# Build Docker images for production
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

# Tag images
echo "🏷️  Tagging images..."
docker tag intelligent-assistant-backend:latest your-registry/intelligent-assistant-backend:$(git rev-parse --short HEAD)
docker tag intelligent-assistant-frontend:latest your-registry/intelligent-assistant-frontend:$(git rev-parse --short HEAD)

echo "✅ Deployment preparation complete!"
echo "📋 Next steps:"
echo "  1. Push images to registry"
echo "  2. Update deployment configuration"
echo "  3. Deploy to production environment"