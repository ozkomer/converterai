// Test setup file
const path = require('path');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to silence console.log during tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
