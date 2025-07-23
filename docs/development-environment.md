# Development Environment Setup

## Prerequisites

### System Requirements
- **Node.js**: v18.x or higher (LTS recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **Docker**: v20.x or higher
- **Docker Compose**: v2.x or higher
- **Git**: v2.x or higher
- **PostgreSQL**: v15.x (for local development without Docker)
- **Redis**: v7.x (for local development without Docker)

### Development Tools (Recommended)
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - REST Client
  - Docker
  - PostgreSQL (cweijan.vscode-postgresql-client2)
- **Database GUI**: pgAdmin, DBeaver, or TablePlus
- **API Testing**: Postman, Insomnia, or VS Code REST Client
- **Git GUI**: GitKraken, SourceTree, or VS Code Git integration

## Quick Start (Docker-based)

### 1. Clone Repository
```bash
git clone https://github.com/your-org/intelligent-assistant.git
cd intelligent-assistant
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
# Set your API keys, database credentials, etc.
```

### 3. Start Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all package dependencies
npm run install:all
```

### 5. Database Setup
```bash
# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### 6. Start Development Servers
```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:frontend    # React app (port 5173)
npm run dev:backend     # API server (port 3000)
npm run dev:ai-engine   # AI service (port 3001)
```

## Manual Setup (Without Docker)

### 1. Install Node.js and npm
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

### 2. Install PostgreSQL
#### Windows
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql
```

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb intelligent_assistant_dev
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE intelligent_assistant_dev;
CREATE USER dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE intelligent_assistant_dev TO dev_user;
\q
```

### 3. Install Redis
#### Windows
```bash
# Download from https://github.com/microsoftarchive/redis/releases
# Or use chocolatey
choco install redis-64
```

#### macOS
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 4. Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit with your local settings
nano .env
```

**Sample .env file:**
```bash
# Database
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/intelligent_assistant_dev
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# OAuth (Development keys - replace with your own)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback

# AI Services
OPENAI_API_KEY=your-openai-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# External Integrations
HUBSPOT_API_KEY=your-hubspot-api-key

# Logging
LOG_LEVEL=debug

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 5. Install Dependencies
```bash
npm install
cd packages/frontend && npm install && cd ../..
cd packages/backend && npm install && cd ../..
cd packages/ai-engine && npm install && cd ../..
cd packages/shared && npm install && cd ../..
```

## Development Workflow

### Available Scripts
```bash
# Development
npm run dev                 # Start all services
npm run dev:frontend        # Start React app only
npm run dev:backend         # Start API server only
npm run dev:ai-engine       # Start AI service only

# Building
npm run build               # Build all packages
npm run build:frontend      # Build React app
npm run build:backend       # Build API server
npm run build:ai-engine     # Build AI service

# Testing
npm run test                # Run all tests
npm run test:frontend       # Run frontend tests
npm run test:backend        # Run backend tests
npm run test:e2e           # Run end-to-end tests
npm run test:watch         # Run tests in watch mode

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run type-check         # Run TypeScript compiler
npm run format             # Format code with Prettier

# Database
npm run db:migrate         # Run database migrations
npm run db:rollback        # Rollback last migration
npm run db:seed            # Seed development data
npm run db:reset           # Reset database (drop, create, migrate, seed)

# Docker
npm run docker:build       # Build Docker images
npm run docker:up          # Start Docker services
npm run docker:down        # Stop Docker services
npm run docker:logs        # View Docker logs
```

### Development Server URLs
```
Frontend:     http://localhost:5173
Backend API:  http://localhost:3000
AI Engine:    http://localhost:3001
Database:     localhost:5432
Redis:        localhost:6379
```

## IDE Configuration

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.workingDirectories": [
    "packages/frontend",
    "packages/backend",
    "packages/ai-engine",
    "packages/shared"
  ],
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### VS Code Extensions
Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "humao.rest-client",
    "ms-azuretools.vscode-docker",
    "cweijan.vscode-postgresql-client2",
    "ms-vscode.vscode-thunder-client"
  ]
}
```

### VS Code Launch Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/backend/src/server.ts",
      "outFiles": ["${workspaceFolder}/packages/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "envFile": "${workspaceFolder}/.env",
      "runtimeArgs": ["-r", "ts-node/register"],
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/packages/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"]
    }
  ]
}
```

## Testing Setup

### Test Database Setup
```bash
# Create test database
createdb intelligent_assistant_test

# Set test environment
export NODE_ENV=test
export DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/intelligent_assistant_test

# Run test migrations
npm run db:migrate
```

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode during development
npm run test:watch
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Reset database
npm run db:reset

# Check logs
tail -f /usr/local/var/log/postgres.log  # macOS
sudo journalctl -u postgresql  # Linux
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear all package node_modules
npm run clean:all
npm run install:all
```

#### Docker Issues
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -f
docker-compose up --build

# View service logs
docker-compose logs backend
docker-compose logs postgres
```

### Performance Optimization

#### Development Server Performance
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Use faster package manager
npm install -g pnpm
pnpm install  # Instead of npm install
```

#### Database Performance
```sql
-- Add development indexes
CREATE INDEX CONCURRENTLY idx_dev_messages_session_timestamp 
ON messages(session_id, timestamp);

-- Analyze tables for better query planning
ANALYZE users;
ANALYZE chat_sessions;
ANALYZE messages;
```

## Security Considerations

### Development Security
- Never commit secrets to version control
- Use `.env` files for sensitive configuration
- Rotate API keys regularly
- Use HTTPS in development when possible
- Enable security headers in development

### Local HTTPS Setup (Optional)
```bash
# Install mkcert
brew install mkcert  # macOS
choco install mkcert  # Windows

# Create local certificates
mkcert -install
mkcert localhost 127.0.0.1 ::1

# Update Vite config to use HTTPS
# See packages/frontend/vite.config.ts
```

This development environment setup provides everything needed to start building the AI-powered administrative assistant application efficiently and securely.