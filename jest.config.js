/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: ['.ts'],
  verbose: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
  },
};
