module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'vue'],
  verbose: true,
  testEnvironment: 'jsdom',
  fakeTimers: {
    enableGlobally: true,
    doNotFake: ['nextTick'],
    timerLimit: 5000,
  },
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest'
  },
  globals: {
    rootDir: './'
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons', 'core-js'],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
      },
  testMatch: [
    '<rootDir>/**/__tests__/*.spec.ts',
  ],
  setupFiles: [`core-js`],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,vue}',
    '!src/router/index.ts',
    '!src/main.ts',
    '!**/*.d.ts'
  ],
  // Accept global coverage of 90% or higher, and 80% for each individual file
  // This should ensure most of the code is covered and leaves us room to skip hard-to-test areas
  // Please only write meaningful and comprehensive tests
  // Please do not write fake tests for higher coverage (e.g. a test that runs all functions without asserting anything)
  coverageThreshold: {
    'global': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/assets/RequestsUtils.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  }
}
