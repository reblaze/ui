module.exports = {
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'vue'],
      verbose: true,
      moduleDirectories: ['node_modules', 'src'],
      testEnvironment: 'jsdom',
      fakeTimers: {
        enableGlobally: true,
        doNotFake: ['nextTick'],
        timerLimit: 5000,
      },
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.vue$': '@vue/vue3-jest',
        '\\.js?$': 'babel-jest',
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': '<rootDir>/fileTransformer.js'
      },
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons', 'core-js'],
     },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^~/(.*)$': '<rootDir>/$1',
        'ace-builds': '<rootDir>/node_modules/ace-builds'
      },
      testMatch: [
        '<rootDir>/**/*.spec.(js|jsx|ts|tsx)',
        '<rootDir>/**/__tests__/*.spec.ts',
        "**/__tests__/**/*.tsx",
        "**/?(*.)+(spec|test).[jt]s?(x)"
      ],
      setupFiles: [`core-js`],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      transformIgnorePatterns: ['<rootDir>/node_modules/'],
      collectCoverage: true,
      collectCoverageFrom: [
        'src/**/*.{ts,vue}',
        '!src/router/index.ts',
        '!coverage/*',
        '!src/main.ts',
        '!**/*.d.ts',
      ],
      // rootDir: path.resolve(process.cwd(),"."),
      // modulePathIgnorePatterns: [
      //   "<rootDir>/\.yalc/@tgcs/.*/\.yalc"
      // ],
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
      },
};
