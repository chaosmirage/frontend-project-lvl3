module.exports = {
  preset: 'ts-jest',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  verbose: true,
  testURL: 'http://localhost/',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transform: {
    '^.+\\.html?$': 'html-loader-jest',
  },
  moduleFileExtensions: ['js', 'ts', 'html'],
};
