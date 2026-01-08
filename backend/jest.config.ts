// jest.config.cjs or jest.config.ts
export default {
  testEnvironment: "node",
  preset: "ts-jest/presets/default-esm", // important for ESM + TS
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // map .js imports to TS files
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"], // your Prisma setup
  testTimeout: 30000, // 30s timeout for DB integration tests
};
