import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', 'test.env') });

// Set test environment
process.env.NODE_ENV = 'test';

// Set default test database URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/mcpforge';
}

// Set default GitHub OAuth configuration for tests
if (!process.env.GITHUB_CLIENT_ID) {
  process.env.GITHUB_CLIENT_ID = 'test_client_id';
}

if (!process.env.GITHUB_CLIENT_SECRET) {
  process.env.GITHUB_CLIENT_SECRET = 'test_client_secret';
}

if (!process.env.GITHUB_CALLBACK_URL) {
  process.env.GITHUB_CALLBACK_URL = 'http://localhost:8443/user/auth/github/callback';
}

if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = 'http://localhost:3000';
}

// Increase timeout for async operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
  console.log('🧪 Starting GitHub OAuth Integration Tests');
});

afterAll(async () => {
  // Any global cleanup can go here
  console.log('✅ GitHub OAuth Integration Tests Completed');
});

// Mock console methods in test environment to reduce noise
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
} 