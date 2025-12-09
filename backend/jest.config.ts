module.exports = {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/src",
    "<rootDir>/tests"
  ],
  "testMatch": [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/types/**",
    "!src/**/*.interface.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 75,
      "functions": 85,
      "lines": 80,
      "statements": 80
    }
  },
  "setupFilesAfterEnv": [
    "<rootDir>/tests/setup.ts"
  ],
  "testTimeout": 30000,
  "verbose": true,
  "detectOpenHandles": true,
  "forceExit": true,
  "maxWorkers": 1,
  "globalSetup": "<rootDir>/tests/globalSetup.ts",
  "globalTeardown": "<rootDir>/tests/globalTeardown.ts"
};