-- Initialize database for intelligent assistant
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist (though it's created by environment variables)
-- CREATE DATABASE IF NOT EXISTS intelligent_assistant_dev;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'Australia/Sydney';

-- Create basic tables (Prisma will handle migrations, but this ensures extensions)
-- Prisma migrations will create the actual schema