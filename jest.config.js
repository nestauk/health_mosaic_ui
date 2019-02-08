module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  watchPathIgnorePatterns: ['.+fixtures.+'],
  coveragePathIgnorePatterns: ['node_modules', '.+fixtures.+'],
  testPathIgnorePatterns: ['/node_modules/', '/cypress/'],
  testEnvironment: 'node',
  setupFiles: ['./setupJest.js'],
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001, 5056, 2305],
      },
    },
  },
};
