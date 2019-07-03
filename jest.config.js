module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  watchPathIgnorePatterns: ['.+fixtures.+'],
  coveragePathIgnorePatterns: ['node_modules', '.+fixtures.+'],
  testPathIgnorePatterns: ['node_modules', '/cypress/'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '@sapper/app': '<rootDir>/test/sapper.js',
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001, 5056, 2305],
      },
    },
  },
};
