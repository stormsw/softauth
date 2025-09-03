const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  displayName: 'Integration Tests',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/integration/**/*.test.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig)
