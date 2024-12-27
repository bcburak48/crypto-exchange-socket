/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Ignore compiled files in dist/ (if you don't want to test them)
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // If your .test.ts files are inside a tests/ folder
  testMatch: ['**/tests/**/*.test.ts'],

  // Helps if you have ESM modules or special transforms
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
