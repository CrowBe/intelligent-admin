#!/bin/bash

# Build script for production
set -e

echo "🏗️  Building Intelligent Assistant..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Type check all packages
echo "🔍 Running type checks..."
npm run type-check

# Lint all packages
echo "🧹 Running linters..."
npm run lint

# Build all packages
echo "🏗️  Building packages..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm run test

echo "✅ Build completed successfully!"
echo "📦 Built packages are in the 'dist' directories"