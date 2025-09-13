import { Sequelize } from 'sequelize';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

// Mock database connection
jest.mock('../config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock logger to prevent console output during tests
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
  },
  authLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  userLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  serverLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    fatal: jest.fn(),
  },
  dbLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
  errorLogger: {
    error: jest.fn(),
  },
}));
