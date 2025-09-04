-- Initialize database for intelligent admin
-- This script runs when the PostgreSQL container starts

-- Create extensions needed for full-text search and performance
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Trigram matching for text search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Remove accents for better search

-- Set timezone for Australian businesses
SET timezone = 'Australia/Sydney';

-- Prisma migrations will create the actual schema