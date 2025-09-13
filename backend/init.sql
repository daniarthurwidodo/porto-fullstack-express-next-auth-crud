-- Optional initialization script for PostgreSQL
-- This file will be executed when the database container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any initial database setup here
-- For example, creating additional schemas, users, or initial data

-- The Sequelize models will handle table creation automatically
-- so no need to create tables manually here
