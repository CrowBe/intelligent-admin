#!/bin/bash

# Development Environment Setup Script
# Run this script to set up the complete development environment

set -e

echo "🚀 Setting up Intelligent Assistant development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker version: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker Compose version: $(docker-compose --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install:all

# Copy environment files
echo "🔧 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from example"
else
    echo "⚠️  .env file already exists, skipping..."
fi

if [ ! -f .env.test ]; then
    cp .env.test.example .env.test
    echo "✅ Created .env.test file from example"
else
    echo "⚠️  .env.test file already exists, skipping..."
fi

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Generate Prisma client and run migrations
echo "🗄️  Setting up database..."
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
cd ..

echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Review and update .env file with your API keys"
echo "  2. Run 'npm run dev' to start the development servers"
echo "  3. Open http://localhost:5173 in your browser"
echo "  4. Open VS Code workspace: code .vscode/intelligent-assistant.code-workspace"
echo ""
echo "🛠️  Useful commands:"
echo "  npm run dev         - Start both frontend and backend"
echo "  npm run test        - Run all tests"
echo "  npm run lint        - Run linting"
echo "  npm run type-check  - Run type checking"
echo "  npm run docker:logs - View Docker logs"